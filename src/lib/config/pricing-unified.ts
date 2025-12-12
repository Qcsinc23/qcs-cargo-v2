import { DESTINATIONS } from './destinations';

// Unified pricing configuration
export interface UnifiedPricingConfig {
  dimensionalWeight: {
    divisor: number;
  };
  fees: {
    heavyWeight: {
      threshold: number; // lbs
      fee: number; // USD
    };
    handling: {
      minimum: number; // USD
      perPackage: number; // USD
    };
    doorToDoor: {
      fee: number; // USD
    };
    customsClearance: number; // USD
  };
  insurance: {
    deductible: number; // First $100 not covered
    rate: number; // Per $100 of value
    minimum: number; // Minimum charge
  };
  service: {
    express: {
      surcharge: number; // Percentage
    };
    standard: {
      transitDays: number;
    };
  };
  discounts: {
    volume: Array<{
      weight: number; // lbs
      discount: number; // Percentage
    }>;
    multiPackage: {
      threshold: number; // Number of packages
      discount: number; // Percentage
    };
  };
}

export const UNIFIED_PRICING: UnifiedPricingConfig = {
  dimensionalWeight: {
    divisor: 166
  },
  fees: {
    heavyWeight: {
      threshold: 70,
      fee: 20
    },
    handling: {
      minimum: 15,
      perPackage: 5
    },
    doorToDoor: {
      fee: 25
    },
    customsClearance: 35
  },
  insurance: {
    deductible: 100,
    rate: 7.50,
    minimum: 15
  },
  service: {
    express: {
      surcharge: 50
    },
    standard: {
      transitDays: 3
    }
  },
  discounts: {
    volume: [
      { weight: 100, discount: 5 },
      { weight: 500, discount: 10 },
      { weight: 1000, discount: 15 }
    ],
    multiPackage: {
      threshold: 3,
      discount: 5
    }
  }
};

// Calculation helpers
export class PricingCalculator {
  static calculateDimensionalWeight(dimensions: { length: number; width: number; height: number }): number {
    const { length, width, height } = dimensions;
    return (length * width * height) / UNIFIED_PRICING.dimensionalWeight.divisor;
  }

  static calculateBillableWeight(actualWeight: number, dimensions?: { length: number; width: number; height: number }): number {
    const dimensionalWeight = dimensions ? this.calculateDimensionalWeight(dimensions) : 0;
    return Math.max(actualWeight, dimensionalWeight);
  }

  static calculateInsuranceFee(declaredValue: number, includeInsurance: boolean): number {
    if (!includeInsurance || declaredValue <= 0) return 0;

    const insuredValue = Math.max(0, declaredValue - UNIFIED_PRICING.insurance.deductible);
    const calculatedFee = (insuredValue / 100) * UNIFIED_PRICING.insurance.rate;
    return Math.max(UNIFIED_PRICING.insurance.minimum, calculatedFee);
  }

  static calculateExpressFee(baseCost: number, isExpress: boolean): number {
    return isExpress ? baseCost * (UNIFIED_PRICING.service.express.surcharge / 100) : 0;
  }

  static calculateHandlingFee(billableWeight: number, packageCount: number = 1): number {
    let totalFee = 0;

    // Heavy weight fee
    if (billableWeight > UNIFIED_PRICING.fees.heavyWeight.threshold) {
      totalFee += UNIFIED_PRICING.fees.heavyWeight.fee;
    }

    // Per package handling
    totalFee += UNIFIED_PRICING.fees.handling.perPackage * packageCount;

    // Minimum fee
    return Math.max(totalFee, UNIFIED_PRICING.fees.handling.minimum);
  }

  static calculateVolumeDiscount(weight: number): number {
    let discount = 0;
    for (const tier of UNIFIED_PRICING.discounts.volume) {
      if (weight >= tier.weight) {
        discount = tier.discount;
      }
    }
    return discount;
  }

  static calculateMultiPackageDiscount(packageCount: number): number {
    return packageCount >= UNIFIED_PRICING.discounts.multiPackage.threshold
      ? UNIFIED_PRICING.discounts.multiPackage.discount
      : 0;
  }

  static calculateShipping(params: {
    destination: string;
    weight: number;
    dimensions?: { length: number; width: number; height: number };
    serviceLevel: 'standard' | 'express' | 'door_to_door';
    declaredValue?: number;
    includeInsurance?: boolean;
    packageCount?: number;
  }) {
    const {
      destination,
      weight,
      dimensions,
      serviceLevel,
      declaredValue = 0,
      includeInsurance = false,
      packageCount = 1
    } = params;

    const destinationData = DESTINATIONS.find(d => d.id === destination);
    if (!destinationData) {
      throw new Error(`Invalid destination: ${destination}`);
    }

    // Calculate billable weight
    const billableWeight = this.calculateBillableWeight(weight, dimensions);

    // Calculate base cost
    const baseCost = billableWeight * destinationData.baseRate;

    // Apply minimum charge
    const adjustedBaseCost = Math.max(baseCost, UNIFIED_PRICING.fees.handling.minimum);

    // Calculate discounts
    const volumeDiscount = this.calculateVolumeDiscount(billableWeight);
    const multiPackageDiscount = this.calculateMultiPackageDiscount(packageCount);

    const discountedBase = adjustedBaseCost * (1 - volumeDiscount / 100) * (1 - multiPackageDiscount / 100);

    // Calculate additional fees
    const expressFee = this.calculateExpressFee(discountedBase, serviceLevel === 'express');
    const handlingFee = this.calculateHandlingFee(billableWeight, packageCount);
    const insuranceFee = this.calculateInsuranceFee(declaredValue, includeInsurance);
    const doorToDoorFee = serviceLevel === 'door_to_door' ? UNIFIED_PRICING.fees.doorToDoor.fee : 0;

    // Calculate total
    const subtotal = discountedBase + expressFee + handlingFee + doorToDoorFee;
    const total = subtotal + insuranceFee;

    // Calculate estimated delivery
    const daysToDeliver = destinationData.base_transit_days + (serviceLevel === 'express' ? -1 : UNIFIED_PRICING.service.standard.transitDays);

    return {
      // Weight breakdown
      actualWeight: weight,
      dimensionalWeight: dimensions ? this.calculateDimensionalWeight(dimensions) : null,
      billableWeight: Math.round(billableWeight * 100) / 100,

      // Cost breakdown
      baseCost: Math.round(discountedBase * 100) / 100,
      expressFee: Math.round(expressFee * 100) / 100,
      handlingFee: Math.round(handlingFee * 100) / 100,
      insuranceFee: Math.round(insuranceFee * 100) / 100,
      doorToDoorFee: Math.round(doorToDoorFee * 100) / 100,

      // Discounts applied
      volumeDiscount,
      multiPackageDiscount,

      // Totals
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,

      // Metadata
      ratePerLb: destinationData.baseRate,
      destinationName: destinationData.name,
      serviceLevel,
      estimatedDeliveryDays: Math.max(1, daysToDeliver)
    };
  }
}