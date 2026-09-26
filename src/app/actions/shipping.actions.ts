'use server';

import {
  lookupPincodeServiceability,
  PincodeServiceability,
} from '@/lib/pincodes';
import {
  createShipmentForOrder,
  getShipmentByAwb,
  getShipmentForOrder,
  simulateShipmentProgress,
} from '@/server/services/shipping.service';

/**
 * Checks serviceability, estimated delivery SLA, and COD eligibility for a 6-digit Indian PIN code.
 */
export async function checkPincodeAction(
  pincode: string,
  orderTotal = 0
): Promise<{ success: boolean; data?: PincodeServiceability; error?: string }> {
  try {
    const result = lookupPincodeServiceability(pincode, orderTotal);
    if (!result.isServiceable) {
      return {
        success: false,
        error: result.notes || 'Pincode not serviceable for courier delivery.',
      };
    }
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error checking pincode serviceability.',
    };
  }
}

/**
 * Retrieves live tracking and chronological scan events for an AWB number.
 */
export async function trackShipmentAction(awbNumber: string) {
  try {
    if (!awbNumber) {
      return { success: false, error: 'AWB number is required.' };
    }

    const shipment = await getShipmentByAwb(awbNumber.trim());
    if (!shipment) {
      return { success: false, error: `No shipment found for AWB ${awbNumber}.` };
    }

    return {
      success: true,
      data: {
        awbNumber: shipment.awbNumber,
        carrier: shipment.carrier,
        status: shipment.status,
        trackingUrl: shipment.trackingUrl,
        labelUrl: shipment.labelUrl,
        orderNumber: shipment.order.orderNumber,
        events: shipment.events.map((e) => ({
          id: e.id,
          status: e.status,
          location: e.location,
          timestamp: e.timestamp.toISOString(),
          activity: (e.payload as any)?.activity || e.status,
        })),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error tracking shipment.',
    };
  }
}

/**
 * Generates an AWB and creates a Shipment record for an eligible Order.
 */
export async function createShipmentAction(orderId: string, carrier?: string) {
  try {
    const shipment = await createShipmentForOrder(orderId, {
      carrier,
      autoAdvanceStatus: true,
    });

    return {
      success: true,
      data: {
        id: shipment.id,
        awbNumber: shipment.awbNumber,
        carrier: shipment.carrier,
        status: shipment.status,
        trackingUrl: shipment.trackingUrl,
        labelUrl: shipment.labelUrl,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to create shipment.',
    };
  }
}

/**
 * Interactive Simulation Helper: Advances tracking to next realistic stage for test/demo orders.
 */
export async function simulateTrackingProgressAction(
  awbNumber: string,
  targetStage: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
) {
  try {
    const result = await simulateShipmentProgress(awbNumber, targetStage);
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to advance tracking stage.',
    };
  }
}
