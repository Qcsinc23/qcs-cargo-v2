import type { DestinationId } from '$lib/config/destinations';

export interface Recipient {
  id: string;
  user: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  destination: DestinationId;
  delivery_instructions?: string;
  is_default: boolean;
  usage_count: number;
  created: string;
  updated: string;
}

export interface RecipientInput {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  destination: DestinationId;
  delivery_instructions?: string;
  is_default?: boolean;
}

