import { prisma } from '@/server/db';
import { Prisma } from '@prisma/client';
import { formatPrice } from '@/lib/utils';

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: { fallback_value: string; code: string; amount_1000: number };
  date_time?: { fallback_value: string };
}

export interface WhatsAppSendOptions {
  templateName: string;
  languageCode?: string;
  headerImageUrl?: string;
  bodyParameters: string[];
  buttonUrlParameter?: string; // Suffix for dynamic URL buttons (e.g. orderNumber)
  orderId?: string;
}

/**
 * Checks if live Meta WhatsApp Business API credentials are provided.
 */
export function isWhatsAppLiveConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  return (
    Boolean(token && phoneId) &&
    !token.includes('placeholder') &&
    !phoneId.includes('placeholder')
  );
}

/**
 * Normalizes an Indian phone number to digits-only with 91 country code.
 */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Core WhatsApp notification dispatcher supporting live Meta Graph API and senior sandbox simulation.
 */
export async function sendWhatsAppNotification(
  recipientPhone: string,
  options: WhatsAppSendOptions
): Promise<{
  success: boolean;
  messageId: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  error?: string;
  renderedText?: string;
}> {
  const cleanPhone = normalizeWhatsAppPhone(recipientPhone);
  const isLive = isWhatsAppLiveConfigured();
  const messageId = `wamid.HBgL${Date.now()}X${Math.floor(1000 + Math.random() * 9000)}`;

  const components: Array<{
    type: string;
    sub_type?: string;
    index?: string;
    parameters: Array<{ type: string; text: string }>;
  }> = [
    {
      type: 'body',
      parameters: options.bodyParameters.map((param) => ({
        type: 'text',
        text: param,
      })),
    },
  ];

  if (options.buttonUrlParameter) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: options.buttonUrlParameter }],
    });
  }

  // Construct standard Meta Cloud API Template Payload
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'template',
    template: {
      name: options.templateName,
      language: { code: options.languageCode || 'en' },
      components,
    },
  };

  // Pre-render human-readable preview for logs and simulation
  const renderedText = renderTemplatePreview(options.templateName, options.bodyParameters);

  if (isLive) {
    // ----------------------------------------------------
    // LIVE META GRAPH API (WHATSAPP BUSINESS CLOUD API)
    // ----------------------------------------------------
    try {
      const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `WhatsApp API error ${res.status}`);
      }

      const liveMessageId = data.messages?.[0]?.id || messageId;

      await logWhatsAppAuditRecord({
        recipientPhone: cleanPhone,
        messageId: liveMessageId,
        templateName: options.templateName,
        status: 'SENT',
        orderId: options.orderId,
        payload,
      });

      return {
        success: true,
        messageId: liveMessageId,
        status: 'SENT',
        renderedText,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown WhatsApp error';
      console.error('[WHATSAPP API ERROR]', errMsg);
      return {
        success: false,
        messageId,
        status: 'FAILED',
        error: errMsg,
        renderedText,
      };
    }
  } else {
    // ----------------------------------------------------
    // SENIOR DEVELOPER TEST SIMULATION MODE (ADR-013)
    // ----------------------------------------------------
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║ 💬 PATEL NETWORKS WHATSAPP BUSINESS NOTIFICATION (TEST MODE)      ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log(`║ Recipient: +${cleanPhone}                                    ║`);
    console.log(`║ Template : ${options.templateName}                                 ║`);
    console.log(`║ Message ID: ${messageId}                       ║`);
    console.log('╟───────────────────────────────────────────────────────────────────╢');
    console.log(`║ Content:                                                          ║`);
    renderedText.split('\n').forEach((line) => {
      console.log(`║   ${line.padEnd(64).substring(0, 64)}║`);
    });
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    // Record audit in database
    await logWhatsAppAuditRecord({
      recipientPhone: cleanPhone,
      messageId,
      templateName: options.templateName,
      status: 'SIMULATED',
      orderId: options.orderId,
      payload,
    });

    return {
      success: true,
      messageId,
      status: 'SIMULATED',
      renderedText,
    };
  }
}

/**
 * Persists an audit log record of the dispatched WhatsApp message.
 */
async function logWhatsAppAuditRecord(params: {
  recipientPhone: string;
  messageId: string;
  templateName: string;
  status: string;
  orderId?: string;
  payload: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: 'WHATSAPP_DISPATCH',
        entity: 'WHATSAPP_NOTIFICATION',
        entityId: params.orderId || params.messageId,
        details: {
          recipientPhone: params.recipientPhone,
          messageId: params.messageId,
          templateName: params.templateName,
          status: params.status,
          timestamp: new Date().toISOString(),
          payload: params.payload,
        },
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[WHATSAPP AUDIT LOG WARNING]', errMsg);
  }
}

/**
 * Formats a readable preview text from template name and parameters.
 */
