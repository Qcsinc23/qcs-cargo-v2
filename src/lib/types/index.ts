// TypeScript types
// Add your custom types here

export interface StandardResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  error_code?: string;
  data?: T;
}