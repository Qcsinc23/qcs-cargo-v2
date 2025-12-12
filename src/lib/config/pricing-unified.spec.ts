import { describe, expect, it } from 'vitest';
import { PricingCalculator, UNIFIED_PRICING } from './pricing-unified';

describe('PricingCalculator', () => {
  it('calculates dimensional weight using the configured divisor', () => {
    const dims = { length: 20, width: 14, height: 12 }; // 3360
    const expected = 3360 / UNIFIED_PRICING.dimensionalWeight.divisor;
    expect(PricingCalculator.calculateDimensionalWeight(dims)).toBeCloseTo(expected, 6);
  });

  it('applies insurance deductible and minimum charge', () => {
    // Below deductible => still minimum if includeInsurance is true and declaredValue > 0?
    // In our rules: declaredValue <= 0 => 0; otherwise, insuredValue = max(0, value - deductible)
    // fee = max(minimum, calculatedFee)
    expect(PricingCalculator.calculateInsuranceFee(0, true)).toBe(0);
    expect(PricingCalculator.calculateInsuranceFee(50, true)).toBe(UNIFIED_PRICING.insurance.minimum);

    const declaredValue = 600;
    const insuredValue = declaredValue - UNIFIED_PRICING.insurance.deductible; // 500
    const calculated = (insuredValue / 100) * UNIFIED_PRICING.insurance.rate;
    expect(PricingCalculator.calculateInsuranceFee(declaredValue, true)).toBe(Math.max(UNIFIED_PRICING.insurance.minimum, calculated));
  });

  it('throws on invalid destination', () => {
    expect(() =>
      PricingCalculator.calculateShipping({
        destination: 'not-a-real-destination',
        weight: 10,
        serviceLevel: 'standard'
      })
    ).toThrow(/Invalid destination/i);
  });
});


