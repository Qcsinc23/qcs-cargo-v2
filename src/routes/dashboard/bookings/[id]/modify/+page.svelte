<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { TIME_SLOTS, SATURDAY_SLOTS } from '$lib/config/constants';
  import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    AlertTriangle,
    Loader2,
    CheckCircle,
    XCircle
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  export let data: any;
  $: void data;

  $: bookingId = $page.params.id;

  interface BookingModifyData {
    id: string;
    scheduled_date: string;
    time_slot: string;
    special_instructions: string;
    status: string;
    created: string;
  }

  let booking: BookingModifyData | null = null;
  let isLoading = true;
  let isSaving = false;
  let canModify = false;
  let modifyRestrictionReason = '';
  
  // Form state
  let scheduledDate = '';
  let timeSlot = '';
  let specialInstructions = '';
  let availableSlots: string[] = [];

  // Load booking data
  async function loadBooking() {
    isLoading = true;
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        booking = result.data;
        const b = result.data as BookingModifyData;
        
        // Initialize form fields
        scheduledDate = b.scheduled_date.split('T')[0];
        timeSlot = b.time_slot;
        specialInstructions = b.special_instructions || '';

        // Check if modification is allowed
        checkModificationEligibility();
        
        // Load available slots for current date
        await loadAvailableSlots(scheduledDate);
      } else {
        toast.error('Failed to load booking');
        goto('/dashboard/bookings');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking');
      goto('/dashboard/bookings');
    } finally {
      isLoading = false;
    }
  }

  function checkModificationEligibility() {
    if (!booking) {
      canModify = false;
      return;
    }

    // Check status
    const allowedStatuses = ['pending_payment', 'confirmed'];
    if (!allowedStatuses.includes(booking.status)) {
      canModify = false;
      modifyRestrictionReason = 'This booking cannot be modified in its current status.';
      return;
    }

    // Check 24-hour window before scheduled date
    const b = booking as BookingModifyData;
    const scheduledDateTime = new Date(b.scheduled_date);
    const now = new Date();
    const hoursUntilAppointment = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      canModify = false;
      modifyRestrictionReason = 'Bookings can only be modified up to 24 hours before the scheduled time.';
      return;
    }

    canModify = true;
  }

  async function loadAvailableSlots(date: string) {
    if (!date) return;

    try {
      const response = await fetch(`/api/bookings/time-slots?date=${date}`);
      const result = await response.json();

      if (result.status === 'success') {
        availableSlots = result.data.slots || [];
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Fallback to default slots
      const selectedDate = new Date(date);
      const isSaturday = selectedDate.getDay() === 6;
      availableSlots = isSaturday ? SATURDAY_SLOTS : TIME_SLOTS;
    }
  }

  async function handleDateChange() {
    if (!scheduledDate) return;

    // Validate date is at least 24 hours in the future
    const selectedDate = new Date(scheduledDate);
    const now = new Date();
    const hoursUntilSelected = (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSelected < 24) {
      toast.error('Please select a date at least 24 hours in the future');
      return;
    }

    // Check if Sunday (not allowed)
    if (selectedDate.getDay() === 0) {
      toast.error('We are closed on Sundays. Please select another day.');
      return;
    }

    // Load available slots for new date
    await loadAvailableSlots(scheduledDate);
    
    // Reset time slot if current selection is not available
    if (!availableSlots.includes(timeSlot)) {
      timeSlot = '';
    }
  }

  async function handleSubmit() {
    if (!booking) return;

    // Validate form
    if (!scheduledDate || !timeSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    // Check if anything changed
    const hasChanges = 
      scheduledDate !== booking.scheduled_date.split('T')[0] ||
      timeSlot !== booking.time_slot ||
      specialInstructions !== (booking.special_instructions || '');

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    isSaving = true;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduled_date: scheduledDate,
          time_slot: timeSlot,
          special_instructions: specialInstructions
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Booking updated successfully');
        goto(`/dashboard/bookings/${bookingId}`);
      } else {
        toast.error(result.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking. Please try again.');
    } finally {
      isSaving = false;
    }
  }

  function handleCancel() {
    goto(`/dashboard/bookings/${bookingId}`);
  }

  // Get minimum date (24 hours from now)
  function getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Get maximum date (30 days from now)
  function getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }

  // Load booking on mount
  $: if (bookingId) {
    loadBooking();
  }
</script>

<svelte:head>
  <title>Modify Booking | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Back Link -->
  <a
    href="/dashboard/bookings/{bookingId}"
    class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
  >
    <ArrowLeft class="w-4 h-4 mr-1" />
    Back to Booking Details
  </a>

  {#if isLoading}
    <!-- Loading State -->
    <Card>
      <CardContent class="p-12 text-center">
        <Loader2 class="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
        <p class="text-gray-600">Loading booking details...</p>
      </CardContent>
    </Card>
  {:else if !booking}
    <!-- Not Found -->
    <Card>
      <CardContent class="p-12 text-center">
        <XCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
        <p class="text-gray-600 mb-6">This booking doesn't exist or you don't have access to it.</p>
        <Button href="/dashboard/bookings">View All Bookings</Button>
      </CardContent>
    </Card>
  {:else if !canModify}
    <!-- Cannot Modify -->
    <Card>
      <CardContent class="p-12 text-center">
        <AlertTriangle class="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Cannot Modify Booking</h2>
        <p class="text-gray-600 mb-6">{modifyRestrictionReason}</p>
        <div class="flex gap-3 justify-center">
          <Button variant="outline" href="/dashboard/bookings">View All Bookings</Button>
          <Button href="/dashboard/bookings/{bookingId}">View Details</Button>
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Modification Form -->
    <Card>
      <CardHeader>
        <div class="flex items-start justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              Modify Booking
            </CardTitle>
            <CardDescription class="mt-2">
              Update your drop-off schedule or special instructions
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <!-- Info Alert -->
        <Alert class="mb-6 bg-blue-50 border-blue-200">
          <CheckCircle class="w-4 h-4 text-blue-600" />
          <AlertDescription class="text-blue-800">
            <strong>Free modifications</strong> are allowed up to 24 hours before your scheduled appointment.
          </AlertDescription>
        </Alert>

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Date Selection -->
          <div class="space-y-2">
            <Label for="date" class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              Drop-off Date
            </Label>
            <Input
              id="date"
              type="date"
              bind:value={scheduledDate}
              on:change={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
              disabled={isSaving}
            />
            <p class="text-sm text-gray-500">
              Select a date at least 24 hours in advance (closed Sundays)
            </p>
          </div>

          <!-- Time Slot Selection -->
          <div class="space-y-2">
            <Label for="timeSlot" class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              Time Slot
            </Label>
            <select
              id="timeSlot"
              bind:value={timeSlot}
              required
              disabled={isSaving || !scheduledDate || availableSlots.length === 0}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a time slot</option>
              {#each availableSlots as slot}
                <option value={slot}>{slot}</option>
              {/each}
            </select>
            {#if availableSlots.length === 0 && scheduledDate}
              <p class="text-sm text-amber-600">
                No available slots for this date. Please select another date.
              </p>
            {:else}
              <p class="text-sm text-gray-500">
                All times in Eastern Time (ET)
              </p>
            {/if}
          </div>

          <!-- Special Instructions -->
          <div class="space-y-2">
            <Label for="instructions">
              Special Instructions
              <span class="text-gray-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="instructions"
              bind:value={specialInstructions}
              placeholder="Any special handling instructions or notes..."
              rows={4}
              disabled={isSaving}
            />
            <p class="text-sm text-gray-500">
              Maximum 500 characters
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              on:click={handleCancel}
              disabled={isSaving}
              class="sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !timeSlot || availableSlots.length === 0}
              class="sm:order-2"
            >
              {#if isSaving}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Saving...
              {:else}
                <CheckCircle class="w-4 h-4 mr-2" />
                Save Changes
              {/if}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Help Text -->
    <Card class="bg-gray-50">
      <CardContent class="p-6">
        <h3 class="font-semibold text-gray-900 mb-2">Need to make other changes?</h3>
        <p class="text-sm text-gray-600 mb-4">
          For changes to packages, recipient details, or to cancel your booking, please contact our support team.
        </p>
        <div class="flex flex-wrap gap-4 text-sm">
          <a href="tel:201-249-0929" class="text-primary-600 hover:underline">
            📞 (201) 249-0929
          </a>
          <a href="mailto:support@qcs-cargo.com" class="text-primary-600 hover:underline">
            ✉️ support@qcs-cargo.com
          </a>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
