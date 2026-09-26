import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

/**
 * GET Handler for Meta WhatsApp Webhook Verification Handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'patelnetworks_webhook_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WHATSAPP WEBHOOK] Handshake verified successfully with Meta.');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[WHATSAPP WEBHOOK] Verification token mismatch. Received:', token);
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST Handler for Meta WhatsApp Delivery Status Updates & Inbound Replies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('[WHATSAPP WEBHOOK] Inbound event:', JSON.stringify(body));

    // Extract entries from Meta Graph API format
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (value) {
      // 1. Handle Message Status Updates (sent, delivered, read, failed)
      if (value.statuses && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          const wamid = statusObj.id;
          const status = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const recipientId = statusObj.recipient_id;

          console.log(`[WHATSAPP STATUS] Message ${wamid} -> ${status} (${recipientId})`);

          // Update AuditLog if matching message exists
          try {
            await prisma.auditLog.create({
              data: {
                action: `WHATSAPP_STATUS_${status.toUpperCase()}`,
                entity: 'WHATSAPP_STATUS_CALLBACK',
                entityId: wamid,
                details: {
                  status,
                  recipientId,
                  timestamp: statusObj.timestamp,
                },
              },
            });
          } catch (e: any) {
            console.warn('[WHATSAPP STATUS LOG]', e.message);
          }
        }
      }

      // 2. Handle Inbound Customer Messages (e.g. replies)
      if (value.messages && value.messages.length > 0) {
        for (const msg of value.messages) {
          const from = msg.from;
          const text = msg.text?.body;
          const type = msg.type;

          console.log(`[WHATSAPP INBOUND] Message from +${from} [${type}]: "${text}"`);

          try {
            await prisma.auditLog.create({
              data: {
                action: 'WHATSAPP_INBOUND_MESSAGE',
                entity: 'WHATSAPP_INBOUND',
                entityId: msg.id || `inbound_${Date.now()}`,
                details: {
                  from,
                  text,
                  type,
                  timestamp: msg.timestamp,
                },
              },
            });
          } catch (e: any) {
            console.warn('[WHATSAPP INBOUND LOG]', e.message);
          }
        }
      }
    }

    return NextResponse.json({ success: true, status: 'EVENT_RECEIVED' });
  } catch (err: any) {
    console.error('[WHATSAPP WEBHOOK ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Error processing WhatsApp webhook' },
      { status: 500 }
    );
  }
}