function renderTemplatePreview(templateName: string, params: string[]): string {
  switch (templateName) {
    case 'order_confirmation':
      return `Dear ${params[0] || 'Customer'},\nYour Patel Networks CCTV order #${params[1]} for ${params[2]} is confirmed!\nPayment: ${params[3]}\nItems: ${params[4]}\nView Tax Invoice: ${params[5]}`;
    case 'order_dispatched':
      return `Update on Order #${params[1]}:\nYour surveillance hardware is on the way!\nCarrier: ${params[2]}\nAWB: ${params[3]}\nEst. Delivery: ${params[4]}\nTrack live: ${params[5]}`;
    case 'out_for_delivery':
      return `Out for Delivery! Order #${params[1]} will arrive today via ${params[2]} (AWB: ${params[3]}).\nDelivery Address: ${params[4]}\nPlease keep someone available to receive the package.`;
    case 'order_delivered':
      return `Delivered! Order #${params[1]} has been successfully handed over to you.\nThank you for choosing Patel Networks Surveillance. Have questions? Reply to this chat!`;
    case 'b2b_quote_inquiry':
      return `Commercial Project Inquiry Received!\nHi ${params[0]}, our enterprise dealer desk has received your quotation request for ${params[1]} units of ${params[2]}.\nAn authorized representative will contact you within 1 business hour.`;
    default:
      return `WhatsApp Notification [${templateName}]: ${params.join(' | ')}`;
  }
}

// =============================================================================
// DOMAIN-SPECIFIC NOTIFICATION HOOKS
// =============================================================================

/**
 * 1. Dispatches Order Confirmation WhatsApp message upon payment capture / COD confirmation.
 */
export async function sendOrderConfirmationWhatsApp(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      shippingAddress: true,
      items: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const recipientName = order.shippingAddress?.recipientName || order.customer?.fullName || 'Valued Customer';
  const phone = order.shippingAddress?.phone || '';
  const totalFormatted = formatPrice(Number(order.totalAmount));
  const paymentMode = order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery (Pending)' : 'Online Prepaid (Verified)';
  const invoiceUrl = `${appUrl}/order-success/${order.orderNumber}`;
  const itemsSummary = `${order.items.length} items (${order.items[0]?.productName}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''})`;

  return await sendWhatsAppNotification(phone, {
    templateName: 'order_confirmation',
    bodyParameters: [
      recipientName,
      order.orderNumber,
      totalFormatted,
      paymentMode,
      itemsSummary,
      invoiceUrl,
    ],
    buttonUrlParameter: order.orderNumber,
    orderId: order.id,
  });
}

/**
 * 2. Dispatches Shipment Dispatched WhatsApp message when AWB is generated or order marked SHIPPED.
 */
export async function sendShipmentDispatchedWhatsApp(shipmentId: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          shippingAddress: true,
          customer: true,
        },
      },
    },
  });

  if (!shipment) {
    throw new Error(`Shipment ${shipmentId} not found.`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const order = shipment.order;
  const recipientName = order.shippingAddress?.recipientName || order.customer?.fullName || 'Valued Customer';
  const phone = order.shippingAddress?.phone || '';
  const trackingUrl = shipment.trackingUrl || `${appUrl}/order-success/${order.orderNumber}`;

  return await sendWhatsAppNotification(phone, {
    templateName: 'order_dispatched',
    bodyParameters: [
      recipientName,
      order.orderNumber,
      shipment.carrier || 'Delhivery Surface',
      shipment.awbNumber || 'AWB-PENDING',
      '2–3 Business Days',
      trackingUrl,
    ],
    buttonUrlParameter: shipment.awbNumber || order.orderNumber,
    orderId: order.id,
  });
}

/**
 * 3. Dispatches Out For Delivery WhatsApp alert when courier scan marks OUT_FOR_DELIVERY.
 */
export async function sendOutForDeliveryWhatsApp(shipmentId: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          shippingAddress: true,
          customer: true,
        },
      },
    },
  });

  if (!shipment) {
    throw new Error(`Shipment ${shipmentId} not found.`);
  }

  const order = shipment.order;
  const recipientName = order.shippingAddress?.recipientName || order.customer?.fullName || 'Valued Customer';
  const phone = order.shippingAddress?.phone || '';
  const destination = `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`;

  return await sendWhatsAppNotification(phone, {
    templateName: 'out_for_delivery',
    bodyParameters: [
      recipientName,
      order.orderNumber,
      shipment.carrier || 'Courier Delivery Partner',
      shipment.awbNumber || '',
      destination,
    ],
    orderId: order.id,
  });
}

/**
 * 4. Dispatches Order Delivered WhatsApp alert when courier scan marks DELIVERED.
 */
export async function sendOrderDeliveredWhatsApp(shipmentId: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          shippingAddress: true,
          customer: true,
        },
      },
    },
  });

  if (!shipment) {
    throw new Error(`Shipment ${shipmentId} not found.`);
  }

  const order = shipment.order;
  const recipientName = order.shippingAddress?.recipientName || order.customer?.fullName || 'Valued Customer';
  const phone = order.shippingAddress?.phone || '';

  return await sendWhatsAppNotification(phone, {
    templateName: 'order_delivered',
    bodyParameters: [
      recipientName,
      order.orderNumber,
    ],
    orderId: order.id,
  });
}

/**
 * 5. Dispatches B2B Contractor Quote Inquiry confirmation.
 */
export async function sendB2BQuoteInquiryWhatsApp(params: {
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  companyName?: string;
  notes?: string;
}) {
  return await sendWhatsAppNotification(params.phone, {
    templateName: 'b2b_quote_inquiry',
    bodyParameters: [
      params.customerName,
      String(params.quantity),
      params.productName,
    ],
  });
}
