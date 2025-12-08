export const SERVICES = {
  standard: {
    name: 'Standard Air Freight',
    description: 'Fixed weekly departures with real-time tracking',
    features: ['Competitive bulk rates', 'Professional handling', 'Insurance options'],
    multiplier: 1.0,
    transitDays: '3-5',
    icon: 'plane'
  },
  express: {
    name: 'Express Delivery',
    description: 'Urgent shipments with priority processing',
    features: ['Same-day processing', 'Priority customs clearance', 'Next-flight guarantee'],
    multiplier: 1.25,
    transitDays: '1-2',
    icon: 'zap'
  },
  door_to_door: {
    name: 'Door-to-Door Service',
    description: 'Complete logistics from pickup to final delivery',
    features: ['Free pickup in NJ area', 'Last-mile delivery', 'Signature confirmation'],
    multiplier: 1.0,
    additionalFee: 25.00,
    transitDays: '3-5',
    icon: 'home'
  },
  consolidated: {
    name: 'Consolidated Cargo',
    description: 'Cost-effective option for multiple packages',
    features: ['Volume discounts', 'Secure consolidation', 'Weekly consolidation windows'],
    discount: 0.30, // Up to 30% savings
    transitDays: '5-7',
    icon: 'package'
  }
} as const;

export type ServiceType = keyof typeof SERVICES;
export type Service = (typeof SERVICES)[ServiceType];

export const SERVICE_LIST = Object.entries(SERVICES).map(([id, service]) => ({
  id: id as ServiceType,
  ...service
}));

