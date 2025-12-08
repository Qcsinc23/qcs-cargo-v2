import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .toLowerCase();

// Phone validation schema (flexible for international)
export const phoneSchema = z
  .string()
  .regex(/^[\d\s+()-]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .optional()
  .or(z.literal(''));

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'.-]+$/, 'Name contains invalid characters');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false)
});

export type LoginInput = z.infer<typeof loginSchema>;

// Registration form schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Profile update schema
export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zip: z.string().max(20).optional(),
  country: z.string().max(100).optional()
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Notification preferences schema
export const notificationPrefsSchema = z.object({
  notification_email: z.boolean(),
  notification_sms: z.boolean(),
  notify_received: z.boolean(),
  notify_transit: z.boolean(),
  notify_delivered: z.boolean()
});

export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;

// Recipient form schema
export const recipientSchema = z.object({
  name: nameSchema,
  phone: z.string().min(10, 'Phone number is required').max(20),
  address_line1: z.string().min(5, 'Address is required').max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  destination: z.enum(['guyana', 'jamaica', 'trinidad', 'barbados', 'suriname']),
  delivery_instructions: z.string().max(500).optional(),
  is_default: z.boolean().optional()
});

export type RecipientInput = z.infer<typeof recipientSchema>;

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(5, 'Subject is required').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000)
});

export type ContactInput = z.infer<typeof contactSchema>;

// Package input schema
export const packageInputSchema = z.object({
  weight_lbs: z.number().min(0.1, 'Weight must be at least 0.1 lbs').max(150, 'Maximum weight is 150 lbs').optional(),
  weight_estimated: z.boolean().default(true),
  length_in: z.number().min(1).max(100).optional(),
  width_in: z.number().min(1).max(100).optional(),
  height_in: z.number().min(1).max(100).optional(),
  declared_value_usd: z.number().min(0).max(10000).optional(),
  contents_description: z.string().max(500).optional(),
  special_instructions: z.string().max(500).optional()
});

export type PackageInputData = z.infer<typeof packageInputSchema>;

// Helper function to validate and return errors
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}

