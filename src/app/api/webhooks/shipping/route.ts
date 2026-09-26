import { NextRequest, NextResponse } from 'next/server';
import { processCarrierTrackingWebhook } from '@/server/services/shipping.service';

/**
 * Carrier Logistics Tracking Webhook (Shiprocket / Delhivery / Surface Partner)
 * 
 * Synchronizes courier status updates, logs chronological scan events,
 * and updates the order state machine idempotently.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    console.log('[SHIPPING WEBHOOK] Received tracking event payload:', JSON.stringify(rawBody));

    // Normalize payload across Shiprocket, Delhivery, and custom payloads
    const awb = rawBody.awb || rawBody.waybill || rawBody.awb_code || rawBody.shipment_id;
    const currentStatus =
      rawBody.current_status ||
      rawBody.status ||
      rawBody.shipment_status ||
      rawBody.current_status_id;
    const location = rawBody.location || rawBody.city || rawBody.scan_location || 'Transit Hub';
    const activity =
      rawBody.activity ||
      rawBody.comment ||
      rawBody.scans?.[0]?.activity ||
      rawBody.status_description;
    const timestamp = rawBody.timestamp || rawBody.date || new Date().toISOString();

    if (!awb || !currentStatus) {
      return NextResponse.json(
        {
          error: 'Missing required tracking fields. Expected "awb" and "current_status".',
          received: rawBody,
        },
        { status: 400 }
      );
    }

    const result = await processCarrierTrackingWebhook({
      awb: String(awb).trim(),
      current_status: String(currentStatus).trim(),
      location: String(location).trim(),
      activity: activity ? String(activity).trim() : undefined,
      timestamp,
      metadata: rawBody,
    });

    console.log(
      `[SHIPPING WEBHOOK] Processed AWB ${awb} -> ${result.shipmentStatus} (Order updated: ${result.orderUpdated})`
    );

    return NextResponse.json({
      success: true,
      message: result.duplicate ? 'Duplicate tracking event ignored' : 'Tracking event processed',
      data: result,
    });
  } catch (err: any) {
    console.error('[SHIPPING WEBHOOK ERROR]', err);
    return NextResponse.json(
      {
        error: err.message || 'Internal error processing carrier tracking webhook.',
      },
      { status: err.message?.includes('not found') ? 404 : 500 }
    );
  }
}
