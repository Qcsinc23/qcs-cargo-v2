import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelative(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/**
 * Format a date in short format (e.g., "Dec 8, 2024")
 */
export function formatDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return format(parsed, 'MMM d, yyyy');
}

/**
 * Format a date with time (e.g., "Dec 8, 2024 at 2:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return format(parsed, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a time slot (e.g., "9:00 AM - 10:00 AM")
 */
export function formatTimeSlot(slot: string): string {
  const [start, end] = slot.split('-');
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format weight in lbs
 */
export function formatWeight(lbs: number): string {
  return `${lbs.toFixed(1)} lbs`;
}

/**
 * Format dimensions
 */
export function formatDimensions(length: number, width: number, height: number): string {
  return `${length}" × ${width}" × ${height}"`;
}

/**
 * Format tracking number with spacing
 */
export function formatTrackingNumber(tracking: string): string {
  // QCS-GY-20241208-0001 format
  return tracking.toUpperCase();
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

