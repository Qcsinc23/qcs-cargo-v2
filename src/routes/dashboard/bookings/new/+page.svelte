<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { SERVICES_INFO } from '$lib/config/constants';
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
    Clock
  } from 'lucide-svelte';

  export let data;

  // Wizard state
  let currentStep = 1;
  const totalSteps = 5;

  // Step 1: Service Selection
  let selectedService: string | null = null;

  // Step 2: Destination
  let selectedDestination: string | null = null;

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

  function selectService(serviceId: string) {
    selectedService = serviceId;
  }

  function selectDestination(destId: string) {
    selectedDestination = destId;
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1: return selectedService !== null;
      case 2: return selectedDestination !== null;
      default: return true;
    }
  }
</script>

<svelte:head>
  <title>New Booking | QCS Cargo</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <!-- Progress Indicator -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-2">
      {#each Array(totalSteps) as _, i}
        {@const stepNum = i + 1}
        <div class="flex items-center {i < totalSteps - 1 ? 'flex-1' : ''}">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
              {stepNum < currentStep ? 'bg-primary-600 text-white' : 
               stepNum === currentStep ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' : 
               'bg-gray-100 text-gray-500'}"
          >
            {#if stepNum < currentStep}
              <Check class="w-4 h-4" />
            {:else}
              {stepNum}
            {/if}
          </div>
          {#if i < totalSteps - 1}
            <div class="flex-1 h-0.5 mx-2 {stepNum < currentStep ? 'bg-primary-600' : 'bg-gray-200'}" />
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex justify-between text-xs text-gray-500">
      <span>Service</span>
      <span>Destination</span>
      <span>Packages</span>
      <span>Recipient</span>
      <span>Review</span>
    </div>
  </div>

  <!-- Step Content -->
  <Card>
    <CardContent class="p-6 sm:p-8">
      {#if currentStep === 1}
        <!-- Step 1: Service Selection -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Choose Your Service</h2>
            <p class="text-gray-600 mt-1">Select the shipping service that best fits your needs</p>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            {#each bookableServices as service}
              {@const Icon = serviceIcons[service.id] || Package}
              {@const isSelected = selectedService === service.id}
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

          {#if selectedService === 'express'}
            <Alert class="bg-amber-50 border-amber-200">
              <Info class="w-4 h-4 text-amber-600" />
              <AlertDescription class="text-amber-800">
                Express service includes priority handling and next-flight guarantee. A 25% surcharge applies over standard rates.
              </AlertDescription>
            </Alert>
          {/if}
        </div>

      {:else if currentStep === 2}
        <!-- Step 2: Destination Selection -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Select Destination</h2>
            <p class="text-gray-600 mt-1">Where are you shipping to?</p>
          </div>

          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {#each DESTINATIONS as dest}
              {@const isSelected = selectedDestination === dest.id}
              <button
                type="button"
                class="p-4 rounded-lg border-2 transition-all hover:shadow-md text-center
                  {isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
                on:click={() => selectDestination(dest.id)}
              >
                <span class="text-3xl mb-2 block">{dest.flag}</span>
                <h3 class="font-semibold text-gray-900">{dest.name}</h3>
                <p class="text-sm text-gray-500">{dest.capital}</p>
                <div class="mt-2 text-sm">
                  <span class="text-primary-600 font-medium">${dest.baseRate}/lb</span>
                  <span class="text-gray-400 mx-1">•</span>
                  <span class="text-gray-600">{dest.transitDays.min}-{dest.transitDays.max} days</span>
                </div>
                {#if isSelected}
                  <div class="mt-2">
                    <Check class="w-5 h-5 text-primary-600 mx-auto" />
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

      {:else if currentStep === 3}
        <!-- Step 3: Package Details (Placeholder) -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Package Details</h2>
            <p class="text-gray-600 mt-1">Tell us about your packages</p>
          </div>

          <div class="py-12 text-center">
            <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Package details form coming in Week 5</p>
            <p class="text-sm text-gray-400 mt-2">Multi-package support with weight, dimensions, and contents</p>
          </div>
        </div>

      {:else if currentStep === 4}
        <!-- Step 4: Recipient (Placeholder) -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Recipient Details</h2>
            <p class="text-gray-600 mt-1">Select or add a recipient</p>
          </div>

          <div class="py-12 text-center">
            <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Recipient selection coming in Week 5</p>
            <p class="text-sm text-gray-400 mt-2">Choose from saved recipients or add new</p>
          </div>
        </div>

      {:else if currentStep === 5}
        <!-- Step 5: Review & Payment (Placeholder) -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Review & Pay</h2>
            <p class="text-gray-600 mt-1">Confirm your booking details</p>
          </div>

          <div class="py-12 text-center">
            <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Review and payment coming in Week 5</p>
            <p class="text-sm text-gray-400 mt-2">Stripe integration for secure payments</p>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Navigation Buttons -->
  <div class="flex justify-between mt-6">
    <Button
      variant="outline"
      disabled={currentStep === 1}
      on:click={prevStep}
    >
      <ArrowLeft class="w-4 h-4 mr-2" />
      Previous
    </Button>

    {#if currentStep < totalSteps}
      <Button
        disabled={!canProceed()}
        on:click={nextStep}
      >
        Next
        <ArrowRight class="w-4 h-4 ml-2" />
      </Button>
    {:else}
      <Button disabled>
        Complete Booking
        <Check class="w-4 h-4 ml-2" />
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

