<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { WarehousePackage, WarehousePackageStatus } from '$lib/types/warehouse';

  // State
  let packages: WarehousePackage[] = [];
  let loading = true;
  let error: string | null = null;
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;

  // Filters
  let status: WarehousePackageStatus | 'all' = 'all';
  let zone = 'all';
  let serviceType = 'all';
  let destination = 'all';
  let searchTerm = '';
  let dateRange = 'all';

  // View
  let selectedPackage: WarehousePackage | null = null;
  let showDetailsModal = false;

  const statuses: { value: WarehousePackageStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All Statuses', color: '' },
    { value: 'incoming', label: 'Incoming', color: 'gray' },
    { value: 'received', label: 'Received', color: 'blue' },
    { value: 'verified', label: 'Verified', color: 'green' },
    { value: 'staged', label: 'Staged', color: 'yellow' },
    { value: 'picked', label: 'Picked', color: 'purple' },
    { value: 'manifested', label: 'Manifested', color: 'indigo' },
    { value: 'shipped', label: 'Shipped', color: 'emerald' },
    { value: 'exception', label: 'Exception', color: 'red' }
  ];

  const serviceTypes = ['all', 'express', 'standard', 'economy', 'freight'];
  const destinations = ['all', 'JM', 'US', 'CA', 'UK'];
  const zones = ['all', 'receiving', 'staging', 'outbound', 'exception', 'hold'];

  onMount(async () => {
    await loadPackages();
  });

  async function loadPackages(page = 1) {
    loading = true;
    error = null;

    const params = new URLSearchParams({
      page: page.toString(),
      perPage: '20'
    });

    if (status !== 'all') params.set('status', status);
    if (zone !== 'all') params.set('zone', zone);
    if (serviceType !== 'all') params.set('serviceType', serviceType);
    if (destination !== 'all') params.set('destination', destination);
    if (searchTerm) params.set('search', searchTerm);

    try {
      const response = await fetch(`/api/warehouse/packages?${params}`);
      const result = await response.json();

      if (response.ok) {
        packages = result.data.items;
        currentPage = result.data.page;
        totalPages = result.data.totalPages;
        totalItems = result.data.totalItems;
      } else {
        error = result.message || 'Failed to load packages';
      }
    } catch (err) {
      console.error('Load error:', err);
      error = 'Failed to load packages';
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    loadPackages(1);
  }

  function clearFilters() {
    status = 'all';
    zone = 'all';
    serviceType = 'all';
    destination = 'all';
    searchTerm = '';
    dateRange = 'all';
    loadPackages(1);
  }

  function viewPackageDetails(pkg: WarehousePackage) {
    selectedPackage = pkg;
    showDetailsModal = true;
  }

  function closeDetailsModal() {
    showDetailsModal = false;
    selectedPackage = null;
  }

  function getStatusColor(status: WarehousePackageStatus) {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  }

  function getConditionColor(condition: string) {
    switch (condition) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'damaged': return 'red';
      case 'wet': return 'blue';
      case 'open': return 'orange';
      case 'repacked': return 'purple';
      default: return 'gray';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function updatePackageStatus(pkg: WarehousePackage, newStatus: WarehousePackageStatus) {
    // In a real implementation, call API to update status
    console.log(`Updating package ${pkg.trackingNumber} to ${newStatus}`);
    loadPackages(currentPage);
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
            <h1 class="text-2xl font-bold text-gray-900">All Packages</h1>
            <p class="mt-1 text-sm text-gray-500">Browse and search warehouse packages</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <span>{totalItems} total packages</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <input
            type="text"
            bind:value={searchTerm}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search tracking number..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <select
            bind:value={status}
            on:change={() => loadPackages(1)}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each statuses as s}
              <option value={s.value}>{s.label}</option>
            {/each}
          </select>
        </div>

        <!-- Zone Filter -->
        <div>
          <select
            bind:value={zone}
            on:change={() => loadPackages(1)}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each zones as z}
              <option value={z}>{z === 'all' ? 'All Zones' : z}</option>
            {/each}
          </select>
        </div>

        <!-- Service Type Filter -->
        <div>
          <select
            bind:value={serviceType}
            on:change={() => loadPackages(1)}
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
            bind:value={destination}
            on:change={() => loadPackages(1)}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each destinations as dest}
              <option value={dest}>{dest === 'all' ? 'All Destinations' : dest}</option>
            {/each}
          </select>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2">
          <button
            on:click={handleSearch}
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            on:click={clearFilters}
            class="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Package List -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <div class="bg-white rounded-lg shadow">
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if error}
        <div class="p-6 text-center text-red-800">
          {error}
        </div>
      {:else if packages.length === 0}
        <div class="p-12 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="mt-2">No packages found</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each packages as pkg}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{pkg.trackingNumber}</p>
                      <p class="text-xs text-gray-500">Received {formatDate(pkg.receivedAt)}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-{getStatusColor(pkg.status)}-100 text-{getStatusColor(pkg.status)}-800">
                      {pkg.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {#if pkg.location?.bay}
                      {pkg.location.zone}-{pkg.location.bay}{pkg.location.shelf ? `-${pkg.location.shelf}` : ''}
                    {:else}
                      <span class="text-gray-400">Not assigned</span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {pkg.serviceType}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {pkg.destination}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.weight?.actual || 0} {pkg.weight?.unit || 'kg'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-{getConditionColor(pkg.condition)}-100 text-{getConditionColor(pkg.condition)}-800">
                      {pkg.condition}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      on:click={() => viewPackageDetails(pkg)}
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>

                    {#if pkg.status === 'received'}
                      <button
                        on:click={() => updatePackageStatus(pkg, 'verified')}
                        class="text-green-600 hover:text-green-900"
                      >
                        Verify
                      </button>
                    {:else if pkg.status === 'verified'}
                      <button
                        on:click={() => updatePackageStatus(pkg, 'staged')}
                        class="text-yellow-600 hover:text-yellow-900"
                      >
                        Stage
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalItems)} of {totalItems} results
              </div>
              <div class="flex space-x-2">
                <button
                  on:click={() => loadPackages(currentPage - 1)}
                  disabled={currentPage === 1}
                  class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1) as page}
                  {#if page === currentPage || Math.abs(page - currentPage) <= 2}
                    <button
                      on:click={() => loadPackages(page)}
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 {page === currentPage ? 'bg-blue-600 text-white border-blue-600' : ''}"
                    >
                      {page}
                    </button>
                  {/if}
                {/each}
                <button
                  on:click={() => loadPackages(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Package Details Modal -->
  {#if showDetailsModal && selectedPackage}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Package Details</h3>
        </div>

        <div class="p-6 space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Tracking Number</p>
              <p class="font-medium">{selectedPackage.trackingNumber}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-{getStatusColor(selectedPackage.status)}-100 text-{getStatusColor(selectedPackage.status)}-800">
                {selectedPackage.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">Service Type</p>
              <p class="font-medium capitalize">{selectedPackage.serviceType}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Destination</p>
              <p class="font-medium">{selectedPackage.destination}</p>
            </div>
          </div>

          <!-- Weight & Dimensions -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Measurements</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Weight</p>
                <p class="font-medium">{selectedPackage.weight?.actual || 0} {selectedPackage.weight?.unit || 'kg'}</p>
                {#if selectedPackage.weight?.verified}
                  <p class="text-xs text-green-600">✓ Verified</p>
                {/if}
              </div>
              {#if selectedPackage.dimensions}
                <div>
                  <p class="text-sm text-gray-500">Dimensions</p>
                  <p class="font-medium">
                    {selectedPackage.dimensions.length} × {selectedPackage.dimensions.width} × {selectedPackage.dimensions.height} {selectedPackage.dimensions.unit || 'cm'}
                  </p>
                  {#if selectedPackage.dimensions.verified}
                    <p class="text-xs text-green-600">✓ Verified</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <!-- Location -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Location</h4>
            {#if selectedPackage.location?.bay}
              <p class="text-sm">
                {selectedPackage.location.zone} - {selectedPackage.location.bay}{selectedPackage.location.shelf ? ` - Shelf ${selectedPackage.location.shelf}` : ''}
              </p>
            {:else}
              <p class="text-sm text-gray-500">No location assigned</p>
            {/if}
          </div>

          <!-- Condition -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Package Condition</h4>
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-{getConditionColor(selectedPackage.condition)}-100 text-{getConditionColor(selectedPackage.condition)}-800">
              {selectedPackage.condition}
            </span>
          </div>

          <!-- Photos -->
          {#if selectedPackage.photos && selectedPackage.photos.length > 0}
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Photos</h4>
              <div class="grid grid-cols-3 gap-2">
                {#each selectedPackage.photos as photo}
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Package photo'}
                    class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                  />
                {/each}
              </div>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              on:click={closeDetailsModal}
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
