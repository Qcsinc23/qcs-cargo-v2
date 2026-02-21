<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import { Package, CheckCircle, AlertTriangle, Loader2, Scan, Keyboard } from 'lucide-svelte';

  $: preloadCode = $page.url.searchParams.get('scan') || '';

  let manualInput = '';
  let lastScan: { code: string; result: 'found' | 'not_found' | 'exception'; scanned: any } | null = null;
  let scanning = false;

  onMount(() => {
    if (preloadCode) handleScan(preloadCode);
    // Focus the input
    document.getElementById('scan-input')?.focus();
  });

  async function handleScan(code: string) {
    if (scanning) return;
    scanning = true;

    try {
      const res = await fetch(`/api/warehouse/packages/lookup?code=${encodeURIComponent(code)}`);

      if (res.status === 404) {
        lastScan = { code, result: 'not_found', scanned: null };
        toast.error(`Package not found: ${code}`);
        return;
      }

      if (!res.ok) throw new Error('Lookup failed');
      const pkg = await res.json();

      if (pkg.status === 'exception') {
        lastScan = { code, result: 'exception', scanned: pkg };
        toast.warning(`Exception package: ${code}`);
      } else {
        lastScan = { code, result: 'found', scanned: pkg };
        toast.success(`Package found: ${pkg.tracking_number}`);
      }
    } catch (err) {
      toast.error(`Scan error for ${code}`);
      lastScan = { code, result: 'not_found', scanned: null };
    } finally {
      scanning = false;
    }
  }

  function viewPackage() {
    if (lastScan?.scanned?.id) goto(`/warehouse/packages/${lastScan.scanned.id}`);
  }

  function receivePackage() {
    if (lastScan?.scanned?.tracking_number) goto(`/warehouse/receiving?scan=${lastScan.scanned.tracking_number}`);
    else if (lastScan?.code) goto(`/warehouse/receiving?scan=${lastScan.code}`);
  }

  function reportException() {
    if (lastScan?.scanned?.tracking_number) goto(`/warehouse/exception/new?tracking=${lastScan.scanned.tracking_number}`);
    else if (lastScan?.code) goto(`/warehouse/exception/new?tracking=${lastScan.code}`);
  }
</script>

<svelte:head>
  <title>Scan | Warehouse | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Scan Package</h1>
    <p class="text-gray-500">Scan a QR code or barcode to look up a package</p>
  </div>

  <!-- Manual / USB scan input -->
  <div class="max-w-lg">
    <Card class="bg-gray-900 rounded-xl overflow-hidden">
      <div class="p-6">
        <div class="flex items-center gap-2 text-white mb-4">
          <Scan class="w-5 h-5 text-blue-400" />
          <span class="font-medium">Enter Tracking / QR Code</span>
        </div>
        <form
          on:submit|preventDefault={() => { if (manualInput.trim()) { handleScan(manualInput.trim().toUpperCase()); manualInput = ''; } }}
          class="flex gap-2"
        >
          <Input
            id="scan-input"
            bind:value={manualInput}
            placeholder="QCS2412150001ABCD"
            class="flex-1 text-lg font-mono uppercase bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            autofocus
            disabled={scanning}
          />
          <Button type="submit" disabled={!manualInput.trim() || scanning}>
            {#if scanning}<Loader2 class="w-4 h-4 animate-spin" />{:else}Scan{/if}
          </Button>
        </form>
        <p class="text-gray-400 text-xs mt-3 flex items-center gap-1">
          <Keyboard class="w-3 h-3" />
          USB barcode scanners also work — just scan and the code is captured automatically
        </p>
      </div>
    </Card>
  </div>

  <!-- Result -->
  {#if lastScan}
    <Card class="max-w-lg {lastScan.result === 'found' ? 'border-green-200 bg-green-50/50' : lastScan.result === 'exception' ? 'border-orange-200 bg-orange-50/50' : 'border-red-200 bg-red-50/50'}">
      <CardContent class="p-4">
        <div class="flex items-start gap-3">
          {#if lastScan.result === 'found'}
            <CheckCircle class="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          {:else if lastScan.result === 'exception'}
            <AlertTriangle class="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          {:else}
            <Package class="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          {/if}

          <div class="flex-1">
            <p class="font-medium text-gray-900">
              {lastScan.result === 'found' ? 'Package Found' : lastScan.result === 'exception' ? 'Exception Package' : 'Not Found'}
            </p>
            <p class="text-sm text-gray-600 font-mono mt-0.5">{lastScan.code}</p>

            {#if lastScan.scanned}
              <div class="mt-2 text-sm text-gray-600 space-y-0.5">
                <p>Status: <span class="font-medium capitalize">{lastScan.scanned.status?.replace('_', ' ')}</span></p>
                {#if lastScan.scanned.destination}
                  <p>Destination: <span class="font-medium capitalize">{lastScan.scanned.destination}</span></p>
                {/if}
              </div>
            {/if}

            <div class="mt-3 flex flex-wrap gap-2">
              {#if lastScan.result === 'found' || lastScan.result === 'exception'}
                <Button size="sm" on:click={viewPackage}>View Package</Button>
                <Button size="sm" variant="outline" on:click={receivePackage}>Process</Button>
              {/if}
              {#if lastScan.result === 'not_found'}
                <Button size="sm" on:click={receivePackage}>Create Package</Button>
              {/if}
              <Button size="sm" variant="ghost" class="text-red-600" on:click={reportException}>
                Report Exception
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
