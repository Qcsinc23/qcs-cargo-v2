<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { WarehouseBay, WarehousePackage } from '$lib/types/warehouse';

  // State
  let bays: WarehouseBay[] = [];
  let packages: WarehousePackage[] = [];
  let loading = true;
  let error: string | null = null;

  // Filters
  let selectedZone = 'all';
  let selectedServiceType = 'all';
  let selectedDestination = 'all';
  let searchTerm = '';

  // Drag and drop
  let draggedPackage: WarehousePackage | null = null;
  let dragOverBay: string | null = null;

  // UI
  let selectedPackages: string[] = [];
  let showBatchActions = false;
  let selectedTargetBay = '';

  const zones = ['all', 'receiving', 'staging', 'outbound'];
  const serviceTypes = ['all', 'express', 'standard', 'economy', 'freight'];
  const destinations = ['all', 'JM', 'US', 'CA', 'UK'];

  onMount(async () => {
    await loadData();
    setupDragAndDrop();
  });

  async function loadData() {
    loading = true;
    error = null;

    try {
      // Load bays
      const baysResponse = await fetch('/api/warehouse/bays');
      if (baysResponse.ok) {
        const baysResult = await baysResponse.json();
        bays = baysResult.data;
      }

      // Load packages
      const packagesResponse = await fetch('/api/warehouse/packages');
      if (packagesResponse.ok) {
        const packagesResult = await packagesResponse.json();
        packages = packagesResult.data.items;
      }
    } catch (err) {
      console.error('Failed to load staging data:', err);
      error = 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  function setupDragAndDrop() {
    // Drag and drop will be handled with HTML5 drag events
  }

  function handleDragStart(event: DragEvent, pkg: WarehousePackage) {
    draggedPackage = pkg;
    event.dataTransfer?.setData('text/plain', pkg.id);
  }

  function handleDragOver(event: DragEvent, bayCode: string) {
    event.preventDefault();
    dragOverBay = bayCode;
  }

  function handleDragLeave() {
    dragOverBay = null;
  }

  async function handleDrop(event: DragEvent, targetBay: WarehouseBay) {
    event.preventDefault();
    dragOverBay = null;

    if (!draggedPackage) return;

    try {
      const response = await fetch('/api/warehouse/bays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageIds: [draggedPackage.id],
          targetBayId: targetBay.id
        })
      });

      if (response.ok) {
        // Update local state
        draggedPackage.location = {
          bay: targetBay.code,
          zone: targetBay.zone,
          shelf: ''
        };
        draggedPackage.status = 'staged';

        // Update bay counts
        const oldBay = bays.find(b => b.code === draggedPackage.location?.bay);
        if (oldBay) oldBay.currentCount--;
        targetBay.currentCount++;

        // Show success message
        console.log(`Package moved to ${targetBay.code}`);
      } else {
        error = 'Failed to move package';
      }
    } catch (err) {
      console.error('Move error:', err);
      error = 'Failed to move package';
    }

    draggedPackage = null;
  }

  function getFilteredPackages() {
    return packages.filter(pkg => {
      let matches = true;

      if (searchTerm && !pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
        matches = false;
      }

      if (selectedZone !== 'all' && pkg.location?.zone !== selectedZone) {
        matches = false;
      }

      if (selectedServiceType !== 'all' && pkg.serviceType !== selectedServiceType) {
        matches = false;
      }

      if (selectedDestination !== 'all' && pkg.destination !== selectedDestination) {
        matches = false;
      }

      return matches;
    });
  }

  function getFilteredBays() {
    return bays.filter(bay => {
      if (selectedZone === 'all') return bay.type === 'staging';
      return bay.zone === selectedZone && bay.type === 'staging';
    });
  }

  function getPackagesForBay(bayCode: string) {
    return getFilteredPackages().filter(pkg => pkg.location?.bay === bayCode);
  }

  function togglePackageSelection(packageId: string) {
    const index = selectedPackages.indexOf(packageId);
    if (index === -1) {
      selectedPackages.push(packageId);
    } else {
      selectedPackages.splice(index, 1);
    }
  }

  function selectAllVisible() {
    const visible = getFilteredPackages();
    selectedPackages = visible.map(pkg => pkg.id);
  }

  function clearSelection() {
    selectedPackages = [];
  }

  async function batchMove() {
    if (!selectedPackages.length || !selectedTargetBay) return;

    try {
      const response = await fetch('/api/warehouse/bays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageIds: selectedPackages,
          targetBayId: selectedTargetBay
        })
      });

      if (response.ok) {
        await loadData();
        clearSelection();
        showBatchActions = false;
        selectedTargetBay = '';
      } else {
        error = 'Failed to move packages';
      }
    } catch (err) {
      console.error('Batch move error:', err);
      error = 'Failed to move packages';
    }
  }

  function getPackageColor(pkg: WarehousePackage) {
    switch (pkg.status) {
      case 'received': return 'bg-blue-100 border-blue-300';
      case 'verified': return 'bg-green-100 border-green-300';
      case 'staged': return 'bg-yellow-100 border-yellow-300';
      case 'exception': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  }

  function getServiceTypeIcon(serviceType: string) {
    switch (serviceType) {
      case 'express': return '⚡';
      case 'standard': return '📦';
      case 'economy': return '💰';
      case 'freight': return '🚛';
      default: return '📋';
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center space-x-4">
          <button
            on:click={() => goto('/warehouse')}
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Staging Area</h1>
            <p class="mt-1 text-sm text-gray-500">Organize and stage packages for shipping</p>
          </div>
        </div>

        {#if selectedPackages.length > 0}
          <button
            on:click={() => showBatchActions = true}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Move {selectedPackages.length} Package{selectedPackages.length !== 1 ? 's' : ''}
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Search -->
        <div>
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search tracking number..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Zone Filter -->
        <div>
          <select
            bind:value={selectedZone}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each zones as zone}
              <option value={zone}>{zone === 'all' ? 'All Zones' : zone}</option>
            {/each}
          </select>
        </div>

        <!-- Service Type Filter -->
        <div>
          <select
            bind:value={selectedServiceType}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each serviceTypes as type}
              <option value={type}>{type === 'all' ? 'All Services' : type}</option>
            {/each}
          </select>
        </div>

        <!-- Destination Filter -->
        <div>
          <select
            bind:value={selectedDestination}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each destinations as dest}
              <option value={dest}>{dest === 'all' ? 'All Destinations' : dest}</option>
            {/each}
          </select>
        </div>

        <!-- Selection Controls -->
        <div class="flex space-x-2">
          <button
            on:click={selectAllVisible}
            class="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Select All
          </button>
          <button
            on:click={clearSelection}
            class="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    {:else}
      <!-- Unstaged Packages -->
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Unstaged Packages</h2>
        <div class="bg-white rounded-lg shadow p-4 min-h-[200px]">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {#each getFilteredPackages().filter(pkg => !pkg.location?.bay) as pkg}
              <div
                draggable="true"
                on:dragstart={(e) => handleDragStart(e, pkg)}
                class="p-3 border-2 rounded-lg cursor-move hover:shadow-md transition-all {
                  getPackageColor(pkg)
                } {selectedPackages.includes(pkg.id) ? 'ring-2 ring-blue-600' : ''}"
                on:click={() => togglePackageSelection(pkg.id)}
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-lg">{getServiceTypeIcon(pkg.serviceType)}</span>
                  {#if selectedPackages.includes(pkg.id)}
                    <div class="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  {/if}
                </div>
                <p class="text-xs font-mono text-gray-700 truncate">{pkg.trackingNumber}</p>
                <p class="text-xs text-gray-500">{pkg.destination}</p>
                <p class="text-xs text-gray-400 mt-1">{pkg.weight.actual}kg</p>
              </div>
            {/each}
          </div>

          {#if getFilteredPackages().filter(pkg => !pkg.location?.bay).length === 0}
            <div class="text-center py-12 text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="mt-2">All packages are staged</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Staging Bays -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Staging Bays</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {#each getFilteredBays() as bay}
            <div
              class="bg-white rounded-lg shadow overflow-hidden {
                dragOverBay === bay.code ? 'ring-2 ring-blue-500' : ''
              }"
              on:dragover={(e) => handleDragOver(e, bay.code)}
              on:dragleave={handleDragLeave}
              on:drop={(e) => handleDrop(e, bay)}
            >
              <div class="px-4 py-3 bg-gray-50 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="font-medium text-gray-900">{bay.code}</h3>
                  <span class="text-sm text-gray-500">
                    {bay.currentCount}/{bay.capacity}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">Zone: {bay.zone}</p>
                <div class="mt-2">
                  <div class="bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      style="width: {(bay.currentCount / bay.capacity) * 100}%"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="p-3 min-h-[200px]">
                <div class="grid grid-cols-2 gap-2">
                  {#each getPackagesForBay(bay.code) as pkg}
                    <div
                      draggable="true"
                      on:dragstart={(e) => handleDragStart(e, pkg)}
                      class="p-2 border rounded cursor-move text-xs {
                        getPackageColor(pkg)
                      } hover:shadow-md transition-all"
                      on:click={() => togglePackageSelection(pkg.id)}
                    >
                      <p class="font-mono truncate">{pkg.trackingNumber}</p>
                      <p class="text-gray-500">{pkg.destination}</p>
                      <p class="text-gray-400">{pkg.weight.actual}kg</p>
                    </div>
                  {/each}
                </div>

                {#if getPackagesForBay(bay.code).length === 0}
                  <div class="h-full flex items-center justify-center text-gray-400">
                    <div class="text-center">
                      <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="text-xs mt-1">Drop packages here</p>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}

          {#if getFilteredBays().length === 0}
            <div class="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="mt-2">No staging bays available</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Batch Actions Modal -->
  {#if showBatchActions}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Move {selectedPackages.length} Package{selectedPackages.length !== 1 ? 's' : ''}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Target Bay</label>
            <select
              bind:value={selectedTargetBay}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a bay...</option>
              {#each getFilteredBays() as bay}
                <option value={bay.id}>{bay.code} ({bay.currentCount}/{bay.capacity})</option>
              {/each}
            </select>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              on:click={() => showBatchActions = false}
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              on:click={batchMove}
              disabled={!selectedTargetBay}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Move Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>