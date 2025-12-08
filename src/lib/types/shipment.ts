import type { DestinationId } from '$lib/config/destinations';

export type PackageStatus =
  | 'pending'
  | 'received'
  | 'processing'
  | 'in_transit'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled';

export interface TrackingEvent {
  status: PackageStatus;
  location: string;
  timestamp: string;
  description: string;
  actor?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  qr_code: string;
  status: PackageStatus;
  destination: DestinationId;
  weight_lbs: number;
  weight_actual?: number;
  declared_value_usd?: number;
  contents_description?: string;
  special_instructions?: string;
  events: TrackingEvent[];
  estimated_delivery?: string;
  created: string;
  updated: string;
}

