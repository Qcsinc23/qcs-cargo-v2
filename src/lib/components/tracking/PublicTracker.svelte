<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    Search, Package, Truck, Plane, CheckCircle2, Clock, 
    MapPin, AlertCircle, Share2, Copy, Check
  } from 'lucide-svelte';
  import { STATUS_COLORS, STATUS_LABELS } from '$lib/config/constants';

  export let initialTrackingNumber = '';

  let trackingNumber = initialTrackingNumber;
  let isLoading = false;
  let error: string | null = null;
  let copied = false;
  
  // Mock tracking data - will be replaced with API call
  let trackingResult: {
    trackingNumber: string;
    status: string;
    destination: string;
    estimatedDelivery: string;
    weight: string;
    events: Array<{
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }>;
  } | null = null;

  const statusIcons: Record<string, typeof Package> = {
    pending: Clock,
    confirmed: CheckCircle2,
    received: Package,
    processing: Package,
    in_transit: Plane,
    customs: MapPin,
    out_for_delivery: Truck,
    delivered: CheckCircle2,
    exception: AlertCircle
  };

  async function trackPackage() {
    if (!trackingNumber.trim()) {
      error = 'Please enter a tracking number';
      return;
    }

    error = null;
    isLoading = true;
    trackingResult = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response - in production, this calls PocketBase
      if (trackingNumber.toUpperCase().startsWith('QCS')) {
        trackingResult = {
          trackingNumber: trackingNumber.toUpperCase(),
          status: 'in_transit',
          destination: 'Georgetown, Guyana',
          estimatedDelivery: 'Dec 12, 2024',
          weight: '15.5 lbs',
          events: [
            {
              status: 'in_transit',
              location: 'Miami, FL - Hub',
              timestamp: 'Dec 8, 2024 2:30 PM',
              description: 'Departed hub facility, in transit to destination'
            },
            {
              status: 'processing',
              location: 'Miami, FL - Hub',
              timestamp: 'Dec 7, 2024 10:15 AM',
              description: 'Package processed and cleared for export'
            },
            {
              status: 'received',
              location: 'Kearny, NJ - Warehouse',
              timestamp: 'Dec 6, 2024 3:45 PM',
              description: 'Package received at warehouse'
            },
            {
              status: 'confirmed',
              location: 'Online',
              timestamp: 'Dec 5, 2024 11:20 AM',
              description: 'Booking confirmed, label generated'
            }
          ]
        };
      } else {
        error = 'Tracking number not found. Please check and try again.';
      }
    } catch {
      error = 'Unable to track package. Please try again later.';
    } finally {
      isLoading = false;
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/track/${trackingNumber}`;
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      trackPackage();
    }
  }
</script>

<div class="max-w-3xl mx-auto">
  <!-- Search Card -->
  <Card class="mb-8">
    <CardHeader class="text-center">
      <CardTitle class="flex items-center justify-center gap-2 text-2xl">
        <Search class="w-6 h-6" />
        Track Your Shipment
      </CardTitle>
      <CardDescription>
        Enter your QCS tracking number to see real-time updates
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex gap-3">
        <Input
          bind:value={trackingNumber}
          placeholder="e.g., QCS-2024-001234"
          class="flex-1 text-lg"
          on:keydown={handleKeydown}
        />
        <Button on:click={trackPackage} disabled={isLoading} class="px-8">
          {isLoading ? 'Tracking...' : 'Track'}
        </Button>
      </div>
      <p class="text-sm text-slate-500 mt-3 text-center">
        Find your tracking number in your confirmation email or booking receipt
      </p>
    </CardContent>
  </Card>

  <!-- Error -->
  {#if error}
    <Alert variant="destructive" class="mb-6">
      <AlertCircle class="w-4 h-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  {/if}

  <!-- Results -->
  {#if trackingResult}
    <Card class="mb-6">
      <CardHeader class="pb-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-500">Tracking Number</p>
            <CardTitle class="text-xl font-mono">{trackingResult.trackingNumber}</CardTitle>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" on:click={copyLink} class="gap-2">
              {#if copied}
                <Check class="w-4 h-4" />
                Copied!
              {:else}
                <Copy class="w-4 h-4" />
                Copy Link
              {/if}
            </Button>
            <Button variant="outline" size="sm" class="gap-2">
              <Share2 class="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Status Badge -->
        {#if trackingResult.status}
          {@const colors = STATUS_COLORS[trackingResult.status] || STATUS_COLORS.pending}
          {@const StatusIcon = statusIcons[trackingResult.status] || Package}
          <div class="flex items-center gap-4 p-4 rounded-lg {colors.bg} {colors.border} border mb-6">
            <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svelte:component this={StatusIcon} class="w-6 h-6 {colors.text}" />
            </div>
            <div class="flex-1">
              <p class="font-semibold {colors.text}">
                {STATUS_LABELS[trackingResult.status] || 'Unknown'}
              </p>
              <p class="text-sm text-slate-600">
                Estimated delivery: {trackingResult.estimatedDelivery}
              </p>
            </div>
          </div>
        {/if}

        <!-- Details Grid -->
        <div class="grid sm:grid-cols-3 gap-4 mb-6">
          <div class="p-3 bg-slate-50 rounded-lg">
            <p class="text-sm text-slate-500">Destination</p>
            <p class="font-medium">{trackingResult.destination}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg">
            <p class="text-sm text-slate-500">Weight</p>
            <p class="font-medium">{trackingResult.weight}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg">
            <p class="text-sm text-slate-500">Est. Delivery</p>
            <p class="font-medium">{trackingResult.estimatedDelivery}</p>
          </div>
        </div>

        <!-- Timeline -->
        <div class="border-t pt-6">
          <h4 class="font-semibold mb-4">Shipment History</h4>
          <div class="space-y-4">
            {#each trackingResult.events as event, index}
              {@const EventIcon = statusIcons[event.status] || Package}
              {@const eventColors = STATUS_COLORS[event.status] || STATUS_COLORS.pending}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full {eventColors.bg} flex items-center justify-center">
                    <svelte:component this={EventIcon} class="w-4 h-4 {eventColors.text}" />
                  </div>
                  {#if index < trackingResult.events.length - 1}
                    <div class="w-0.5 flex-1 bg-slate-200 my-2"></div>
                  {/if}
                </div>
                <div class="flex-1 pb-4">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium text-slate-900">{event.description}</p>
                      <p class="text-sm text-slate-500">{event.location}</p>
                    </div>
                    <p class="text-sm text-slate-400 whitespace-nowrap ml-4">
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Help Section -->
    <div class="text-center text-sm text-slate-500">
      <p>
        Having issues with your shipment? 
        <a href="/contact" class="text-primary-600 hover:underline">Contact Support</a>
      </p>
    </div>
  {/if}
</div>

