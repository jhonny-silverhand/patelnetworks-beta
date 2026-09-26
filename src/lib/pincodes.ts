/**
 * Patel Networks / MegaTech CCTV - Indian Postal Code & Geo-Logistics Intelligence
 * 
 * Provides 6-digit Indian PIN code validation, postal circle resolution,
 * regional zone categorization, COD eligibility, and SLA transit time calculation.
 */

export interface PincodeServiceability {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  isServiceable: boolean;
  zone: 'INTRA_STATE' | 'METRO' | 'REGIONAL' | 'SPECIAL_ZONE';
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  estimatedDeliveryDate: string; // Formatted date string (e.g. "Wednesday, 30 Sep")
  isCodAvailable: boolean;
  carrierPartner: string;
  shippingFee: number;
  freeShippingThreshold: number;
  notes?: string;
}

// Origin Warehouse: MegaTech Central Fulfillment Center, Surat, Gujarat (PIN: 395003)
export const WAREHOUSE_ORIGIN = {
  pincode: '395003',
  city: 'Surat',
  state: 'Gujarat',
  hub: 'MegaTech Central Logistics Hub, Surat',
};

// Known Indian Metro / Regional Postal Directory with Prefixes
interface KnownPostalZone {
  prefix: string;
  city: string;
  state: string;
  zone: 'INTRA_STATE' | 'METRO' | 'REGIONAL' | 'SPECIAL_ZONE';
  daysMin: number;
  daysMax: number;
  codAvailable: boolean;
  defaultCarrier: string;
}

const KNOWN_POSTAL_ZONES: KnownPostalZone[] = [
  // --- Gujarat (Intra-state - Fastest SLA) ---
  { prefix: '38', city: 'Ahmedabad / Gandhinagar', state: 'Gujarat', zone: 'INTRA_STATE', daysMin: 1, daysMax: 2, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '39', city: 'Surat / Vadodara / South Gujarat', state: 'Gujarat', zone: 'INTRA_STATE', daysMin: 1, daysMax: 2, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '36', city: 'Rajkot / Saurashtra', state: 'Gujarat', zone: 'INTRA_STATE', daysMin: 1, daysMax: 2, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '37', city: 'Kutch / Bhuj', state: 'Gujarat', zone: 'INTRA_STATE', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },

  // --- Metro Cities (Express Air & Surface Connect) ---
  { prefix: '11', city: 'New Delhi', state: 'Delhi NCR', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'BlueDart Express Air' },
  { prefix: '12', city: 'Gurugram / Faridabad', state: 'Haryana', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '20', city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '40', city: 'Mumbai / Navi Mumbai / Thane', state: 'Maharashtra', zone: 'METRO', daysMin: 1, daysMax: 2, codAvailable: true, defaultCarrier: 'BlueDart Express' },
  { prefix: '41', city: 'Pune', state: 'Maharashtra', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '56', city: 'Bengaluru Urban', state: 'Karnataka', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'BlueDart Express Air' },
  { prefix: '50', city: 'Hyderabad / Secunderabad', state: 'Telangana', zone: 'METRO', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '60', city: 'Chennai', state: 'Tamil Nadu', zone: 'METRO', daysMin: 2, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '70', city: 'Kolkata / Howrah', state: 'West Bengal', zone: 'METRO', daysMin: 3, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },

  // --- Regional Hubs (Tier-2 / Tier-3) ---
  { prefix: '30', city: 'Jaipur', state: 'Rajasthan', zone: 'REGIONAL', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '31', city: 'Udaipur / Kota', state: 'Rajasthan', zone: 'REGIONAL', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '44', city: 'Nagpur', state: 'Maharashtra', zone: 'REGIONAL', daysMin: 2, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '45', city: 'Indore', state: 'Madhya Pradesh', zone: 'REGIONAL', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '46', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'REGIONAL', daysMin: 2, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '14', city: 'Ludhiana / Amritsar', state: 'Punjab', zone: 'REGIONAL', daysMin: 3, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '16', city: 'Chandigarh / Mohali', state: 'Punjab', zone: 'REGIONAL', daysMin: 2, daysMax: 3, codAvailable: true, defaultCarrier: 'BlueDart Express' },
  { prefix: '22', city: 'Lucknow / Kanpur', state: 'Uttar Pradesh', zone: 'REGIONAL', daysMin: 3, daysMax: 4, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '80', city: 'Patna', state: 'Bihar', zone: 'REGIONAL', daysMin: 3, daysMax: 5, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '75', city: 'Bhubaneswar / Cuttack', state: 'Odisha', zone: 'REGIONAL', daysMin: 3, daysMax: 5, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '68', city: 'Kochi / Ernakulam', state: 'Kerala', zone: 'REGIONAL', daysMin: 3, daysMax: 5, codAvailable: true, defaultCarrier: 'Delhivery Surface' },

  // --- Special Logistics Zones (Remote / North East / J&K / Islands - Air cargo only, COD Restricted) ---
  { prefix: '78', city: 'Guwahati', state: 'Assam', zone: 'SPECIAL_ZONE', daysMin: 4, daysMax: 6, codAvailable: false, defaultCarrier: 'DTDC Air Cargo' },
  { prefix: '79', city: 'North East States (Shillong/Imphal/Agartala)', state: 'North East', zone: 'SPECIAL_ZONE', daysMin: 5, daysMax: 7, codAvailable: false, defaultCarrier: 'DTDC Air Cargo' },
  { prefix: '19', city: 'Srinagar / Kashmir Valley', state: 'Jammu & Kashmir', zone: 'SPECIAL_ZONE', daysMin: 5, daysMax: 7, codAvailable: false, defaultCarrier: 'BlueDart Air' },
  { prefix: '18', city: 'Jammu', state: 'Jammu & Kashmir', zone: 'SPECIAL_ZONE', daysMin: 4, daysMax: 6, codAvailable: false, defaultCarrier: 'Delhivery Surface' },
  { prefix: '17', city: 'Shimla / Solan', state: 'Himachal Pradesh', zone: 'SPECIAL_ZONE', daysMin: 3, daysMax: 5, codAvailable: true, defaultCarrier: 'Delhivery Surface' },
  { prefix: '744', city: 'Port Blair', state: 'Andaman & Nicobar Islands', zone: 'SPECIAL_ZONE', daysMin: 6, daysMax: 8, codAvailable: false, defaultCarrier: 'India Post Speed Post' },
];

