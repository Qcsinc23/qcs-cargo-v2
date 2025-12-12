import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TIME_SLOTS, SATURDAY_SLOTS } from '$lib/config/constants';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Require authentication
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const dateParam = url.searchParams.get('date');

  if (!dateParam) {
    throw error(400, { message: 'Date parameter is required' });
  }

  const date = new Date(dateParam);
  const now = new Date();

  // Validate date is not in the past
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const requestedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (requestedDate < today) {
    return json({
      status: 'success',
      data: {
        date: dateParam,
        slots: [],
        message: 'Cannot book for past dates'
      }
    });
  }

  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Sunday - closed
  if (dayOfWeek === 0) {
    return json({
      status: 'success',
      data: {
        date: dateParam,
        slots: [],
        message: 'Closed on Sundays'
      }
    });
  }

  // Get base slots based on day
  const baseSlots = dayOfWeek === 6 ? SATURDAY_SLOTS : TIME_SLOTS;

  // Filter out past time slots if date is today
  let availableSlots = [...baseSlots];

  if (requestedDate.getTime() === today.getTime()) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    availableSlots = baseSlots.filter((slot) => {
      // Parse slot start time (e.g., "09:00-10:00" -> 9)
      const slotStartHour = parseInt(slot.split(':')[0], 10);
      
      // Require at least 1 hour advance booking
      if (slotStartHour <= currentHour) {
        return false;
      }
      
      // If within the same hour, need at least 30 min buffer
      if (slotStartHour === currentHour + 1 && currentMinute > 30) {
        return false;
      }

      return true;
    });
  }

  // In production, also check existing bookings to limit capacity per slot
  // For now, we assume unlimited capacity

  // Format slots for display
  const formattedSlots = availableSlots.map((slot) => {
    const [start, end] = slot.split('-');
    const formatTime = (time: string) => {
      const [hour] = time.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    return {
      value: slot,
      label: `${formatTime(start)} - ${formatTime(end)}`,
      available: true // In production, check capacity
    };
  });

  return json({
    status: 'success',
    data: {
      date: dateParam,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      slots: formattedSlots
    }
  });
};





