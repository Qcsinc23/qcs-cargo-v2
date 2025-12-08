export interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  rate_multiplier: number;
  delivery_days: number;
  icon: string;
  additionalFee?: number;
}

export const SERVICES: Service[] = [
  {
    id: 'standard',
    name: 'Standard Air Freight',
    description: 'Fixed weekly departures with real-time tracking',
    features: ['Competitive bulk rates', 'Professional handling', 'Insurance options'],
    rate_multiplier: 1.0,
    delivery_days: 3,
    icon: 'plane'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Urgent shipments with priority processing',
    features: ['Same-day processing', 'Priority customs clearance', 'Next-flight guarantee'],
    rate_multiplier: 1.5,
    delivery_days: 1,
    icon: 'zap'
  },
  {
    id: 'door_to_door',
    name: 'Door-to-Door Service',
    description: 'Complete logistics from pickup to final delivery',
    features: ['Free pickup in NJ area', 'Last-mile delivery', 'Signature confirmation'],
    rate_multiplier: 1.2,
    delivery_days: 3,
    additionalFee: 25.00,
    icon: 'home'
  }
];

export type ServiceId = typeof SERVICES[number]['id'];