/**
 * Calculates human-readable estimated delivery date based on transit business days.
 * Automatically skips Sundays and adds realistic dispatch handling.
 */
export function calculateEstimatedDeliveryDate(transitDays: number): string {
  const date = new Date();
  // Cutoff time: if after 3:00 PM IST (09:30 UTC), dispatch starts next day
  const currentHour = date.getUTCHours() + 5.5;
  let daysToAdd = transitDays + (currentHour >= 15 ? 1 : 0);

  // Advance date skipping Sundays
  let added = 0;
  const targetDate = new Date(date);
  while (added < daysToAdd) {
    targetDate.setDate(targetDate.getDate() + 1);
    // If not Sunday (0 is Sunday)
    if (targetDate.getDay() !== 0) {
      added++;
    }
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  return targetDate.toLocaleDateString('en-IN', options);
}

/**
 * Resolves state and region by the first digit of the 6-digit Indian PIN code.
 */
function resolveRegionByFirstDigit(digit: string): { state: string; region: string } {
  switch (digit) {
    case '1': return { state: 'Northern Region (DL/HR/PB/HP/JK)', region: 'North India' };
    case '2': return { state: 'Uttar Pradesh / Uttarakhand', region: 'North India' };
    case '3': return { state: 'Gujarat / Rajasthan', region: 'West India' };
    case '4': return { state: 'Maharashtra / MP / Goa / CG', region: 'Central & West India' };
    case '5': return { state: 'Andhra / Telangana / Karnataka', region: 'South India' };
    case '6': return { state: 'Tamil Nadu / Kerala', region: 'South India' };
    case '7': return { state: 'West Bengal / Odisha / North East', region: 'East & North-East India' };
    case '8': return { state: 'Bihar / Jharkhand', region: 'East India' };
    default: return { state: 'India', region: 'National' };
  }
}

/**
 * Look up Indian pincode serviceability, transit time, and COD availability.
 */
export function lookupPincodeServiceability(
  pincode: string,
  orderTotal = 0
): PincodeServiceability {
  const cleanPin = (pincode || '').trim();

  // Validate standard 6-digit Indian postal code format
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      city: 'Invalid Location',
      state: 'Unknown',
      isServiceable: false,
      zone: 'REGIONAL',
      estimatedDaysMin: 0,
      estimatedDaysMax: 0,
      estimatedDeliveryDate: 'N/A',
      isCodAvailable: false,
      carrierPartner: 'None',
      shippingFee: 0,
      freeShippingThreshold: 999,
      notes: 'Please enter a valid 6-digit Indian postal code (e.g. 395003, 110001).',
    };
  }

  // 1. Try prefix matching from the most specific (3-digit) to (2-digit)
  const prefix3 = cleanPin.substring(0, 3);
  const prefix2 = cleanPin.substring(0, 2);

  const matched =
    KNOWN_POSTAL_ZONES.find((z) => z.prefix === prefix3) ||
    KNOWN_POSTAL_ZONES.find((z) => z.prefix === prefix2);

  const freeShippingThreshold = 999;
  const shippingFee = orderTotal >= freeShippingThreshold ? 0 : 99;

  if (matched) {
    return {
      pincode: cleanPin,
      city: matched.city,
      state: matched.state,
      isServiceable: true,
      zone: matched.zone,
      estimatedDaysMin: matched.daysMin,
      estimatedDaysMax: matched.daysMax,
      estimatedDeliveryDate: calculateEstimatedDeliveryDate(matched.daysMax),
      isCodAvailable: matched.codAvailable,
      carrierPartner: matched.defaultCarrier,
      shippingFee,
      freeShippingThreshold,
      notes: matched.zone === 'INTRA_STATE'
        ? 'Express Intra-State Delivery from Surat Central Hub.'
        : matched.zone === 'METRO'
        ? 'Direct Metro Air/Surface Express Serviceable.'
        : matched.zone === 'SPECIAL_ZONE'
        ? 'Air cargo zone: Prepaid orders prioritized for rapid clearance.'
        : 'Surface courier serviceable with live tracking.',
    };
  }

  // 2. Generic Fallback for unmapped active Indian PIN codes
  const fallbackRegion = resolveRegionByFirstDigit(cleanPin[0]);
  return {
    pincode: cleanPin,
    city: `District Postal Circle (${fallbackRegion.region})`,
    state: fallbackRegion.state,
    isServiceable: true,
    zone: 'REGIONAL',
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    estimatedDeliveryDate: calculateEstimatedDeliveryDate(5),
    isCodAvailable: true,
    carrierPartner: 'Delhivery Surface / Ecom Express',
    shippingFee,
    freeShippingThreshold,
    notes: 'Standard courier delivery across pan-India postal circles.',
  };
}
