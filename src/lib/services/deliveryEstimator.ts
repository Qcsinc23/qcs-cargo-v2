import { DESTINATIONS, getDestination } from '$lib/config/destinations';
import { SERVICES_INFO } from '$lib/config/constants';

export interface DeliveryEstimate {
  estimatedDelivery: {
    min: Date;
    max: Date;
  };
  transitDays: {
    min: number;
    max: number;
  };
  businessDays: {
    min: number;
    max: number;
  };
  formattedRange: string;
  serviceName: string;
  destinationName: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DeliveryEstimateOptions {
  serviceType: string;
  destinationId: string;
  scheduledDate: Date | string;
  includeCustoms?: boolean;
}

/**
 * Calculate delivery estimate based on service, destination, and schedule
 */
export function calculateDeliveryEstimate(options: DeliveryEstimateOptions): DeliveryEstimate | null {
  const { serviceType, destinationId, scheduledDate, includeCustoms = true } = options;

  // Get destination data
  const destination = getDestination(destinationId);
  if (!destination) return null;

  // Get service data
  const service = SERVICES_INFO.find(s => s.id === serviceType);
  if (!service) return null;

  // Parse scheduled date
  const scheduleDate = new Date(scheduledDate);
  if (isNaN(scheduleDate.getTime())) return null;

  // Get base transit days from destination
  let transitMin = destination.transitDays.min;
  let transitMax = destination.transitDays.max;

  // Adjust based on service type
  switch (serviceType) {
    case 'express':
      // Express reduces transit time by 2 days minimum
      transitMin = Math.max(1, transitMin - 2);
      transitMax = Math.max(1, transitMax - 2);
      break;
    case 'standard':
    case 'door-to-door':
    case 'consolidated':
      // Standard transit times as defined
      break;
    default:
      break;
  }

  // Add customs clearance time if requested (typically 1-2 business days)
  if (includeCustoms) {
    transitMin += 1;
    transitMax += 2;
  }

  // Calculate business days (excluding weekends)
  const businessDaysMin = calculateBusinessDays(scheduleDate, transitMin);
  const businessDaysMax = calculateBusinessDays(scheduleDate, transitMax);

  // Calculate actual delivery dates
  const minDeliveryDate = addBusinessDays(scheduleDate, businessDaysMin);
  const maxDeliveryDate = addBusinessDays(scheduleDate, businessDaysMax);

  // Format the date range
  const formattedRange = formatDateRange(minDeliveryDate, maxDeliveryDate);

  // Determine confidence level
  const confidence = transitMin === transitMax ? 'high' : 'medium';

  return {
    estimatedDelivery: {
      min: minDeliveryDate,
      max: maxDeliveryDate
    },
    transitDays: {
      min: transitMin,
      max: transitMax
    },
    businessDays: {
      min: businessDaysMin,
      max: businessDaysMax
    },
    formattedRange,
    serviceName: service.name,
    destinationName: destination.name,
    confidence
  };
}

/**
 * Calculate business days between dates, excluding weekends
 */
function calculateBusinessDays(startDate: Date, businessDays: number): number {
  let totalDays = 0;
  let businessDayCount = 0;
  const current = new Date(startDate);

  while (businessDayCount < businessDays) {
    current.setDate(current.getDate() + 1);
    totalDays++;

    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDayCount++;
    }
  }

  return totalDays;
}

/**
 * Add business days to a date, skipping weekends
 */
function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Format date range for display
 */
function formatDateRange(minDate: Date, maxDate: Date): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (minDate.toDateString() === maxDate.toDateString()) {
    // Same day
    return formatDate(minDate);
  } else {
    // Date range
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  }
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a business day
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Get the next business day
 */
export function getNextBusinessDay(date: Date): Date {
  const nextDay = new Date(date);
  do {
    nextDay.setDate(nextDay.getDate() + 1);
  } while (!isBusinessDay(nextDay));
  return nextDay;
}

/**
 * Get available drop-off days (business days only)
 */
export function getAvailableDropOffDays(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  const maxDays = 14; // Show next 2 weeks

  for (let i = 0; i < maxDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Only include business days
    if (isBusinessDay(date)) {
      days.push(date);
    }
  }

  return days;
}

/**
 * Validate that scheduled date is valid for booking
 */
export function validateScheduledDate(scheduledDate: Date, destinationId: string): {
  isValid: boolean;
  reason?: string;
  earliestDate?: Date;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduleDate = new Date(scheduledDate);
  scheduleDate.setHours(0, 0, 0, 0);

  // Must be today or future
  if (scheduleDate < today) {
    return {
      isValid: false,
      reason: 'Scheduled date cannot be in the past'
    };
  }

  // Must be a business day
  if (!isBusinessDay(scheduleDate)) {
    return {
      isValid: false,
      reason: 'Drop-off only available on business days (Mon-Fri)'
    };
  }

  // Must be within 14 days
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);

  if (scheduleDate > maxDate) {
    return {
      isValid: false,
      reason: 'Scheduled date must be within 14 days',
      earliestDate: today
    };
  }

  return { isValid: true };
}




