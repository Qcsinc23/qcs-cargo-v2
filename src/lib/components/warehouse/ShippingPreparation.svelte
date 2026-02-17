<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ShippingManifest, WarehousePackage } from '$lib/types/warehouse';

  // State
  let manifests: ShippingManifest[] = [];
  let stagedPackages: WarehousePackage[] = [];
  let loading = true;
  let error: string | null = null;

  // Create manifest form
  let showCreateModal = false;
  let selectedCarrier = '';
  let selectedServiceType = '';
  let selectedDestination = '';
  let selectedPackages: string[] = [];
  let manifestName = '';

  // Preview
  let selectedManifest: ShippingManifest | null = null;
  let showPreviewModal = false;

  // Print options
  let printOptions: Record<string, boolean> = {
    packingSlips: true,
    labels: true,
    customsForms: false,
    certificates: false
  };

  const carriers = [
    { value: 'dhl', label: 'DHL Express' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'tnt', label: 'TNT' },
    { value: 'local', label: 'Local Courier' }
  ];

  const serviceTypes = ['express', 'standard', 'economy', 'freight'];
  const destinations = ['JM', 'US', 'CA', 'UK'];

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    loading = true;
    error = null;

    try {
      // Load manifests
      const manifestsResponse = await fetch('/api/warehouse/manifests');
      if (manifestsResponse.ok) {
        const manifestsResult = await manifestsResponse.json();
        manifests = manifestsResult.data.items;
      }

      // Load staged packages
      const packagesResponse = await fetch('/api/warehouse/packages?status=staged');
      if (packagesResponse.ok) {
        const packagesResult = await packagesResponse.json();
        stagedPackages = packagesResult.data.items;
      }
    } catch (err) {
      console.error('Failed to load shipping data:', err);
      error = 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  function openCreateModal() {
    showCreateModal = true;
    selectedCarrier = '';
    selectedServiceType = '';
    selectedDestination = '';
    selectedPackages = [];
    manifestName = '';
  }

  function closeCreateModal() {
    showCreateModal = false;
  }

  async function createManifest() {
    if (!selectedCarrier || selectedPackages.length === 0) {
      error = 'Please select a carrier and at least one package';
      return;
    }

    try {
      const response = await fetch('/api/warehouse/manifests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          carrier: selectedCarrier,
          serviceType: selectedServiceType,
          destination: selectedDestination,
          packageIds: selectedPackages
        })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData();
        closeCreateModal();
        console.log('Manifest created successfully');
      } else {
        error = result.message || 'Failed to create manifest';
      }
    } catch (err) {
      console.error('Create manifest error:', err);
      error = 'Failed to create manifest';
    }
  }

  function previewManifest(manifest: ShippingManifest) {
    selectedManifest = manifest;
    showPreviewModal = true;
  }

  function closePreviewModal() {
    showPreviewModal = false;
    selectedManifest = null;
  }

  async function printManifest(manifestId: string) {
    try {
      // Generate print job
      const printData = {
        manifestId,
        options: printOptions
      };

      // In a real implementation, send to print service
      console.log('Printing manifest:', printData);

      // Open print window
      const printWindow = window.open(`/api/warehouse/manifests/${manifestId}/print`, '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site to print documents');
      }
    } catch (err) {
      console.error('Print error:', err);
      error = 'Failed to print manifest';
    }
  }

  async function markAsShipped(manifestId: string) {
    if (!confirm('Mark this manifest as shipped?')) return;

    try {
      const response = await fetch(`/api/warehouse/manifests/${manifestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'shipped'
        })
      });

      if (response.ok) {
        await loadData();
        console.log('Manifest marked as shipped');
      } else {
        error = 'Failed to update manifest status';
      }
    } catch (err) {
      console.error('Update error:', err);
      error = 'Failed to update manifest status';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'printed': return 'bg-yellow-100 text-yellow-800';
      case 'picked': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getCarrierIcon(carrier: string) {
    switch (carrier) {
      case 'dhl': return '🚚';
      case 'fedex': return '📦';
      case 'ups': return '🚛';
      case 'tnt': return '✈️';
      case 'local': return '🚐';
      default: return '📋';
    }
  }

  function getFilteredPackages() {
    return stagedPackages.filter(pkg => {
      if (selectedServiceType && pkg.serviceType !== selectedServiceType) return false;
      if (selectedDestination && pkg.destination !== selectedDestination) return false;
      return true;
    });
  }

  function togglePackageSelection(packageId: string) {
    const index = selectedPackages.indexOf(packageId);
    if (index === -1) {
      selectedPackages.push(packageId);
    } else {
      selectedPackages.splice(index, 1);
    }
  }

  function selectAllPackages() {
    selectedPackages = getFilteredPackages().map(pkg => pkg.id);
  }

  function clearPackageSelection() {
    selectedPackages = [];
  }

  function getTotalWeight(packageIds: string[]) {
    return stagedPackages
      .filter(pkg => packageIds.includes(pkg.id))
      .reduce((total, pkg) => total + (pkg.weight?.actual || 0), 0)
      .toFixed(2);
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
            aria-label="Back to warehouse dashboard"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Shipping Preparation</h1>
            <p class="mt-1 text-sm text-gray-500">Generate manifests and prepare shipments</p>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            on:click={openCreateModal}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Manifest</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    {:else}
      <!-- Staged Packages Summary -->
      <div class="mb-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Staged Packages Ready for Manifest</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{stagedPackages.length}</p>
            <p class="text-sm text-gray-600 mt-1">Total Packages</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">
              {getTotalWeight(stagedPackages.map(p => p.id))} kg
            </p>
            <p class="text-sm text-gray-600 mt-1">Total Weight</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">
              {stagedPackages.filter(p => p.destination === 'JM').length}
            </p>
            <p class="text-sm text-gray-600 mt-1">Jamaica Bound</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-purple-600">
              {stagedPackages.filter(p => p.destination !== 'JM').length}
            </p>
            <p class="text-sm text-gray-600 mt-1">International</p>
          </div>
        </div>
      </div>

      <!-- Manifests List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Recent Manifests</h2>
        </div>

        {#if manifests.length === 0}
          <div class="p-12 text-center text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-2">No manifests created yet</p>
            <button
              on:click={openCreateModal}
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Manifest
            </button>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manifest
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packages
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each manifests as manifest}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p class="text-sm font-medium text-gray-900">{manifest.manifestNumber}</p>
                        <p class="text-xs text-gray-500">ID: {manifest.id}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span class="text-2xl mr-2">{getCarrierIcon(manifest.carrier)}</span>
                        <span class="text-sm text-gray-900 capitalize">{manifest.carrier}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {manifest.destination}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manifest.totalPackages}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manifest.totalWeight} kg
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(manifest.status)}">
                        {manifest.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button
                          on:click={() => previewManifest(manifest)}
                          class="text-blue-600 hover:text-blue-900"
                          title="Preview"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          on:click={() => printManifest(manifest.id)}
                          class="text-green-600 hover:text-green-900"
                          title="Print"
                          disabled={manifest.status === 'shipped'}
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        {#if manifest.status !== 'shipped'}
                          <button
                            on:click={() => markAsShipped(manifest.id)}
                            class="text-purple-600 hover:text-purple-900"
                            title="Mark as Shipped"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Create Manifest Modal -->
  {#if showCreateModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Create Shipping Manifest</h3>
        </div>

        <div class="p-6 space-y-6">
          <!-- Carrier Selection -->
          <div>
            <label for="manifest-carrier" class="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
            <select
              id="manifest-carrier"
              bind:value={selectedCarrier}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select carrier...</option>
              {#each carriers as carrier}
                <option value={carrier.value}>{carrier.label}</option>
              {/each}
            </select>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="manifest-service-type" class="block text-sm font-medium text-gray-700 mb-2">Service Type (Optional)</label>
              <select
                id="manifest-service-type"
                bind:value={selectedServiceType}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All types</option>
                {#each serviceTypes as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>
            <div>
              <label for="manifest-destination" class="block text-sm font-medium text-gray-700 mb-2">Destination (Optional)</label>
              <select
                id="manifest-destination"
                bind:value={selectedDestination}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All destinations</option>
                {#each destinations as dest}
                  <option value={dest}>{dest}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Package Selection -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <p class="block text-sm font-medium text-gray-700">Select Packages</p>
              <div class="space-x-2">
                <button
                  on:click={selectAllPackages}
                  class="text-sm text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  on:click={clearPackageSelection}
                  class="text-sm text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {#each getFilteredPackages() as pkg}
                <div
                  class="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center space-x-3"
                  on:click={() => togglePackageSelection(pkg.id)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      togglePackageSelection(pkg.id);
                    }
                  }}
                  role="button"
                  tabindex="0"
                >
                  <input
                    type="checkbox"
                    checked={selectedPackages.includes(pkg.id)}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{pkg.trackingNumber}</p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{pkg.destination}</span>
                      <span>{pkg.weight?.actual}kg</span>
                      <span class="capitalize">{pkg.serviceType}</span>
                    </div>
                  </div>
                </div>
              {/each}

              {#if getFilteredPackages().length === 0}
                <div class="p-8 text-center text-gray-500">
                  No packages available for selection
                </div>
              {/if}
            </div>

            {#if selectedPackages.length > 0}
              <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''} selected
                  ({getTotalWeight(selectedPackages)} kg)
                </p>
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              on:click={closeCreateModal}
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              on:click={createManifest}
              disabled={!selectedCarrier || selectedPackages.length === 0}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Preview Modal -->
  {#if showPreviewModal && selectedManifest}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Manifest Preview</h3>
        </div>

        <div class="p-6 space-y-6">
          <!-- Manifest Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Manifest Number</p>
              <p class="font-medium">{selectedManifest.manifestNumber}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Carrier</p>
              <p class="font-medium capitalize">{selectedManifest.carrier}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Destination</p>
              <p class="font-medium">{selectedManifest.destination}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Service Type</p>
              <p class="font-medium capitalize">{selectedManifest.serviceType}</p>
            </div>
          </div>

          <!-- Package List -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Packages ({selectedManifest.totalPackages})</h4>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  {#each selectedManifest.packages as pkg}
                    <tr>
                      <td class="px-4 py-2 text-sm font-medium">{pkg.trackingNumber}</td>
                      <td class="px-4 py-2 text-sm">{pkg.weight?.actual} kg</td>
                      <td class="px-4 py-2 text-sm capitalize">{pkg.serviceType}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Print Options -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Print Options</h4>
            <div class="space-y-2">
              {#each Object.entries(printOptions) as [key, value]}
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    bind:checked={printOptions[key]}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              on:click={closePreviewModal}
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              on:click={() => selectedManifest && printManifest(selectedManifest.id)}
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Print Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
