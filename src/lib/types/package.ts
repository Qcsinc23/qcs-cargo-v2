import type { PackageStatus, TrackingEvent } from './shipment';

export type ExceptionType =
  | 'damage'
  | 'wrong_weight'
  | 'prohibited_item'
  | 'incomplete_info'
  | 'other';

export type ExceptionSeverity = 'minor' | 'major' | 'reject';

export interface Package {
  id: string;
  booking: string;
  tracking_number: string;
  qr_code: string;
  status: PackageStatus;
  weight_lbs?: number;
  weight_estimated: boolean;
  weight_actual?: number;
  length_in?: number;
  width_in?: number;
  height_in?: number;
  dim_weight_lbs?: number;
  billable_weight_lbs?: number;
  declared_value_usd?: number;
  contents_description?: string;
  special_instructions?: string;
  events: TrackingEvent[];
  photos?: string[];
  manifest?: string;
  location?: string;
  exception_type?: ExceptionType;
  exception_severity?: ExceptionSeverity;
  exception_description?: string;
  exception_photos?: string[];
  exception_resolved_at?: string;
  created: string;
  updated: string;
}

export interface PackageInput {
  weight_lbs?: number;
  weight_estimated?: boolean;
  length_in?: number;
  width_in?: number;
  height_in?: number;
  declared_value_usd?: number;
  contents_description?: string;
  special_instructions?: string;
}

