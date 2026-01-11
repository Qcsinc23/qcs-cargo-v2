<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { calculateDeliveryEstimate, type DeliveryEstimate } from '$lib/services/deliveryEstimator';
  import { Clock, Calendar, Truck, Zap, Shield, AlertTriangle, Plane } from 'lucide-svelte';

  export let serviceType: string | null = null;
  export let destinationId: string | null = null;
  export let scheduledDate: string | null = null;
  export let showInCard: boolean = true;

  $: estimate = calculateDeliveryEstimate({
    serviceType: serviceType || '',
    destinationId: destinationId || '',
    scheduledDate: scheduledDate || new Date().toISOString(),
    includeCustoms: true
  });

  function getConfidenceColor(confidence: string): string {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getConfidenceIcon(confidence: string) {
    switch (confidence) {
      case 'high': return Shield;
      case 'medium': return Clock;
      case 'low': return AlertTriangle;
      default: return Clock;
    }
  }

  function getServiceIcon(serviceType: string) {
    switch (serviceType) {
      case 'express': return Zap;
      case 'door-to-door': return Truck;
      default: return Plane;
    }
  }
</script>

{#if estimate}
  {#if showInCard}
    <Card class="border-blue-200 bg-blue-50/50">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-lg">
          <Calendar class="w-5 h-5 text-blue-600" />
          Estimated Delivery
          <Badge variant="outline" class="{getConfidenceColor(estimate.confidence)} ml-auto">
            <svelte:component this={getConfidenceIcon(estimate.confidence)} class="w-3 h-3 mr-1" />
            {estimate.confidence} confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svelte:component this={getServiceIcon(serviceType || '')} class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">{estimate.serviceName}</span>
          </div>
          <div class="text-right">
            <div class="text-lg font-semibold text-gray-900">{estimate.formattedRange}</div>
            <div class="text-xs text-gray-500">{estimate.destinationName}</div>
          </div>
        </div>

        <Alert>
          <Clock class="w-4 h-4" />
          <AlertDescription class="text-sm">
            <strong>{estimate.transitDays.min}-{estimate.transitDays.max} business days</strong>
            after your scheduled drop-off, including customs clearance.
            {#if estimate.confidence === 'high'}
              This is our most reliable estimate.
            {:else if estimate.confidence === 'medium'}
              Transit time may vary slightly based on customs processing.
            {:else}
              Transit time may vary significantly based on destination conditions.
            {/if}
          </AlertDescription>
        </Alert>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500">Earliest delivery</div>
            <div class="font-medium">{estimate.estimatedDelivery.min.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}</div>
          </div>
          <div>
            <div class="text-gray-500">Latest delivery</div>
            <div class="font-medium">{estimate.estimatedDelivery.max.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Compact version for inline display -->
    <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Calendar class="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div class="flex-1">
        <div class="font-medium text-gray-900">{estimate.formattedRange}</div>
        <div class="text-sm text-gray-600">
          {estimate.transitDays.min}-{estimate.transitDays.max} business days
          <Badge variant="outline" class="{getConfidenceColor(estimate.confidence)} ml-2">
            {estimate.confidence}
          </Badge>
        </div>
      </div>
    </div>
  {/if}
{/if}

