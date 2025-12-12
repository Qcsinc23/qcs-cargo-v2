export interface CalculationBreakdown {
  // Weight calculations
  actualWeight: number;
  dimensionalWeight: number | null;
  billableWeight: number;

  // Cost breakdown
  baseCost: number;
  expressFee: number;
  handlingFee: number;
  insuranceFee: number;
  doorToDoorFee: number;

  // Totals
  subtotal: number;
  total: number;

  // Rate info
  ratePerLb: number;
  destinationName: string;
  serviceName: string;
  estimatedDelivery: string;

  // Additional info
  declaredValue?: number;
}