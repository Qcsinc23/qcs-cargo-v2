export type PackageStatus = 
  | 'pending'
  | 'received'
  | 'processing'
  | 'in_transit'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export interface TrackingEvent {
  status: PackageStatus;
  location: string;
  timestamp: string;
  description: string;
}

export interface Package {
  id: string;
  trackingNumber: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status: PackageStatus;
  history: TrackingEvent[];
}
