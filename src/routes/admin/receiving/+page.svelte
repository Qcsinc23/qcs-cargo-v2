<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { 
    Search, 
    Scan,
    Package,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Scale,
    Ruler,
    Camera,
    ArrowRight,
    RotateCcw,
    Printer
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let mode: 'scan' | 'search' | 'manual' = 'scan';
  let searchQuery = '';
  let scannedCode = '';
  let selectedBooking: typeof todayBookings[0] | null = null;
  let receivingPackage: {
    trackingNumber: string;
    actualWeight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    condition: 'good' | 'damaged' | 'missing_contents';
    notes: string;
  } | null = null;

  // Mock today's scheduled drop-offs
  const todayBookings = [
    { id: 'BK-2024-0095', customer: 'Maria G.', time: '10:00 AM', packages: 3, status: 'checked_in', destination: 'Guyana' },
    { id: 'BK-2024-0094', customer: 'Devon T.', time: '11:30 AM', packages: 1, status: 'pending', destination: 'Jamaica' },
    { id: 'BK-2024-0093', customer: 'Patricia W.', time: '02:00 PM', packages: 2, status: 'pending', destination: 'Trinidad' },
    { id: 'BK-2024-0092', customer: 'James R.', time: '03:00 PM', packages: 1, status: 'pending', destination: 'Barbados' },
    { id: 'BK-2024-0091', customer: 'Lisa M.', time: '03:30 PM', packages: 4, status: 'pending', destination: 'Trinidad' }
  ];

  // Mock recently received packages
  const recentlyReceived = [
    { id: 'PKG-2024-0312', booking: 'BK-2024-0095', customer: 'Maria G.', weight: 23.5, time: '10:15 AM' },
    { id: 'PKG-2024-0311', booking: 'BK-2024-0095', customer: 'Maria G.', weight: 18.2, time: '10:12 AM' },
    { id: 'PKG-2024-0310', booking: 'BK-2024-0095', customer: 'Maria G.', weight: 12.8, time: '10:08 AM' }
  ];

  function startReceiving(booking: typeof todayBookings[0]) {
    selectedBooking = booking;
    receivingPackage = {
      trackingNumber: `PKG-2024-${String(313 + recentlyReceived.length).padStart(4, '0')}`,
      actualWeight: null,
      length: null,
      width: null,
      height: null,
      condition: 'good',
      notes: ''
    };
  }

  function completeReceiving() {
    // In production, this would save to backend
    alert(`Package ${receivingPackage?.trackingNumber} received successfully!`);
    receivingPackage = null;
  }

  function cancelReceiving() {
    receivingPackage = null;
  }

  $: dimWeight = receivingPackage?.length && receivingPackage?.width && receivingPackage?.height
    ? (receivingPackage.length * receivingPackage.width * receivingPackage.height) / 166
    : null;
  
  $: billableWeight = receivingPackage?.actualWeight && dimWeight
    ? Math.max(receivingPackage.actualWeight, dimWeight)
    : receivingPackage?.actualWeight || dimWeight || null;
</script>

<svelte:head>
  <title>Receiving | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Package Receiving</h1>
      <p class="text-slate-500">Check in customer packages and record weights</p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant={mode === 'scan' ? 'default' : 'outline'} size="sm" on:click={() => mode = 'scan'}>
        <Scan class="h-4 w-4 mr-2" />
        Scan Mode
      </Button>
      <Button variant={mode === 'search' ? 'default' : 'outline'} size="sm" on:click={() => mode = 'search'}>
        <Search class="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Receiving Area -->
    <div class="lg:col-span-2 space-y-6">
      {#if receivingPackage}
        <!-- Active Receiving Form -->
        <Card class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Receiving Package</h2>
              <p class="text-sm text-slate-500">Booking: {selectedBooking?.id} · {selectedBooking?.customer}</p>
            </div>
            <span class="text-lg font-mono font-bold text-blue-600">{receivingPackage.trackingNumber}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Weight -->
            <div class="space-y-2">
              <label for="weight-input" class="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Scale class="h-4 w-4 text-slate-400" />
                Actual Weight (lbs)
              </label>
              <Input
                id="weight-input"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter weight..."
                bind:value={receivingPackage.actualWeight}
              />
            </div>

            <!-- Dimensions -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Ruler class="h-4 w-4 text-slate-400" />
                Dimensions (in)
              </label>
              <div class="grid grid-cols-3 gap-2">
                <Input
                  id="length-input"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="L"
                  bind:value={receivingPackage.length}
                  aria-label="Length in inches"
                />
                <Input
                  id="width-input"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="W"
                  bind:value={receivingPackage.width}
                  aria-label="Width in inches"
                />
                <Input
                  id="height-input"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="H"
                  bind:value={receivingPackage.height}
                  aria-label="Height in inches"
                />
              </div>
            </div>
          </div>

          <!-- Calculated Weights -->
          {#if dimWeight || billableWeight}
            <div class="mt-4 p-4 bg-slate-50 rounded-lg grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-xs text-slate-500">Actual</p>
                <p class="text-lg font-semibold">{receivingPackage.actualWeight || '-'} lbs</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Dimensional</p>
                <p class="text-lg font-semibold">{dimWeight ? dimWeight.toFixed(1) : '-'} lbs</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Billable</p>
                <p class="text-lg font-bold text-emerald-600">{billableWeight ? billableWeight.toFixed(1) : '-'} lbs</p>
              </div>
            </div>
          {/if}

          <!-- Condition -->
          <div class="mt-6 space-y-2">
            <fieldset>
              <legend class="text-sm font-medium text-slate-700">Package Condition</legend>
              <div class="flex gap-3">
                <Button
                  variant={receivingPackage.condition === 'good' ? 'default' : 'outline'}
                  size="sm"
                  on:click={() => receivingPackage && (receivingPackage.condition = 'good')}
                >
                  <CheckCircle2 class="h-4 w-4 mr-2" />
                  Good
                </Button>
                <Button
                  variant={receivingPackage.condition === 'damaged' ? 'destructive' : 'outline'}
                  size="sm"
                  on:click={() => receivingPackage && (receivingPackage.condition = 'damaged')}
                >
                  <AlertTriangle class="h-4 w-4 mr-2" />
                  Damaged
                </Button>
              </div>
            </fieldset>
          </div>

          <!-- Notes -->
          <div class="mt-4 space-y-2">
            <label for="notes-input" class="text-sm font-medium text-slate-700">Notes (Optional)</label>
            <textarea
              id="notes-input"
              class="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
              placeholder="Any observations about the package..."
              bind:value={receivingPackage.notes}
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex items-center gap-3">
            <Button class="flex-1" on:click={completeReceiving} disabled={!receivingPackage.actualWeight}>
              <CheckCircle2 class="h-4 w-4 mr-2" />
              Complete & Print Label
            </Button>
            <Button variant="outline" on:click={cancelReceiving}>
              <RotateCcw class="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      {:else}
        <!-- Scan/Search Area -->
        <Card class="p-6">
          {#if mode === 'scan'}
            <div class="text-center py-8">
              <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scan class="h-10 w-10 text-slate-400" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Scan Booking QR Code</h3>
              <p class="text-slate-500 mb-4">Point scanner at the customer's booking QR code</p>
              <Input 
                type="text" 
                placeholder="Or enter booking ID manually..."
                class="max-w-xs mx-auto"
                bind:value={scannedCode}
              />
            </div>
          {:else}
            <div>
              <div class="relative mb-4">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Search by booking #, customer name, or phone..."
                  class="pl-10"
                  bind:value={searchQuery}
                />
              </div>
              <p class="text-sm text-slate-500">Or select from today's scheduled drop-offs below</p>
            </div>
          {/if}
        </Card>

        <!-- Today's Bookings -->
        <Card class="overflow-hidden">
          <div class="p-4 border-b bg-slate-50">
            <h3 class="font-semibold text-slate-900">Today's Drop-offs</h3>
          </div>
          <div class="divide-y">
            {#each todayBookings as booking (booking.id)}
              <div class="p-4 flex items-center justify-between hover:bg-slate-50">
                <div class="flex items-center gap-4">
                  <div class={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    booking.status === 'checked_in' ? 'bg-emerald-100' : 'bg-slate-100'
                  )}>
                    {#if booking.status === 'checked_in'}
                      <CheckCircle2 class="h-6 w-6 text-emerald-600" />
                    {:else}
                      <Clock class="h-6 w-6 text-slate-400" />
                    {/if}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{booking.customer}</p>
                    <p class="text-sm text-slate-500">
                      {booking.time} · {booking.packages} package{booking.packages > 1 ? 's' : ''} · {booking.destination}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={booking.status === 'checked_in' ? 'outline' : 'default'}
                  size="sm"
                  on:click={() => startReceiving(booking)}
                >
                  {booking.status === 'checked_in' ? 'Add Package' : 'Check In'}
                  <ArrowRight class="h-4 w-4 ml-2" />
                </Button>
              </div>
            {/each}
          </div>
        </Card>
      {/if}
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Quick Stats -->
      <Card class="p-4">
        <h3 class="font-semibold text-slate-900 mb-4">Today's Progress</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Scheduled</span>
            <span class="font-semibold">{todayBookings.length}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Checked In</span>
            <span class="font-semibold text-emerald-600">{todayBookings.filter(b => b.status === 'checked_in').length}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Packages Received</span>
            <span class="font-semibold">{recentlyReceived.length}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div 
              class="bg-emerald-500 h-2 rounded-full"
              style="width: {(todayBookings.filter(b => b.status === 'checked_in').length / todayBookings.length) * 100}%"
            ></div>
          </div>
        </div>
      </Card>

      <!-- Recently Received -->
      <Card class="overflow-hidden">
        <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 class="font-semibold text-slate-900">Recently Received</h3>
          <Button variant="ghost" size="sm">
            <Printer class="h-4 w-4" />
          </Button>
        </div>
        <div class="divide-y max-h-[300px] overflow-y-auto">
          {#each recentlyReceived as pkg (pkg.id)}
            <div class="p-3 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-900">{pkg.id}</p>
                <p class="text-xs text-slate-500">{pkg.customer} · {pkg.weight} lbs</p>
              </div>
              <span class="text-xs text-slate-400">{pkg.time}</span>
            </div>
          {/each}
        </div>
      </Card>

      <!-- Quick Actions -->
      <Card class="p-4">
        <h3 class="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div class="space-y-2">
          <Button variant="outline" class="w-full justify-start" size="sm">
            <Camera class="h-4 w-4 mr-2" />
            Scan Package Label
          </Button>
          <Button variant="outline" class="w-full justify-start" size="sm">
            <Package class="h-4 w-4 mr-2" />
            Manual Package Entry
          </Button>
          <Button variant="outline" class="w-full justify-start" size="sm">
            <Printer class="h-4 w-4 mr-2" />
            Reprint Last Label
          </Button>
        </div>
      </Card>
    </div>
  </div>
</div>

