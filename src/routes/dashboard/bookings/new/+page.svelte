<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { DESTINATIONS, getDestination, getDestinationLabel } from '$lib/config/destinations';
  import { SERVICES_INFO, TIME_SLOTS, SATURDAY_SLOTS } from '$lib/config/constants';
  import { booking, currentStep, packageCount, hasMultiplePackages, totalWeight, hasUnknownWeight, type BookingPackage, type BookingRecipient, createEmptyPackage } from '$lib/stores/booking';
  import { toast } from '$lib/stores/toast';

  type WizardStep = 1 | 2 | 3 | 4 | 5;
  
  function goToWizardStep(stepNum: number) {
    booking.goToStep(stepNum as WizardStep);
  }
  
  import {
    Package,
    Plane,
    Truck,
    Layers,
    Zap,
    ArrowRight,
    ArrowLeft,
    Check,
    Info,
    Clock,
    Plus,
    Trash2,
    Scale,
    Ruler,
    DollarSign,
    User,
    MapPin,
    Phone,
    Calendar,
    CreditCard,
    AlertTriangle,
    HelpCircle
  } from 'lucide-svelte';

  export let data;

  // Get store state
  $: bookingState = $booking;
  $: step = $currentStep;

  // Service icons mapping
  const serviceIcons: Record<string, typeof Package> = {
    standard: Plane,
    express: Zap,
    'door-to-door': Truck,
    consolidated: Layers
  };

  // Available services for booking
  const bookableServices = SERVICES_INFO.filter(s => 
    ['standard', 'express', 'door-to-door', 'consolidated'].includes(s.id)
  );

  // Placeholder saved recipients
  let savedRecipients: Array<BookingRecipient & { id: string }> = [];

  // New recipient form state
  let showNewRecipientForm = false;
  let newRecipient: BookingRecipient = {
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    destination: '',
    deliveryInstructions: '',
    saveForFuture: false
  };

  // Schedule state
  let selectedDate = '';
  let availableSlots: string[] = [];

  // Form errors
  let errors: Record<string, string> = {};
  let submitting = false;

  // Step validation
  function canProceed(): boolean {
    switch (step) {
      case 1: 
        return bookingState.serviceType !== null && bookingState.destination !== null;
      case 2: 
        return bookingState.packages.length > 0 && 
               bookingState.packages.every(p => (p.weight !== null && p.weight > 0) || p.weightUnknown);
      case 3:
        return bookingState.recipient !== null && 
               !!bookingState.recipient.name &&
               !!bookingState.recipient.phone &&
               !!bookingState.recipient.addressLine1;
      case 4:
        return !!bookingState.scheduledDate && !!bookingState.timeSlot;
      case 5:
        return bookingState.quote !== null;
      default:
        return false;
    }
  }

  function nextStep() {
    if (!canProceed()) return;
    
    // Generate quote when moving to step 5
    if (step === 4) {
      generateQuote();
    }
    
    booking.nextStep();
  }

  function prevStep() {
    booking.prevStep();
  }

  // Step 1: Service & Destination
  function selectService(serviceId: string) {
    booking.setService(serviceId as 'standard' | 'express' | 'door_to_door' | 'consolidated');
  }

  function selectDestination(destId: string) {
    booking.setDestination(destId);
    // Update new recipient destination if form is open
    newRecipient.destination = destId;
  }

  // Step 2: Package Management
  function addPackage() {
    if (bookingState.packages.length >= 20) return;
    booking.addPackage();
  }

  function removePackage(id: string) {
    if (bookingState.packages.length === 1) return;
    booking.removePackage(id);
  }

  function updatePackage(id: string, field: keyof BookingPackage, value: unknown) {
    booking.updatePackage(id, { [field]: value });
  }

  function toggleWeightUnknown(pkg: BookingPackage) {
    booking.updatePackage(pkg.id, { 
      weightUnknown: !pkg.weightUnknown,
      weight: null 
    });
  }

  function toggleDimensionsUnknown(pkg: BookingPackage) {
    booking.updatePackage(pkg.id, { 
      dimensionsUnknown: !pkg.dimensionsUnknown,
      length: null,
      width: null,
      height: null
    });
  }

  // Step 3: Recipient
  function selectSavedRecipient(recipient: BookingRecipient & { id: string }) {
    booking.selectSavedRecipient(recipient.id, recipient);
    showNewRecipientForm = false;
  }

  function startNewRecipient() {
    showNewRecipientForm = true;
    newRecipient = {
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      destination: bookingState.destination || '',
      deliveryInstructions: '',
      saveForFuture: false
    };
  }

  function saveNewRecipient() {
    errors = {};
    
    if (!newRecipient.name) errors.name = 'Name is required';
    if (!newRecipient.phone) errors.phone = 'Phone is required';
    if (!newRecipient.addressLine1) errors.address = 'Address is required';
    if (!newRecipient.city) errors.city = 'City is required';
    
    if (Object.keys(errors).length > 0) return;
    
    booking.setRecipient(newRecipient);
    showNewRecipientForm = false;
  }

  // Step 4: Schedule
  function selectDate(date: string) {
    selectedDate = date;
    
    // Determine available time slots based on day of week
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) {
      availableSlots = []; // Sunday - closed
    } else if (dayOfWeek === 6) {
      availableSlots = SATURDAY_SLOTS;
    } else {
      availableSlots = TIME_SLOTS;
    }
    
    // Clear time slot if date changes
    if (bookingState.scheduledDate !== date) {
      booking.setSchedule(date, '');
    }
  }

  function selectTimeSlot(slot: string) {
    booking.setSchedule(selectedDate, slot);
  }

  // Get next 14 days for scheduling
  function getAvailableDates(): Array<{ date: string; label: string; dayName: string; disabled: boolean }> {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      
      dates.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        disabled: isSunday
      });
    }
    
    return dates;
  }

  // Step 5: Generate Quote
  function generateQuote() {
    const dest = getDestination(bookingState.destination || '');
    if (!dest) return;

    const baseRate = dest.baseRate;
    const packageQuotes = bookingState.packages.map(pkg => {
      const weight = pkg.weightUnknown ? 5 : (pkg.weight || 0); // Estimate 5 lbs if unknown
      
      // Calculate dimensional weight if dimensions provided
      let dimWeight = 0;
      if (pkg.length && pkg.width && pkg.height) {
        dimWeight = (pkg.length * pkg.width * pkg.height) / 166;
      }
      
      const billableWeight = Math.max(weight, dimWeight);
      const cost = billableWeight * baseRate;
      
      return {
        id: pkg.id,
        weight,
        dimWeight: Math.round(dimWeight * 10) / 10,
        billableWeight: Math.round(billableWeight * 10) / 10,
        cost: Math.round(cost * 100) / 100
      };
    });

    const subtotal = packageQuotes.reduce((sum, p) => sum + p.cost, 0);
    
    // Multi-package discount: 5% off for 2+ packages, 10% for 5+
    let discountPercent = 0;
    if (packageQuotes.length >= 5) discountPercent = 0.10;
    else if (packageQuotes.length >= 2) discountPercent = 0.05;
    
    const multiPackageDiscount = subtotal * discountPercent;
    
    // Insurance estimate (3% of declared value or $5 minimum)
    const totalDeclaredValue = bookingState.packages.reduce((sum, p) => sum + (p.declaredValue || 0), 0);
    const insuranceCost = totalDeclaredValue > 0 ? Math.max(totalDeclaredValue * 0.03, 5) : 0;
    
    // Express surcharge
    let surcharge = 0;
    if (bookingState.serviceType === 'express') {
      surcharge = subtotal * 0.25;
    }
    
    const totalCost = subtotal - multiPackageDiscount + insuranceCost + surcharge;

    booking.setQuote({
      packages: packageQuotes,
      subtotal: Math.round(subtotal * 100) / 100,
      multiPackageDiscount: Math.round(multiPackageDiscount * 100) / 100,
      insuranceCost: Math.round(insuranceCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      transitDays: `${dest.transitDays.min}-${dest.transitDays.max} business days`
    });
  }

  // Submit Booking
  async function submitBooking() {
    if (submitting) return;

    if (!bookingState.quote) {
      toast.error('No quote generated');
      return;
    }

    const totalCost = bookingState.quote.totalCost;
    if (typeof totalCost !== 'number' || !Number.isFinite(totalCost) || totalCost <= 0) {
      toast.error('Invalid quote total');
      return;
    }

    submitting = true;
    try {
      // Merge computed quote fields (cost/billable weights) into packages for backend persistence.
      const quoteById = new Map(bookingState.quote.packages.map((p) => [p.id, p]));
      const packagesForApi = bookingState.packages.map((pkg) => ({ ...pkg, ...quoteById.get(pkg.id) }));

      const recipientId = bookingState.recipient?.id || null;
      const newRecipient = recipientId ? null : bookingState.recipient;

      // 1) Create booking (backend sets status to pending_payment).
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingState.serviceType,
          destination: bookingState.destination,
          scheduledDate: bookingState.scheduledDate,
          timeSlot: bookingState.timeSlot,
          packages: packagesForApi,
          recipientId,
          recipient: newRecipient,
          quote: bookingState.quote
        })
      });

      const bookingJson = await bookingResponse.json().catch(() => null);
      if (!bookingResponse.ok || bookingJson?.status !== 'success') {
        const msg = bookingJson?.message || 'Failed to create booking';
        throw new Error(msg);
      }

      const bookingId = bookingJson.data?.bookingId;
      if (!bookingId) throw new Error('Booking created but missing bookingId');

      // 2) Create payment intent (send dollars as string to avoid float rounding).
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCost.toFixed(2),
          bookingId,
          description: `QCS Cargo Booking ${bookingId}`
        })
      });

      const paymentJson = await paymentResponse.json().catch(() => null);
      if (!paymentResponse.ok || paymentJson?.status !== 'success') {
        const msg = paymentJson?.message || 'Failed to create payment intent';
        throw new Error(msg);
      }

      const paymentIntentId = paymentJson.data?.paymentIntentId;
      if (paymentIntentId) booking.setPaymentIntent(paymentIntentId);

      toast.success('Booking created. Payment pending.');
      booking.reset();
      goto(`/dashboard/bookings/${bookingId}`);
    } catch (err) {
      console.error('Booking submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      submitting = false;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<svelte:head>
  <title>New Booking | QCS Cargo</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <!-- Progress Indicator -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-2">
      {#each [1, 2, 3, 4, 5] as stepNum}
        <div class="flex items-center {stepNum < 5 ? 'flex-1' : ''}">
          <button
            type="button"
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
              {stepNum < step ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700' : 
               stepNum === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' : 
               'bg-gray-100 text-gray-400 cursor-not-allowed'}"
            disabled={stepNum > step}
            on:click={() => { if (stepNum < step) goToWizardStep(stepNum); }}
          >
            {#if stepNum < step}
              <Check class="w-5 h-5" />
            {:else}
              {stepNum}
            {/if}
          </button>
          {#if stepNum < 5}
            <div class="flex-1 h-1 mx-2 rounded {stepNum < step ? 'bg-primary-600' : 'bg-gray-200'}" />
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex justify-between text-xs text-gray-500 px-1">
      <span class="w-10 text-center">Service</span>
      <span class="w-10 text-center">Packages</span>
      <span class="w-10 text-center">Recipient</span>
      <span class="w-10 text-center">Schedule</span>
      <span class="w-10 text-center">Review</span>
    </div>
  </div>

  <!-- Step Content -->
  <Card>
    <CardContent class="p-6 sm:p-8">
      {#if step === 1}
        <!-- Step 1: Service & Destination Selection -->
        <div class="space-y-8">
          <!-- Service Selection -->
          <div class="space-y-4">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900">Choose Your Service</h2>
              <p class="text-gray-600 mt-1">Select the shipping service that best fits your needs</p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              {#each bookableServices as service}
                {@const Icon = serviceIcons[service.id] || Package}
                {@const isSelected = bookingState.serviceType === service.id}
                <button
                  type="button"
                  class="text-left p-4 rounded-lg border-2 transition-all hover:shadow-md
                    {isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
                  on:click={() => selectService(service.id)}
                >
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center
                      {isSelected ? 'bg-primary-100' : 'bg-gray-100'}">
                      <Icon class="w-6 h-6 {isSelected ? 'text-primary-600' : 'text-gray-500'}" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-900">{service.name}</h3>
                        {#if isSelected}
                          <Check class="w-5 h-5 text-primary-600" />
                        {/if}
                      </div>
                      <p class="text-sm text-gray-500 mt-0.5">{service.tagline}</p>
                      <div class="flex items-center gap-3 mt-2 text-sm">
                        {#if service.startingPrice}
                          <span class="text-primary-600 font-medium">
                            From ${service.startingPrice}{service.priceUnit}
                          </span>
                        {:else if service.priceNote}
                          <span class="text-primary-600 font-medium">{service.priceNote}</span>
                        {/if}
                        <span class="text-gray-400">•</span>
                        <span class="text-gray-600 flex items-center gap-1">
                          <Clock class="w-3 h-3" />
                          {service.transitTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Destination Selection -->
          <div class="space-y-4 pt-6 border-t">
            <div class="text-center">
              <h2 class="text-xl font-bold text-gray-900">Select Destination</h2>
              <p class="text-gray-600 mt-1">Where are you shipping to?</p>
            </div>

            <div class="grid sm:grid-cols-3 md:grid-cols-5 gap-3">
              {#each DESTINATIONS as dest}
                {@const isSelected = bookingState.destination === dest.id}
                <button
                  type="button"
                  class="p-3 rounded-lg border-2 transition-all hover:shadow-md text-center
                    {isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
                  on:click={() => selectDestination(dest.id)}
                >
                  <span class="text-2xl block">{dest.flag}</span>
                  <h3 class="font-medium text-gray-900 text-sm mt-1">{dest.name}</h3>
                  <p class="text-xs text-primary-600 font-medium mt-1">${dest.baseRate}/lb</p>
                </button>
              {/each}
            </div>
          </div>

          {#if bookingState.serviceType === 'express'}
            <Alert class="bg-amber-50 border-amber-200">
              <Info class="w-4 h-4 text-amber-600" />
              <AlertDescription class="text-amber-800">
                Express service includes priority handling and next-flight guarantee. A 25% surcharge applies over standard rates.
              </AlertDescription>
            </Alert>
          {/if}
        </div>

      {:else if step === 2}
        <!-- Step 2: Package Details -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Package Details</h2>
              <p class="text-gray-600 mt-1">
                {$packageCount === 1 ? 'Enter your package information' : `${$packageCount} packages in this booking`}
              </p>
            </div>
            
            {#if bookingState.packages.length < 20}
              <Button variant="outline" on:click={addPackage}>
                <Plus class="w-4 h-4 mr-2" />
                Add Package
              </Button>
            {/if}
          </div>

          {#if $hasMultiplePackages}
            <Alert class="bg-green-50 border-green-200">
              <Info class="w-4 h-4 text-green-600" />
              <AlertDescription class="text-green-800">
                Multi-package discount: {bookingState.packages.length >= 5 ? '10%' : '5%'} off your order!
              </AlertDescription>
            </Alert>
          {/if}

          <!-- Package Cards -->
          <div class="space-y-6">
            {#each bookingState.packages as pkg, index (pkg.id)}
              <Card class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Package class="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 class="font-medium">Package {index + 1}</h3>
                  </div>
                  
                  {#if bookingState.packages.length > 1}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      on:click={() => removePackage(pkg.id)}
                      class="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  {/if}
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                  <!-- Weight -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <Label class="flex items-center gap-2">
                        <Scale class="w-4 h-4 text-gray-400" />
                        Weight (lbs) *
                      </Label>
                      <label class="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={pkg.weightUnknown}
                          on:change={() => toggleWeightUnknown(pkg)}
                          class="rounded border-gray-300"
                        />
                        I don't know
                      </label>
                    </div>
                    
                    {#if !pkg.weightUnknown}
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="150"
                        value={pkg.weight || ''}
                        on:input={(e) => updatePackage(pkg.id, 'weight', parseFloat(e.currentTarget.value) || null)}
                        placeholder="Enter weight"
                      />
                    {:else}
                      <div class="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                        We'll weigh your package at the warehouse and update the cost.
                      </div>
                    {/if}
                  </div>

                  <!-- Dimensions -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <Label class="flex items-center gap-2">
                        <Ruler class="w-4 h-4 text-gray-400" />
                        Dimensions (in)
                      </Label>
                      <label class="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={pkg.dimensionsUnknown}
                          on:change={() => toggleDimensionsUnknown(pkg)}
                          class="rounded border-gray-300"
                        />
                        I don't know
                      </label>
                    </div>
                    
                    {#if !pkg.dimensionsUnknown}
                      <div class="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={pkg.length || ''}
                          on:input={(e) => updatePackage(pkg.id, 'length', parseInt(e.currentTarget.value) || null)}
                          placeholder="L"
                        />
                        <Input
                          type="number"
                          min="1"
                          value={pkg.width || ''}
                          on:input={(e) => updatePackage(pkg.id, 'width', parseInt(e.currentTarget.value) || null)}
                          placeholder="W"
                        />
                        <Input
                          type="number"
                          min="1"
                          value={pkg.height || ''}
                          on:input={(e) => updatePackage(pkg.id, 'height', parseInt(e.currentTarget.value) || null)}
                          placeholder="H"
                        />
                      </div>
                    {:else}
                      <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        We'll measure at the warehouse.
                      </div>
                    {/if}
                  </div>

                  <!-- Declared Value -->
                  <div class="space-y-2">
                    <Label class="flex items-center gap-2">
                      <DollarSign class="w-4 h-4 text-gray-400" />
                      Declared Value (USD)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={pkg.declaredValue || ''}
                      on:input={(e) => updatePackage(pkg.id, 'declaredValue', parseFloat(e.currentTarget.value) || null)}
                      placeholder="For insurance (optional)"
                    />
                  </div>

                  <!-- Contents -->
                  <div class="space-y-2">
                    <Label>Contents Description</Label>
                    <Input
                      value={pkg.contentsDescription}
                      on:input={(e) => updatePackage(pkg.id, 'contentsDescription', e.currentTarget.value)}
                      placeholder="e.g., Clothing, Electronics"
                    />
                  </div>
                </div>
              </Card>
            {/each}
          </div>

          {#if $hasUnknownWeight}
            <Alert>
              <HelpCircle class="w-4 h-4" />
              <AlertDescription>
                Packages with unknown weight will be weighed at our warehouse. The final cost may differ from the estimate.
              </AlertDescription>
            </Alert>
          {/if}
        </div>

      {:else if step === 3}
        <!-- Step 3: Recipient -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Recipient Details</h2>
            <p class="text-gray-600 mt-1">Select or add a recipient in {getDestinationLabel(bookingState.destination || '')}</p>
          </div>

          {#if !showNewRecipientForm}
            <!-- Saved Recipients -->
            {#if savedRecipients.length > 0}
              <div class="space-y-3">
                <h3 class="font-medium text-gray-900">Saved Recipients</h3>
                {#each savedRecipients as recipient}
                  {@const isSelected = bookingState.recipient?.id === recipient.id}
                  <button
                    type="button"
                    class="w-full text-left p-4 rounded-lg border-2 transition-all
                      {isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
                    on:click={() => selectSavedRecipient(recipient)}
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-gray-900">{recipient.name}</p>
                        <p class="text-sm text-gray-600">{recipient.addressLine1}, {recipient.city}</p>
                        <p class="text-sm text-gray-500">{recipient.phone}</p>
                      </div>
                      {#if isSelected}
                        <Check class="w-5 h-5 text-primary-600" />
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            {/if}

            <Button variant="outline" class="w-full" on:click={startNewRecipient}>
              <Plus class="w-4 h-4 mr-2" />
              Add New Recipient
            </Button>

          {:else}
            <!-- New Recipient Form -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="font-medium text-gray-900">New Recipient</h3>
                <Button variant="ghost" size="sm" on:click={() => showNewRecipientForm = false}>
                  Cancel
                </Button>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="recipientName">Full Name *</Label>
                  <Input
                    id="recipientName"
                    bind:value={newRecipient.name}
                    placeholder="John Doe"
                    class={errors.name ? 'border-red-500' : ''}
                  />
                  {#if errors.name}<p class="text-sm text-red-500">{errors.name}</p>{/if}
                </div>

                <div class="space-y-2">
                  <Label for="recipientPhone">Phone Number *</Label>
                  <Input
                    id="recipientPhone"
                    bind:value={newRecipient.phone}
                    placeholder="+1 (555) 123-4567"
                    class={errors.phone ? 'border-red-500' : ''}
                  />
                  {#if errors.phone}<p class="text-sm text-red-500">{errors.phone}</p>{/if}
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label for="recipientAddress">Street Address *</Label>
                  <Input
                    id="recipientAddress"
                    bind:value={newRecipient.addressLine1}
                    placeholder="123 Main Street"
                    class={errors.address ? 'border-red-500' : ''}
                  />
                  {#if errors.address}<p class="text-sm text-red-500">{errors.address}</p>{/if}
                </div>

                <div class="space-y-2">
                  <Label for="recipientAddress2">Apt, Suite, etc.</Label>
                  <Input
                    id="recipientAddress2"
                    bind:value={newRecipient.addressLine2}
                    placeholder="Optional"
                  />
                </div>

                <div class="space-y-2">
                  <Label for="recipientCity">City *</Label>
                  <Input
                    id="recipientCity"
                    bind:value={newRecipient.city}
                    placeholder="Georgetown"
                    class={errors.city ? 'border-red-500' : ''}
                  />
                  {#if errors.city}<p class="text-sm text-red-500">{errors.city}</p>{/if}
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label for="deliveryInstructions">Delivery Instructions</Label>
                  <textarea
                    id="deliveryInstructions"
                    bind:value={newRecipient.deliveryInstructions}
                    placeholder="Gate code, landmarks, etc."
                    rows={2}
                    class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      bind:checked={newRecipient.saveForFuture}
                      class="rounded border-gray-300"
                    />
                    <span class="text-sm text-gray-700">Save this recipient for future bookings</span>
                  </label>
                </div>
              </div>

              <Button class="w-full" on:click={saveNewRecipient}>
                <Check class="w-4 h-4 mr-2" />
                Use This Recipient
              </Button>
            </div>
          {/if}

          {#if bookingState.recipient && !showNewRecipientForm}
            <Card class="bg-primary-50 border-primary-200 p-4">
              <div class="flex items-start gap-3">
                <User class="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">{bookingState.recipient.name}</p>
                  <p class="text-sm text-gray-600">{bookingState.recipient.addressLine1}</p>
                  {#if bookingState.recipient.addressLine2}
                    <p class="text-sm text-gray-600">{bookingState.recipient.addressLine2}</p>
                  {/if}
                  <p class="text-sm text-gray-600">{bookingState.recipient.city}</p>
                  <p class="text-sm text-gray-500">{bookingState.recipient.phone}</p>
                </div>
              </div>
            </Card>
          {/if}
        </div>

      {:else if step === 4}
        <!-- Step 4: Schedule -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Schedule Drop-off</h2>
            <p class="text-gray-600 mt-1">Select when you'll bring your packages to our warehouse</p>
          </div>

          <!-- Date Selection -->
          <div class="space-y-3">
            <Label>Select Date</Label>
            <div class="grid grid-cols-7 gap-2">
              {#each getAvailableDates() as dateOption}
                {@const isSelected = selectedDate === dateOption.date}
                <button
                  type="button"
                  class="p-2 rounded-lg border text-center transition-all
                    {dateOption.disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                     isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 
                     'border-gray-200 hover:border-gray-300'}"
                  disabled={dateOption.disabled}
                  on:click={() => selectDate(dateOption.date)}
                >
                  <div class="text-xs text-gray-500">{dateOption.dayName}</div>
                  <div class="font-medium text-sm">{dateOption.label}</div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Time Slot Selection -->
          {#if selectedDate}
            <div class="space-y-3">
              <Label>Select Time</Label>
              {#if availableSlots.length === 0}
                <Alert class="bg-amber-50 border-amber-200">
                  <AlertTriangle class="w-4 h-4 text-amber-600" />
                  <AlertDescription class="text-amber-800">
                    We're closed on Sundays. Please select another date.
                  </AlertDescription>
                </Alert>
              {:else}
                <div class="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {#each availableSlots as slot}
                    {@const isSelected = bookingState.timeSlot === slot}
                    <button
                      type="button"
                      class="p-3 rounded-lg border text-sm transition-all
                        {isSelected ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 
                         'border-gray-200 hover:border-gray-300'}"
                      on:click={() => selectTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          {#if bookingState.scheduledDate && bookingState.timeSlot}
            <Card class="bg-primary-50 border-primary-200 p-4">
              <div class="flex items-center gap-3">
                <Calendar class="w-5 h-5 text-primary-600" />
                <div>
                  <p class="font-medium text-gray-900">
                    {new Date(bookingState.scheduledDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p class="text-sm text-gray-600">{bookingState.timeSlot}</p>
                </div>
              </div>
            </Card>
          {/if}
        </div>

      {:else if step === 5}
        <!-- Step 5: Review & Payment -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Review & Pay</h2>
            <p class="text-gray-600 mt-1">Confirm your booking details</p>
          </div>

          <!-- Summary Cards -->
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Service & Destination -->
            <Card class="p-4">
              <h3 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Plane class="w-4 h-4" />
                Service
              </h3>
              <p class="text-gray-600">
                {bookableServices.find(s => s.id === bookingState.serviceType)?.name || 'N/A'}
              </p>
              <p class="text-sm text-primary-600">
                → {getDestinationLabel(bookingState.destination || '')}
              </p>
            </Card>

            <!-- Schedule -->
            <Card class="p-4">
              <h3 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                Drop-off
              </h3>
              <p class="text-gray-600">
                {bookingState.scheduledDate ? new Date(bookingState.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
              <p class="text-sm text-gray-500">{bookingState.timeSlot}</p>
            </Card>

            <!-- Recipient -->
            <Card class="p-4">
              <h3 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <User class="w-4 h-4" />
                Recipient
              </h3>
              {#if bookingState.recipient}
                <p class="text-gray-600">{bookingState.recipient.name}</p>
                <p class="text-sm text-gray-500">{bookingState.recipient.city}</p>
              {/if}
            </Card>

            <!-- Packages -->
            <Card class="p-4">
              <h3 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Package class="w-4 h-4" />
                Packages
              </h3>
              <p class="text-gray-600">{$packageCount} package{$packageCount > 1 ? 's' : ''}</p>
              <p class="text-sm text-gray-500">
                {$hasUnknownWeight ? 'Weight TBD at warehouse' : `~${$totalWeight} lbs total`}
              </p>
            </Card>
          </div>

          <!-- Cost Breakdown -->
          {#if bookingState.quote}
            <Card class="p-6">
              <h3 class="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign class="w-5 h-5" />
                Cost Summary
              </h3>
              
              <div class="space-y-3">
                {#each bookingState.quote.packages as pkg, i}
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Package {i + 1} ({pkg.billableWeight} lbs)</span>
                    <span>{formatCurrency(pkg.cost)}</span>
                  </div>
                {/each}

                <div class="border-t pt-3 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(bookingState.quote.subtotal)}</span>
                  </div>

                  {#if bookingState.quote.multiPackageDiscount > 0}
                    <div class="flex justify-between text-sm text-green-600">
                      <span>Multi-package discount</span>
                      <span>-{formatCurrency(bookingState.quote.multiPackageDiscount)}</span>
                    </div>
                  {/if}

                  {#if bookingState.quote.insuranceCost > 0}
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Insurance</span>
                      <span>{formatCurrency(bookingState.quote.insuranceCost)}</span>
                    </div>
                  {/if}

                  {#if bookingState.serviceType === 'express'}
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Express surcharge (25%)</span>
                      <span>{formatCurrency(bookingState.quote.subtotal * 0.25)}</span>
                    </div>
                  {/if}
                </div>

                <div class="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span class="text-primary-600">{formatCurrency(bookingState.quote.totalCost)}</span>
                </div>

                <p class="text-xs text-gray-500 text-center">
                  Estimated delivery: {bookingState.quote.transitDays}
                </p>
              </div>
            </Card>
          {/if}

          {#if $hasUnknownWeight}
            <Alert class="bg-amber-50 border-amber-200">
              <AlertTriangle class="w-4 h-4 text-amber-600" />
              <AlertDescription class="text-amber-800">
                Some packages have unknown weight. Final charges will be calculated after weighing at our warehouse.
              </AlertDescription>
            </Alert>
          {/if}

          <!-- Payment Button -->
          <Button class="w-full h-12 text-lg" on:click={submitBooking} disabled={submitting}>
            {#if submitting}
              <div class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            {:else}
              <CreditCard class="w-5 h-5 mr-2" />
              Complete Booking
            {/if}
          </Button>

          <p class="text-xs text-gray-500 text-center">
            By completing this booking, you agree to our Terms of Service and Shipping Policy.
          </p>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Navigation Buttons -->
  <div class="flex justify-between mt-6">
    <Button
      variant="outline"
      disabled={step === 1}
      on:click={prevStep}
    >
      <ArrowLeft class="w-4 h-4 mr-2" />
      Previous
    </Button>

    {#if step < 5}
      <Button
        disabled={!canProceed()}
        on:click={nextStep}
      >
        Next
        <ArrowRight class="w-4 h-4 ml-2" />
      </Button>
    {/if}
  </div>

  <!-- Back to Dashboard -->
  <div class="mt-8 text-center">
    <a href="/dashboard/bookings" class="text-sm text-gray-500 hover:text-gray-700">
      ← Back to My Bookings
    </a>
  </div>
</div>
