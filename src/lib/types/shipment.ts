export interface Shipment {
  id: string;
  bookingId: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  declaredValue: number;
}
