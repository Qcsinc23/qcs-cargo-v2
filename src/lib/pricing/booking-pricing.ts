import { getDestination } from '$lib/config/destinations';

export type BookingServiceType = 'standard' | 'express' | 'door-to-door' | 'door_to_door' | 'consolidated';

export interface PricingPackageInput {
  id: string;
  weight: number | null;
  weightUnknown: boolean;
  length: number | null;
  width: number | null;
  height: number | null;
  declaredValue: number | null;
}

export interface PricingPackageQuote {
  id: string;
  weight: number;
  dimWeight: number;
  billableWeight: number;
  cost: number;
}

export interface BookingPricingResult {
  packages: PricingPackageQuote[];
  subtotal: number;
  multiPackageDiscount: number;
  insuranceCost: number;
  expressSurcharge: number;
  totalCost: number;
  transitDays: string;
  totalWeight: number;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundTo1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function normalizeServiceType(serviceType: BookingServiceType): 'standard' | 'express' | 'door_to_door' | 'consolidated' {
  return serviceType === 'door-to-door' ? 'door_to_door' : serviceType;
}

export function calculateBookingPricing(params: {
  destination: string;
  serviceType: BookingServiceType;
  packages: PricingPackageInput[];
}): BookingPricingResult {
  const { destination, serviceType, packages } = params;
  const destinationConfig = getDestination(destination);

  if (!destinationConfig) {
    throw new Error(`Invalid destination: ${destination}`);
  }

  const packageQuotes: PricingPackageQuote[] = packages.map((pkg) => {
    const weight = pkg.weightUnknown ? 5 : Math.max(0, Number(pkg.weight ?? 0));
    const hasDimensions =
      Number(pkg.length ?? 0) > 0 &&
      Number(pkg.width ?? 0) > 0 &&
      Number(pkg.height ?? 0) > 0;
    const dimWeight = hasDimensions
      ? (Number(pkg.length) * Number(pkg.width) * Number(pkg.height)) / 166
      : 0;
    const billableWeight = Math.max(weight, dimWeight);
    const cost = billableWeight * destinationConfig.baseRate;

    return {
      id: pkg.id,
      weight: roundTo1(weight),
      dimWeight: roundTo1(dimWeight),
      billableWeight: roundTo1(billableWeight),
      cost: roundTo2(cost)
    };
  });

  const subtotal = roundTo2(packageQuotes.reduce((sum, pkg) => sum + pkg.cost, 0));

  let discountPercent = 0;
  if (packageQuotes.length >= 5) {
    discountPercent = 0.1;
  } else if (packageQuotes.length >= 2) {
    discountPercent = 0.05;
  }
  const multiPackageDiscount = roundTo2(subtotal * discountPercent);

  const totalDeclaredValue = packages.reduce(
    (sum, pkg) => sum + Math.max(0, Number(pkg.declaredValue ?? 0)),
    0
  );
  const insuranceCost = totalDeclaredValue > 0 ? roundTo2(Math.max(totalDeclaredValue * 0.03, 5)) : 0;

  const expressSurcharge = serviceType === 'express' ? roundTo2(subtotal * 0.25) : 0;
  const totalCost = roundTo2(subtotal - multiPackageDiscount + insuranceCost + expressSurcharge);
  const transitDays = `${destinationConfig.transitDays.min}-${destinationConfig.transitDays.max} business days`;
  const totalWeight = roundTo2(packageQuotes.reduce((sum, pkg) => sum + pkg.weight, 0));

  return {
    packages: packageQuotes,
    subtotal,
    multiPackageDiscount,
    insuranceCost,
    expressSurcharge,
    totalCost,
    transitDays,
    totalWeight
  };
}
