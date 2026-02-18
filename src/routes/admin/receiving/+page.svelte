<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { NumericInput } from '$lib/components/ui/numeric-input';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
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
    Printer,
    WifiOff,
    Cloud,
    RefreshCw
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from '$lib/stores/toast';
  import { 
    isOnline,
    pendingScans,
    syncStatus,
    initDB,
    initConnectivityMonitor,
    initAudioFeedback,
    saveScan,
    loadPendingScans,
    syncPendingScans,
    playSuccessSound,
    playErrorSound,
    triggerHaptic,
    generateTrackingNumber,
    calculateDimWeight,
    getBillableWeight,
    cacheBookings,
    getCachedBookings,
    type OfflineScan,
    type OfflineBooking
  } from '$lib/services/offlineScanner';
  import SyncStatusBadge from '$lib/components/layout/SyncStatusBadge.svelte';

  let mode: 'scan' | 'search' | 'manual' = 'scan';
  let searchQuery = '';
  let scannedCode = '';
  let selectedBooking: Booking | null = null;
  let isLoading = false;
  let isSubmitting = false;

  interface Booking {
    id: string;
    customer: string;
    time: string;
    packages: number;
    status: string;
    destination: string;
  }

  interface ReceivingPackage {
    trackingNumber: string;
    actualWeight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    condition: 'good' | 'damaged' | 'missing_contents';
    notes: string;
  }

  let receivingPackage: ReceivingPackage | null = null;
  let todayBookings: Booking[] = [];
  let recentlyReceived: Array<{
    id: string;
    booking: string;
    customer: string;
    weight: number;
    time: string;
    synced: boolean;
  }> = [];

  // Cleanup function for connectivity monitor
  let cleanup: (() => void) | null = null;

  onMount(async () => {
    // Initialize offline services
    await initDB();
    cleanup = initConnectivityMonitor();
    initAudioFeedback();

    // Load data
    await loadTodayBookings();
    await loadRecentScans();
  });

  onDestroy(() => {
    cleanup?.();
  });

  // Load today's bookings from API or cache
  async function loadTodayBookings() {
    isLoading = true;
    
    try {
      if ($isOnline) {
        const response = await fetch('/api/admin/bookings/today');
        if (!response.ok) {
          throw new Error(`Failed to load bookings (${response.status})`);
        }

        const result = await response.json();
        if (result.status === 'success') {
          todayBookings = result.data.items || [];
          // Cache for offline use
          await cacheBookings(todayBookings.map(b => ({
            ...b,
            cachedAt: new Date().toISOString()
          })));
        } else {
          throw new Error('Unexpected bookings response');
        }
      } else {
        // Load from cache
        const cached = await getCachedBookings();
        todayBookings = cached;
        if (cached.length > 0) {
          toast.info('Using cached booking data (offline)');
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Try to load from cache
      const cached = await getCachedBookings();
      todayBookings = cached;
      if ($isOnline && cached.length === 0) {
        toast.error('Unable to load today bookings right now');
      }
    } finally {
      isLoading = false;
    }
  }

  // Load recent scans from IndexedDB
  async function loadRecentScans() {
    try {
      const { getAllScans } = await import('$lib/services/offlineScanner');
      const scans = await getAllScans();
      
      // Convert to display format
      recentlyReceived = scans
        .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
        .slice(0, 10)
        .map(scan => ({
          id: scan.trackingNumber,
          booking: scan.bookingId,
          customer: todayBookings.find(b => b.id === scan.bookingId)?.customer || 'Unknown',
          weight: scan.actualWeight,
          time: new Date(scan.scannedAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          synced: scan.synced
        }));
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  }

  function startReceiving(booking: Booking) {
    if (!['pending', 'checked_in'].includes(booking.status)) {
      toast.error(`Booking ${booking.id} is not available for receiving`);
      return;
    }

    selectedBooking = booking;
    receivingPackage = {
      trackingNumber: generateTrackingNumber(),
      actualWeight: null,
      length: null,
      width: null,
      height: null,
      condition: 'good',
      notes: ''
    };
  }

  async function completeReceiving() {
    if (!receivingPackage || !selectedBooking || !receivingPackage.actualWeight) {
      toast.error('Please enter the package weight');
      return;
    }

    isSubmitting = true;

    try {
      // Calculate weights
      const dimWeight = receivingPackage.length && receivingPackage.width && receivingPackage.height
        ? calculateDimWeight(receivingPackage.length, receivingPackage.width, receivingPackage.height)
        : undefined;
      
      const billableWeight = dimWeight
        ? getBillableWeight(receivingPackage.actualWeight, dimWeight)
        : receivingPackage.actualWeight;

      // Save to IndexedDB (works offline)
      const scan = await saveScan({
        bookingId: selectedBooking.id,
        trackingNumber: receivingPackage.trackingNumber,
        actualWeight: receivingPackage.actualWeight,
        length: receivingPackage.length || undefined,
        width: receivingPackage.width || undefined,
        height: receivingPackage.height || undefined,
        dimWeight,
        billableWeight,
        condition: receivingPackage.condition,
        notes: receivingPackage.notes || undefined,
        scannedAt: new Date().toISOString(),
        scannedBy: typeof $page.data?.user?.id === 'string' ? $page.data.user.id : 'unknown-user'
      });

      let syncedThisScan = false;

      if ($isOnline) {
        await syncPendingScans();
        const pendingAfterSync = await loadPendingScans();
        syncedThisScan = !pendingAfterSync.some((pending) => pending.id === scan.id);
      }

      // Feedback
      if (syncedThisScan || !$isOnline) {
        playSuccessSound();
        triggerHaptic('success');
      } else {
        playErrorSound();
        triggerHaptic('warning');
      }

      if (syncedThisScan) {
        toast.success(`Package ${receivingPackage.trackingNumber} received!`);
      } else if ($isOnline) {
        toast.warning(`Package ${receivingPackage.trackingNumber} saved locally but not synced`, {
          description: 'It will retry automatically. You can also use "Sync" from this page.'
        });
      } else {
        toast.info(`Package saved offline - will sync when connected`);
      }

      // Mark booking as checked-in after first successful receive attempt.
      todayBookings = todayBookings.map((booking) =>
        booking.id === selectedBooking?.id ? { ...booking, status: 'checked_in' } : booking
      );

      // Update local state
      recentlyReceived = [
        {
          id: scan.trackingNumber,
          booking: scan.bookingId,
          customer: selectedBooking.customer,
          weight: scan.actualWeight,
          time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          synced: syncedThisScan
        },
        ...recentlyReceived.slice(0, 9)
      ];

      // Reset form
      receivingPackage = null;
      selectedBooking = null;

    } catch (error) {
      console.error('Error saving scan:', error);
      playErrorSound();
      triggerHaptic('error');
      toast.error('Failed to save package. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  function cancelReceiving() {
    receivingPackage = null;
    selectedBooking = null;
  }

  async function handleManualSync() {
    const result = await syncPendingScans();
    await loadRecentScans();
    if (result.synced > 0) {
      toast.success(`${result.synced} scan(s) synced successfully`);
    }
    if (result.failed > 0) {
      toast.error(`${result.failed} scan(s) failed to sync`);
    }
  }

  // Handle barcode scanner input
  function handleScanInput(event: KeyboardEvent) {
    if (event.key === 'Enter' && scannedCode) {
      const booking = todayBookings.find(b => 
        b.id.toLowerCase() === scannedCode.toLowerCase()
      );
      
      if (booking) {
        startReceiving(booking);
        scannedCode = '';
        playSuccessSound();
        triggerHaptic('success');
      } else {
        toast.error('Booking not found');
        playErrorSound();
        triggerHaptic('error');
      }
    }
  }

  // Calculated weights
  $: dimWeight = receivingPackage?.length && receivingPackage?.width && receivingPackage?.height
    ? calculateDimWeight(receivingPackage.length, receivingPackage.width, receivingPackage.height)
    : null;
  
  $: billableWeight = receivingPackage?.actualWeight && dimWeight
    ? getBillableWeight(receivingPackage.actualWeight, dimWeight)
    : receivingPackage?.actualWeight || null;

  // Filter bookings based on search
  $: filteredBookings = searchQuery
    ? todayBookings.filter(b => 
        b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : todayBookings;
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
    <div class="flex items-center gap-3">
      <!-- Sync Status Badge -->
      <SyncStatusBadge />
      
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
  </div>

  <!-- Offline Alert -->
  {#if !$isOnline}
    <Alert class="bg-amber-50 border-amber-200">
      <WifiOff class="w-4 h-4 text-amber-600" />
      <AlertDescription class="text-amber-800">
        <strong>You're offline.</strong> Scans will be saved locally and automatically synced when you reconnect.
        {#if $pendingScans.length > 0}
          <span class="ml-2">({$pendingScans.length} pending)</span>
        {/if}
      </AlertDescription>
    </Alert>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Receiving Area -->
    <div class="lg:col-span-2 space-y-6">
      {#if receivingPackage && selectedBooking}
        <!-- Active Receiving Form -->
        <Card class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Receiving Package</h2>
              <p class="text-sm text-slate-500">Booking: {selectedBooking.id} · {selectedBooking.customer}</p>
            </div>
            <span class="text-lg font-mono font-bold text-blue-600">{receivingPackage.trackingNumber}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Weight -->
            <div class="space-y-2">
              <label for="weight-input" class="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Scale class="h-4 w-4 text-slate-400" />
                Actual Weight (lbs) <span class="text-red-500">*</span>
              </label>
              <NumericInput
                id="weight-input"
                placeholder="Enter weight..."
                bind:value={receivingPackage.actualWeight}
                options={{ precision: 1, valueRange: { min: 0 } }}
              />
            </div>

            <!-- Dimensions -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Ruler class="h-4 w-4 text-slate-400" />
                Dimensions (in)
              </label>
              <div class="grid grid-cols-3 gap-2">
                <NumericInput
                  id="length-input"
                  placeholder="L"
                  bind:value={receivingPackage.length}
                  options={{ precision: 1, valueRange: { min: 0 } }}
                  aria-label="Length in inches"
                />
                <NumericInput
                  id="width-input"
                  placeholder="W"
                  bind:value={receivingPackage.width}
                  options={{ precision: 1, valueRange: { min: 0 } }}
                  aria-label="Width in inches"
                />
                <NumericInput
                  id="height-input"
                  placeholder="H"
                  bind:value={receivingPackage.height}
                  options={{ precision: 1, valueRange: { min: 0 } }}
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
              <div class="flex gap-3 mt-2">
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
            <Button 
              class="flex-1" 
              on:click={completeReceiving} 
              disabled={!receivingPackage.actualWeight || isSubmitting}
            >
              {#if isSubmitting}
                <RefreshCw class="h-4 w-4 mr-2 animate-spin" />
                Saving...
              {:else}
                <CheckCircle2 class="h-4 w-4 mr-2" />
                Complete Receiving
              {/if}
            </Button>
            <Button variant="outline" on:click={cancelReceiving} disabled={isSubmitting}>
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
                on:keydown={handleScanInput}
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
          <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">Today's Drop-offs</h3>
            {#if isLoading}
              <RefreshCw class="h-4 w-4 text-slate-400 animate-spin" />
            {/if}
          </div>
          <div class="divide-y">
            {#each filteredBookings as booking (booking.id)}
              <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
            {:else}
              <div class="p-8 text-center text-slate-500">
                {#if searchQuery}
                  No bookings found matching "{searchQuery}"
                {:else if isLoading}
                  Loading bookings...
                {:else}
                  No scheduled drop-offs for today
                {/if}
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
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Pending Sync</span>
            <span class="font-semibold {$pendingScans.length > 0 ? 'text-amber-600' : 'text-emerald-600'}">
              {$pendingScans.length}
            </span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div 
              class="bg-emerald-500 h-2 rounded-full transition-all"
              style="width: {todayBookings.length > 0 ? (todayBookings.filter(b => b.status === 'checked_in').length / todayBookings.length) * 100 : 0}%"
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
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-slate-900">{pkg.id}</p>
                  {#if !pkg.synced}
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                      <Cloud class="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-slate-500">{pkg.customer} · {pkg.weight} lbs</p>
              </div>
              <span class="text-xs text-slate-400">{pkg.time}</span>
            </div>
          {:else}
            <div class="p-4 text-center text-slate-500 text-sm">
              No packages received yet
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
          {#if $pendingScans.length > 0 && $isOnline}
            <Button 
              variant="outline" 
              class="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50" 
              size="sm"
              on:click={handleManualSync}
              disabled={$syncStatus === 'syncing'}
            >
              <RefreshCw class="h-4 w-4 mr-2 {$syncStatus === 'syncing' ? 'animate-spin' : ''}" />
              {$syncStatus === 'syncing' ? 'Syncing...' : `Sync ${$pendingScans.length} Scan${$pendingScans.length > 1 ? 's' : ''}`}
            </Button>
          {/if}
        </div>
      </Card>
    </div>
  </div>
</div>
