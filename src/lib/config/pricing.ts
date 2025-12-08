import { DESTINATIONS } from './destinations';

export interface PricingConfig {
  baseRates: Record<string, number>;
  serviceMultipliers: Record<string, number>;
  dimWeightDivisor: number;
  minimumCharge: number;
  volumeDiscounts: { minWeight: number; discount: number }[];
  multiPackageDiscount: number;
  pickupFees: {
    withinNJ: number;
    outsideNJ: string;
  };
  customsClearanceFee: number;
  insuranceRate: number;
  minimumInsurance: number;
}

export const PRICING_CONFIG: PricingConfig = {
  // Base rates by destination (per lb)
  baseRates: {
    guyana: 3.50,
    jamaica: 3.75,
    trinidad: 3.50,
    barbados: 4.00,
    suriname: 4.25
  },
  
  // Service multipliers
  serviceMultipliers: {
    standard: 1.0,
    express: 1.25
  },
  
  // Dimensional weight factor (industry standard)
  dimWeightDivisor: 166, // cubic inches per lb
  
  // Minimum charges
  minimumCharge: 15.00, // USD
  
  // Volume discounts
  volumeDiscounts: [
    { minWeight: 100, discount: 0.05 },  // 5% off for 100+ lbs
    { minWeight: 500, discount: 0.10 },  // 10% off for 500+ lbs
    { minWeight: 1000, discount: 0.15 }  // 15% off for 1000+ lbs
  ],
  
  // Multi-package discount
  multiPackageDiscount: 0.05, // 5% off for 3+ packages in same booking
  
  // Pickup fees
  pickupFees: {
    withinNJ: 25.00,
    outsideNJ: 'custom_quote'
  },
  
  // Customs clearance
  customsClearanceFee: 35.00,
  
  // Insurance rate (percentage of declared value)
  insuranceRate: 0.02, // 2%
  minimumInsurance: 5.00
};

export interface ShippingQuote {
  destination: string;
  service: 'standard' | 'express';
  actualWeight: number;
  dimWeight: number;
  billableWeight: number;
  baseRate: number;
  subtotal: number;
  volumeDiscount: number;
  multiPackageDiscount: number;
  insurance: number;
  pickupFee: number;
  customsFee: number;
  total: number;
  transitDays: { min: number; max: number };
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
}

export function calculateDimWeight(dimensions: PackageDimensions): number {
  const { length, width, height } = dimensions;
  return (length * width * height) / PRICING_CONFIG.dimWeightDivisor;
}

export function calculateBillableWeight(
  actualWeight: number,
  dimensions?: PackageDimensions
): number {
  if (!dimensions) return actualWeight;
  
  const dimWeight = calculateDimWeight(dimensions);
  return Math.max(actualWeight, dimWeight);
}

export function getVolumeDiscount(totalWeight: number): number {
  let discount = 0;
  
  for (const tier of PRICING_CONFIG.volumeDiscounts) {
    if (totalWeight >= tier.minWeight) {
      discount = tier.discount;
    }
  }
  
  return discount;
}

export function calculateShippingQuote(params: {
  destination: string;
  service?: 'standard' | 'express';
  packages: Array<{
    weight: number;
    dimensions?: PackageDimensions;
  }>;
  includeInsurance?: boolean;
  declaredValue?: number;
  includePickup?: boolean;
  includeCustoms?: boolean;
}): ShippingQuote {
  const {
    destination,
    service = 'standard',
    packages,
    includeInsurance = false,
    declaredValue = 0,
    includePickup = false,
    includeCustoms = false
  } = params;

  const dest = DESTINATIONS[destination];
  if (!dest) {
    throw new Error(`Invalid destination: ${destination}`);
  }

  // Calculate total weight
  let totalActualWeight = 0;
  let totalDimWeight = 0;

  for (const pkg of packages) {
    totalActualWeight += pkg.weight;
    if (pkg.dimensions) {
      totalDimWeight += calculateDimWeight(pkg.dimensions);
    }
  }

  const billableWeight = Math.max(totalActualWeight, totalDimWeight);
  
  // Get base rate with service multiplier
  const baseRate = PRICING_CONFIG.baseRates[destination] || 3.50;
  const serviceMultiplier = PRICING_CONFIG.serviceMultipliers[service];
  const ratePerLb = baseRate * serviceMultiplier;
  
  // Calculate subtotal
  let subtotal = billableWeight * ratePerLb;
  
  // Apply minimum charge
  subtotal = Math.max(subtotal, PRICING_CONFIG.minimumCharge);
  
  // Calculate discounts
  const volumeDiscountPercent = getVolumeDiscount(billableWeight);
  const volumeDiscount = subtotal * volumeDiscountPercent;
  
  const multiPackageDiscountPercent = packages.length >= 3 
    ? PRICING_CONFIG.multiPackageDiscount 
    : 0;
  const multiPackageDiscount = (subtotal - volumeDiscount) * multiPackageDiscountPercent;
  
  // Calculate fees
  const insurance = includeInsurance
    ? Math.max(declaredValue * PRICING_CONFIG.insuranceRate, PRICING_CONFIG.minimumInsurance)
    : 0;
  
  const pickupFee = includePickup ? PRICING_CONFIG.pickupFees.withinNJ : 0;
  const customsFee = includeCustoms ? PRICING_CONFIG.customsClearanceFee : 0;
  
  // Calculate total
  const total = subtotal - volumeDiscount - multiPackageDiscount + insurance + pickupFee + customsFee;
  
  // Get transit time (express is faster)
  const transitDays = service === 'express'
    ? { min: Math.max(1, dest.transitDays.min - 1), max: dest.transitDays.max - 1 }
    : dest.transitDays;

  return {
    destination,
    service,
    actualWeight: totalActualWeight,
    dimWeight: totalDimWeight,
    billableWeight,
    baseRate: ratePerLb,
    subtotal,
    volumeDiscount,
    multiPackageDiscount,
    insurance,
    pickupFee,
    customsFee,
    total,
    transitDays
  };
}

// Format helpers
export function formatRate(rate: number): string {
  return `$${rate.toFixed(2)}/lb`;
}

export function formatTransitTime(days: { min: number; max: number }): string {
  if (days.min === days.max) {
    return `${days.min} days`;
  }
  return `${days.min}-${days.max} days`;
}


