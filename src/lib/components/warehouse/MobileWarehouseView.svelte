<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { WarehouseStats } from '$lib/types/warehouse';

  let stats: WarehouseStats | null = null;
  let loading = true;
  let isOnline = navigator.onLine;
  let trackingInput = '';

  onMount(async () => {
    await loadStats();

    // Listen for online/offline events
    window.addEventListener('online', () => isOnline = true);
    window.addEventListener('offline', () => isOnline = false);
  });

  async function loadStats() {
    try {
      if (isOnline) {
        const response = await fetch('/api/warehouse/stats');
        if (response.ok) {
          const result = await response.json();
          stats = result.data;
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      loading = false;
    }
  }

  const quickActions = [
    {
      title: 'Scan Package',
      icon: '📷',
      color: 'blue',
      href: '/warehouse/receiving'
    },
    {
      title: 'View Queue',
      icon: '📋',
      color: 'yellow',
      href: '/warehouse/packages?status=received'
    },
    {
      title: 'Stage Packages',
      icon: '📦',
      color: 'green',
      href: '/warehouse/staging'
    },
    {
      title: 'Ship Out',
      icon: '🚚',
      color: 'purple',
      href: '/warehouse/manifests'
    }
  ];

  function navigateTo(href: string) {
    goto(href);
  }

  function syncData() {
    if (isOnline) {
      loadStats();
    }
  }
</script>

<div class="min-h-screen bg-gray-50 pb-20">
  <!-- Mobile Header -->
  <div class="bg-blue-600 text-white p-4 shadow-lg">
    <div class="flex justify-between items-center mb-4">
      <button
        on:click={() => goto('/warehouse')}
        class="text-white/80 hover:text-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 class="text-xl font-bold">Warehouse Mobile</h1>
      <div class="flex items-center space-x-2">
        <button
          on:click={syncData}
          class="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          title="Sync data"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <div class="w-2 h-2 rounded-full {isOnline ? 'bg-green-400' : 'bg-red-400'}"></div>
      </div>
    </div>

    <!-- Status Indicator -->
    <div class="bg-white/10 rounded-lg p-3">
      <p class="text-sm text-white/90">
        {isOnline ? '🟢 Connected' : '🔴 Offline Mode'}
      </p>
    </div>
  </div>

  <!-- Quick Stats -->
  {#if loading}
    <div class="p-4 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if stats}
    <div class="p-4 grid grid-cols-2 gap-3">
      <div class="bg-white rounded-lg p-3 shadow">
        <p class="text-2xl font-bold text-gray-900">{stats.today.received}</p>
        <p class="text-xs text-gray-500">Received Today</p>
      </div>
      <div class="bg-white rounded-lg p-3 shadow">
        <p class="text-2xl font-bold text-yellow-600">{stats.pending.toVerify}</p>
        <p class="text-xs text-gray-500">To Verify</p>
      </div>
      <div class="bg-white rounded-lg p-3 shadow">
        <p class="text-2xl font-bold text-blue-600">{stats.pending.toStage}</p>
        <p class="text-xs text-gray-500">To Stage</p>
      </div>
      <div class="bg-white rounded-lg p-3 shadow">
        <p class="text-2xl font-bold text-green-600">{stats.pending.toShip}</p>
        <p class="text-xs text-gray-500">To Ship</p>
      </div>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="px-4">
    <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
    <div class="grid grid-cols-2 gap-3">
      {#each quickActions as action}
        <button
          on:click={() => navigateTo(action.href)}
          class="bg-white rounded-lg p-4 shadow hover:shadow-md active:shadow-inner transition-all"
        >
          <div class="text-3xl mb-2">{action.icon}</div>
          <p class="text-sm font-medium text-gray-900">{action.title}</p>
        </button>
      {/each}
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="px-4 mt-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Scan</h2>
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex space-x-3">
        <input
          bind:value={trackingInput}
          type="text"
          placeholder="Enter tracking number..."
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          on:keydown={(e) => {
            if (e.key === 'Enter' && trackingInput) {
              goto(`/warehouse/receiving?track=${encodeURIComponent(trackingInput)}`);
            }
          }}
        />
        <button
          on:click={() => {
            if (trackingInput) {
              goto(`/warehouse/receiving?track=${encodeURIComponent(trackingInput)}`);
            }
          }}
          class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Navigation -->
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div class="grid grid-cols-4 gap-1">
      <button
        on:click={() => goto('/warehouse')}
        class="py-3 px-2 text-center hover:bg-gray-50 transition-colors"
      >
        <svg class="w-6 h-6 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p class="text-xs mt-1 text-gray-600">Dashboard</p>
      </button>
      <button
        on:click={() => goto('/warehouse/receiving')}
        class="py-3 px-2 text-center hover:bg-gray-50 transition-colors"
      >
        <svg class="w-6 h-6 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <p class="text-xs mt-1 text-gray-600">Receive</p>
      </button>
      <button
        on:click={() => goto('/warehouse/staging')}
        class="py-3 px-2 text-center hover:bg-gray-50 transition-colors"
      >
        <svg class="w-6 h-6 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-xs mt-1 text-gray-600">Stage</p>
      </button>
      <button
        on:click={() => goto('/warehouse/packages')}
        class="py-3 px-2 text-center hover:bg-gray-50 transition-colors"
      >
        <svg class="w-6 h-6 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p class="text-xs mt-1 text-gray-600">Packages</p>
      </button>
    </div>
  </div>
</div>

<style>
  /* Mobile optimizations */
  @media (max-width: 768px) {
    /* Make buttons larger for touch */
    button {
      min-height: 44px;
    }

    /* Prevent zoom on input focus */
    input[type="text"] {
      font-size: 16px;
    }
  }

  /* Tablet landscape adjustments */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
    .min-h-screen {
      min-height: 100vh;
    }
  }
</style>