import type { DestinationId } from '$lib/config/destinations';
import type { ServiceType } from '$lib/config/services';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export interface QuotePackage {
  weight_lbs: number;
  weight_estimated: boolean;
  length_in?: number;
  width_in?: number;
  height_in?: number;
  declared_value_usd?: number;
  contents_description?: string;
}

export interface QuoteData {
  packages: QuotePackage[];
  subtotal: number;
  discount: number;
  insurance?: number;
  pickup_fee?: number;
  customs_fee?: number;
  total: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface Booking {
  id: string;
  user: string;
  recipient?: string;
  destination: DestinationId;
  service_type: ServiceType;
  scheduled_date: string;
  time_slot: string;
  status: BookingStatus;
  package_count: number;
  quote_data: QuoteData;
  notes?: string;
  payment_intent_id?: string;
  payment_status?: PaymentStatus;
  payment_error?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created: string;
  updated: string;
}

export interface BookingDraft {
  destination?: DestinationId;
  service_type?: ServiceType;
  recipient_id?: string;
  packages: QuotePackage[];
  scheduled_date?: string;
  time_slot?: string;
  notes?: string;
  step: number;
}

