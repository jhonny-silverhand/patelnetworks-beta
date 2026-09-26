import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/server/services/payment.service';
import { prisma } from '@/server/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[RAZORPAY WEBHOOK] Invalid signature detected.');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    console.log(`[RAZORPAY WEBHOOK] Received event: ${event.event}`);

    // Handle payment.captured or order.paid
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const orderNumber =
        orderEntity?.receipt ||
        paymentEntity?.notes?.orderNumber ||
        orderEntity?.notes?.orderNumber;

      if (!orderNumber) {
        console.warn('[RAZORPAY WEBHOOK] Order number not found in webhook payload notes/receipt.');
        return NextResponse.json({ received: true, note: 'No orderNumber attached' });
      }

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { payments: true },
      });

      if (!order) {
        console.warn(`[RAZORPAY WEBHOOK] Order #${orderNumber} not found in database.`);
        return NextResponse.json({ received: true, note: 'Order not found' });
      }

      // Idempotency: if already paid, skip duplicate transition
      if (order.status === OrderStatus.PAID) {
        console.log(`[RAZORPAY WEBHOOK] Order #${orderNumber} is already marked as PAID.`);
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      // Atomically mark order as PAID and update payment
      await prisma.$transaction(async (tx) => {
        const paymentRecord = order.payments[0];
        if (paymentRecord) {
          await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: PaymentStatus.SUCCESS,
              gatewayPaymentId: paymentEntity?.id || 'webhook_captured',
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: OrderStatus.PAID,
            comment: `Webhook ${event.event} confirmed payment ID: ${paymentEntity?.id || 'N/A'}`,
            changedBy: 'Razorpay Webhook Handler',
          },
        });
      });

      console.log(`[RAZORPAY WEBHOOK] Successfully transitioned Order #${orderNumber} to PAID.`);

      // Trigger automated WhatsApp order confirmation notification (Phase 6)
      try {
        const { sendOrderConfirmationWhatsApp } = await import('@/server/services/whatsapp.service');
        sendOrderConfirmationWhatsApp(order.id).catch((e) =>
          console.warn('[WHATSAPP RAZORPAY WEBHOOK ERROR]', e.message)
        );
      } catch (e: any) {
        console.warn('[WHATSAPP IMPORT ERROR]', e.message);
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderNumber = paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: { payments: true },
        });

        if (order && order.payments[0]) {
          await prisma.payment.update({
            where: { id: order.payments[0].id },
            data: {
              status: PaymentStatus.FAILED,
              gatewayPaymentId: paymentEntity?.id,
            },
          });

          await prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: order.status,
              comment: `Payment failed via webhook. Reason: ${paymentEntity?.error_description || 'Unknown'}`,
              changedBy: 'Razorpay Webhook',
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[RAZORPAY WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failure' },
      { status: 500 }
    );
  }
}
