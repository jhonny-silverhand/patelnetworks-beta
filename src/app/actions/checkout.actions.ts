'use server';

import { z } from 'zod';
import { createOrderFromCart } from '@/server/services/order.service';
import { PaymentService } from '@/server/services/payment.service';

const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  paymentMethod: z.enum(['RAZORPAY', 'CASH_ON_DELIVERY']),
  isB2B: z.boolean().default(false),
  companyName: z.string().optional(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid 15-character Indian GSTIN format'
    )
    .optional()
    .or(z.literal('')),
});

export async function processCheckoutAction(formData: unknown) {
  try {
    const validated = checkoutSchema.parse(formData);

    if (validated.isB2B && (!validated.companyName || !validated.gstin)) {
      return {
        success: false,
        error: 'Legal Business Name and GSTIN are required for B2B Tax Invoices.',
      };
    }

    const order = await createOrderFromCart({
      cartId: validated.cartId,
      recipientName: validated.recipientName,
      phone: `+91${validated.phone}`,
      email: validated.email || undefined,
      addressLine1: validated.addressLine1,
      addressLine2: validated.addressLine2,
      city: validated.city,
      state: validated.state,
      pincode: validated.pincode,
      paymentMethod: validated.paymentMethod,
      isB2B: validated.isB2B,
      companyName: validated.companyName,
      gstin: validated.gstin,
    });

    // If Razorpay, generate order details
    let razorpayOrder = null;
    if (validated.paymentMethod === 'RAZORPAY') {
      razorpayOrder = await PaymentService.createRazorpayOrder(
        order.orderNumber,
        Number(order.totalAmount) * 100 // Convert to paise
      );
    } else if (validated.paymentMethod === 'CASH_ON_DELIVERY') {
      // Trigger WhatsApp confirmation for Cash on Delivery orders
      try {
        const { sendOrderConfirmationWhatsApp } = await import('@/server/services/whatsapp.service');
        sendOrderConfirmationWhatsApp(order.id).catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          console.warn('[WHATSAPP COD CONFIRMATION ERROR]', msg);
        });
      } catch {
        // Non-blocking
      }
    }

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      paymentMethod: validated.paymentMethod,
      totalAmount: Number(order.totalAmount),
      razorpayOrder,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Validation error' };
    }
    const msg = err instanceof Error ? err.message : 'Checkout failed';
    return { success: false, error: msg };
  }
}

export async function confirmPaymentAction(input: {
  orderNumber: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}) {
  try {
    const result = await PaymentService.completePayment(input);

    // Trigger WhatsApp confirmation for verified online payments
    try {
      const { sendOrderConfirmationWhatsApp } = await import('@/server/services/whatsapp.service');
      const { prisma } = await import('@/server/db');
      const ord = await prisma.order.findUnique({ where: { orderNumber: input.orderNumber } });
      if (ord) {
        sendOrderConfirmationWhatsApp(ord.id).catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          console.warn('[WHATSAPP PAYMENT CONFIRMATION ERROR]', msg);
        });
      }
    } catch {
      // Non-blocking
    }

    return { success: true, result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment confirmation failed';
    return { success: false, error: msg };
  }
}
