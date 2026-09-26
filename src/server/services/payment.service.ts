import crypto from 'crypto';
import { prisma } from '@/server/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { transitionOrderStatus } from './order.service';

export interface VerifyPaymentInput {
  orderNumber: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export class PaymentService {
  private static isMockMode(): boolean {
    const key = process.env.RAZORPAY_KEY_ID;
    return !key || key.includes('placeholder') || key.startsWith('rzp_test_placeholder');
  }

  /**
   * Creates an order on Razorpay or generates a mock order ID in test mode
   */
  static async createRazorpayOrder(orderNumber: string, amountPaise: number) {
    if (this.isMockMode()) {
      return {
        id: `order_sim_${Date.now()}`,
        amount: amountPaise,
        currency: 'INR',
        isSimulated: true,
      };
    }

    const authHeader = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: { orderNumber },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Razorpay Order creation failed: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      isSimulated: false,
    };
  }

  /**
   * Verifies Razorpay HMAC SHA-256 signature or validates simulated signature
   */
  static verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ): boolean {
    if (this.isMockMode()) {
      return signature === 'simulated_signature' || signature.startsWith('sim_');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Verifies Razorpay Webhook HMAC SHA-256 signature
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret || secret.includes('placeholder')) {
      return true; // Allow simulated webhook in mock mode
    }
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Completes a paid order atomically
   */
  static async completePayment(input: VerifyPaymentInput) {
    const order = await prisma.order.findUnique({
      where: { orderNumber: input.orderNumber },
      include: { payments: true, customer: { include: { user: true } }, items: true },
    });

    if (!order) {
      throw new Error(`Order ${input.orderNumber} not found.`);
    }

    if (order.status === OrderStatus.PAID) {
      return { status: 'already_paid', order };
    }

    // Verify signature
    const isValid = this.verifySignature(
      input.razorpayOrderId || 'order_sim',
      input.razorpayPaymentId,
      input.razorpaySignature || 'simulated_signature'
    );

    if (!isValid) {
      throw new Error('Invalid payment signature verification failed.');
    }

    // Process payment success inside transaction
    return await prisma.$transaction(async (tx) => {
      // Update Payment Record
      const payment = order.payments[0];
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayPaymentId: input.razorpayPaymentId,
          },
        });
      }

      // Transition order status to PAID
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });

      // Log status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PAID,
          comment: `Payment of ₹${order.totalAmount} captured via Razorpay (${input.razorpayPaymentId})`,
          changedBy: 'Razorpay Gateway',
        },
      });

      // Send simulated WhatsApp notification (ADR-007)
      console.log(
        `\x1b[32m[WHATSAPP ALERT]\x1b[0m Order #${order.orderNumber} PAID: ₹${order.totalAmount} by ${order.customer.fullName} (${order.customer.user.phone})`
      );

      return { status: 'success', order: updatedOrder };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }
}
