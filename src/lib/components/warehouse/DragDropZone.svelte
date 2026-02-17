<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let zone: string;
  export let bay: string;
  export let capacity: number = 50;
  export let currentCount: number = 0;
  export let packages: any[] = [];
  export let dragOver: boolean = false;

  const dispatch = createEventDispatcher();

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    // Only leave if we're actually leaving the element
    const currentTarget = event.currentTarget as HTMLElement | null;
    if (!currentTarget || !currentTarget.contains(event.relatedTarget as Node)) {
      dragOver = false;
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;

    const packageData = event.dataTransfer?.getData('application/json');
    if (packageData) {
      const pkg = JSON.parse(packageData);
      dispatch('drop', {
        package: pkg,
        zone,
        bay
      });
    }
  }

  function handleDragEnd() {
    dragOver = false;
  }

  $: utilization = (currentCount / capacity) * 100;
  $: isNearCapacity = utilization > 80;
  $: isFull = utilization >= 100;
</script>

<div
  class="bg-white rounded-lg shadow overflow-hidden transition-all {
    dragOver ? 'ring-2 ring-blue-500 shadow-lg' : ''
  } {isFull ? 'border-2 border-red-300' : ''}"
  role="region"
  aria-label={`Drop zone for bay ${bay}`}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:dragend={handleDragEnd}
>
  <!-- Header -->
  <div class="px-4 py-3 bg-gray-50 border-b">
    <div class="flex justify-between items-center">
      <h3 class="font-medium text-gray-900">{bay}</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">
          {currentCount}/{capacity}
        </span>
        {#if isFull}
          <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Full</span>
        {:else if isNearCapacity}
          <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Nearly Full</span>
        {/if}
      </div>
    </div>
    <p class="text-xs text-gray-500 mt-1">Zone: {zone}</p>

    <!-- Capacity Bar -->
    <div class="mt-2">
      <div class="bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all {
            isFull ? 'bg-red-600'
            : isNearCapacity ? 'bg-yellow-600'
            : utilization > 50 ? 'bg-blue-600'
            : 'bg-green-600'
          }"
          style="width: {Math.min(utilization, 100)}%"
        ></div>
      </div>
    </div>
  </div>

  <!-- Package Area -->
  <div
    class="p-3 min-h-[200px] {
      dragOver ? 'bg-blue-50' : ''
    } transition-colors"
  >
    {#if packages.length > 0}
      <div class="grid grid-cols-2 gap-2">
        {#each packages as pkg (pkg.id)}
          <div
            draggable="true"
            role="listitem"
            aria-label={`Package ${pkg.trackingNumber}`}
            on:dragstart={(e) => {
              e.dataTransfer?.setData('application/json', JSON.stringify(pkg));
            }}
            class="p-2 border rounded cursor-move text-xs hover:shadow-md transition-all"
          >
            <p class="font-mono truncate">{pkg.trackingNumber}</p>
            <p class="text-gray-500">{pkg.destination}</p>
            <p class="text-gray-400">{pkg.weight?.actual || 0}kg</p>
          </div>
        {/each}
      </div>
    {:else}
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
