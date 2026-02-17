export interface Booking {
  id: string;
  userId: string;
  trackingNumber: string;
  destination: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'received'
    | 'processing'
    | 'in_transit'
    | 'customs'
    | 'out_for_delivery'
    | 'delivered'
    | 'canceled'
    | 'cancelled'
    | 'exception';
  createdAt: string;
  updatedAt: string;
}
