'use server';

import {
  sendOrderConfirmationWhatsApp,
  sendShipmentDispatchedWhatsApp,
  sendB2BQuoteInquiryWhatsApp,
} from '@/server/services/whatsapp.service';
import { prisma } from '@/server/db';

export interface B2BQuoteInquiryInput {
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  companyName?: string;
  notes?: string;
}

/**
 * Handles B2B contractor quotation request via WhatsApp.
 */
export async function submitB2BQuoteInquiryAction(input: B2BQuoteInquiryInput) {
  try {
    if (!input.customerName.trim() || !input.phone.trim() || !input.productName.trim() || input.quantity < 1) {
      return {
        success: false,
        error: 'Please provide customer name, phone number, product name, and a valid quantity.',
      };
    }

    // Dispatch WhatsApp confirmation to contractor
    const result = await sendB2BQuoteInquiryWhatsApp(input);

    // Record inquiry in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'B2B_QUOTE_REQUEST',
        entity: 'COMMERCIAL_INQUIRY',
        entityId: `inq_${Date.now()}`,
        details: {
          ...input,
          whatsappStatus: result.status,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      data: {
        messageId: result.messageId,
        status: result.status,
        renderedText: result.renderedText,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to submit quote inquiry.',
    };
  }
}

/**
 * Triggers an order confirmation WhatsApp notification manually or on webhook capture.
 */
export async function triggerOrderConfirmationWhatsAppAction(orderId: string) {
  try {
    const result = await sendOrderConfirmationWhatsApp(orderId);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
