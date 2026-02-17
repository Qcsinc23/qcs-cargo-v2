<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { STATUS_COLORS, STATUS_LABELS } from '$lib/config/constants';
  import { getDestinationLabel } from '$lib/config/destinations';
  import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Calendar,
    DollarSign,
    Phone,
    Copy,
    Check,
    Clock,
    CheckCircle,
    Truck,
    Plane,
    FileText
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  // Shipment type definition
  interface Shipment {
    id: string;
    tracking_number: string;
    status: string;
    destination: string;
    weight_lbs: number;
    dim_weight_lbs?: number;
    billable_weight_lbs: number;
    length_in?: number;
    width_in?: number;
    height_in?: number;
    declared_value_usd: number;
    shipping_cost_usd: number;
    insurance_cost_usd: number;
    total_cost_usd: number;
    contents_description: string;
    special_instructions?: string;
    recipient: {
      name: string;
      phone: string;
      address_line1: string;
      address_line2?: string;
      city: string;
    };
    created: string;
    estimated_delivery?: string;
    delivered_at?: string;
    timeline: Array<{
      status: string;
      timestamp: string;
      location?: string;
      note?: string;
    }>;
  }

  export let data: {
    shipment: Shipment | null;
    shipmentId: string;
  };

  let shipment: Shipment | null = data.shipment || null;
  $: shipment = data.shipment || null;
  $: currentShipment = shipment as Shipment | null;

  let copied = false;

  $: shipmentId = data.shipmentId || currentShipment?.tracking_number || '';
  $: statusStyle = currentShipment ? (STATUS_COLORS[currentShipment.status] || STATUS_COLORS.pending) : STATUS_COLORS.pending;

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async function copyTrackingNumber() {
    if (!currentShipment) return;
    try {
      await navigator.clipboard.writeText(currentShipment.tracking_number);
      copied = true;
      toast.success('Tracking number copied!');
      setTimeout(() => { copied = false; }, 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }

  // Status timeline icons
  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    confirmed: CheckCircle,
    received: Package,
    processing: Package,
    in_transit: Plane,
    customs: FileText,
    out_for_delivery: Truck,
    delivered: CheckCircle
  };
</script>

<svelte:head>
  <title>Shipment {shipmentId} | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Back Link -->
  <a
    href="/dashboard/shipments"
    class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
  >
    <ArrowLeft class="w-4 h-4 mr-1" />
    Back to Shipments
  </a>

  {#if !currentShipment}
    <!-- Loading / Not Found State -->
    <Card>
      <CardContent class="p-12 text-center">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
        <p class="text-gray-600 mb-6">This shipment doesn't exist or you don't have access to it.</p>
        <Button href="/dashboard/shipments">View All Shipments</Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold text-gray-900">Shipment Details</h1>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {statusStyle.bg} {statusStyle.text}">
            {STATUS_LABELS[currentShipment.status] || currentShipment.status}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-lg text-primary-600">{currentShipment.tracking_number}</span>
          <Button variant="ghost" size="sm" on:click={copyTrackingNumber}>
            {#if copied}
              <Check class="w-4 h-4 text-green-600" />
            {:else}
              <Copy class="w-4 h-4" />
            {/if}
          </Button>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" href="/tracking?q={currentShipment.tracking_number}">
          Public Tracking
        </Button>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tracking Timeline -->
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            {#if currentShipment.timeline.length === 0}
              <p class="text-gray-500 text-center py-8">No tracking updates yet</p>
            {:else}
              <div class="relative">
                {#each currentShipment.timeline as event, i}
                  {@const Icon = statusIcons[event.status] || Clock}
                  {@const isLast = i === currentShipment.timeline.length - 1}
                  <div class="flex gap-4 pb-6 last:pb-0">
                    <!-- Timeline Line -->
                    <div class="relative flex flex-col items-center">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center {isLast ? 'bg-primary-100' : 'bg-gray-100'}">
                        <Icon class="w-4 h-4 {isLast ? 'text-primary-600' : 'text-gray-400'}" />
                      </div>
                      {#if i < currentShipment.timeline.length - 1}
                        <div class="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                      {/if}
                    </div>

                    <!-- Content -->
                    <div class="flex-1 pt-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900">
                          {STATUS_LABELS[event.status] || event.status}
                        </span>
                        {#if isLast}
                          <Badge variant="outline" class="text-xs">Latest</Badge>
                        {/if}
                      </div>
                      <p class="text-sm text-gray-500">{formatDateTime(event.timestamp)}</p>
                      {#if event.location}
                        <p class="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin class="w-3 h-3" />
                          {event.location}
                        </p>
                      {/if}
                      {#if event.note}
                        <p class="text-sm text-gray-600 mt-1">{event.note}</p>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Package Details -->
        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="grid sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500">Actual Weight</dt>
                <dd class="font-medium text-gray-900">{currentShipment.weight_lbs} lbs</dd>
              </div>
              {#if currentShipment.dim_weight_lbs}
                <div>
                  <dt class="text-sm text-gray-500">Dimensional Weight</dt>
                  <dd class="font-medium text-gray-900">{currentShipment.dim_weight_lbs} lbs</dd>
                </div>
              {/if}
              <div>
                <dt class="text-sm text-gray-500">Billable Weight</dt>
                <dd class="font-medium text-primary-600">{currentShipment.billable_weight_lbs} lbs</dd>
              </div>
              {#if currentShipment.length_in && currentShipment.width_in && currentShipment.height_in}
                <div>
                  <dt class="text-sm text-gray-500">Dimensions</dt>
                  <dd class="font-medium text-gray-900">
                    {currentShipment.length_in}" × {currentShipment.width_in}" × {currentShipment.height_in}"
                  </dd>
                </div>
              {/if}
              <div>
                <dt class="text-sm text-gray-500">Declared Value</dt>
                <dd class="font-medium text-gray-900">{formatCurrency(currentShipment.declared_value_usd)}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-sm text-gray-500">Contents Description</dt>
                <dd class="font-medium text-gray-900">{currentShipment.contents_description}</dd>
              </div>
              {#if currentShipment.special_instructions}
                <div class="sm:col-span-2">
                  <dt class="text-sm text-gray-500">Special Instructions</dt>
                  <dd class="text-gray-900">{currentShipment.special_instructions}</dd>
                </div>
              {/if}
            </dl>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Recipient Info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="w-5 h-5" />
              Recipient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div>
                <p class="font-medium text-gray-900">{currentShipment.recipient.name}</p>
                <p class="text-sm text-primary-600">{getDestinationLabel(currentShipment.destination)}</p>
              </div>
              <div class="flex items-start gap-2 text-sm text-gray-600">
                <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{currentShipment.recipient.address_line1}</p>
                  {#if currentShipment.recipient.address_line2}
                    <p>{currentShipment.recipient.address_line2}</p>
                  {/if}
                  <p>{currentShipment.recipient.city}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Phone class="w-4 h-4" />
                <span>{currentShipment.recipient.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Cost Breakdown -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DollarSign class="w-5 h-5" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">{formatCurrency(currentShipment.shipping_cost_usd)}</span>
              </div>
              {#if currentShipment.insurance_cost_usd > 0}
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Insurance</span>
                  <span class="text-gray-900">{formatCurrency(currentShipment.insurance_cost_usd)}</span>
                </div>
              {/if}
              <div class="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span class="text-primary-600">{formatCurrency(currentShipment.total_cost_usd)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Dates -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Created</span>
                <span class="text-gray-900">{formatDate(currentShipment.created)}</span>
              </div>
              {#if currentShipment.estimated_delivery}
                <div class="flex justify-between">
                  <span class="text-gray-600">Est. Delivery</span>
                  <span class="text-gray-900">{formatDate(currentShipment.estimated_delivery)}</span>
                </div>
              {/if}
              {#if currentShipment.delivered_at}
                <div class="flex justify-between">
                  <span class="text-gray-600">Delivered</span>
                  <span class="text-green-600 font-medium">{formatDate(currentShipment.delivered_at)}</span>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  {/if}
</div>
