// Standard API Response
export interface StandardResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  error_code?: string;
  data?: T;
}

// Re-export all types
export * from './shipment';
export * from './booking';
export * from './recipient';
export * from './package';
