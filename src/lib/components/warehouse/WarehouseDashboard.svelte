<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { WarehouseStats } from '$lib/types/warehouse';

  let stats: WarehouseStats | null = null;
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/warehouse/stats');
      if (response.ok) {
        const result = await response.json();
        stats = result.data;
      }
    } catch (error) {
      console.error('Failed to load warehouse stats:', error);
    } finally {
      loading = false;
    }
  });

  const statCards = [
    {
      title: 'Received Today',
      value: stats?.today.received || 0,
      icon: '📦',
      color: 'blue',
      change: stats?.week.received ? ((stats.today.received / stats.week.received) * 100).toFixed(0) : 0
    },
    {
      title: 'Pending Verification',
      value: stats?.pending.toVerify || 0,
      icon: '✅',
      color: 'yellow',
      change: null
    },
    {
      title: 'Ready to Ship',
      value: stats?.pending.toShip || 0,
      icon: '🚚',
      color: 'green',
      change: null
    },
    {
      title: 'Exceptions',
      value: stats?.pending.exceptions || 0,
      icon: '⚠️',
      color: 'red',
      change: null
    }
  ];

  const quickActions = [
    {
      title: 'Receive Package',
      description: 'Scan and receive incoming packages',
      icon: '📥',
      link: '/warehouse/receiving'
    },
    {
      title: 'Manage Staging',
      description: 'Organize packages for shipping',
      icon: '📋',
      link: '/warehouse/staging'
    },
    {
      title: 'Create Manifest',
      description: 'Generate shipping documents',
      icon: '📄',
      link: '/warehouse/manifests'
    },
    {
      title: 'View All Packages',
      description: 'Browse and search packages',
      icon: '🔍',
      link: '/warehouse/packages'
    }
  ];
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Warehouse Operations</h1>
          <p class="mt-1 text-sm text-gray-500">Manage packages and shipping operations</p>
        </div>
        <div class="flex space-x-3">
          <button
            on:click={() => goto('/warehouse/receiving')}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span class="text-lg">📥</span>
            <span>Receive Package</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each statCards as card}
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style="background-color: {card.color === 'blue' ? '#dbeafe' : card.color === 'yellow' ? '#fef3c7' : card.color === 'green' ? '#d1fae5' : '#fee2e2'}">
                {card.icon}
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">{card.title}</p>
              <p class="text-2xl font-semibold text-gray-900">{loading ? '...' : card.value}</p>
              {#if card.change !== null}
                <p class="text-xs text-gray-500 mt-1">
                  {card.change}% of weekly average
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each quickActions as action}
          <a
            href={action.link}
            class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div class="flex items-center space-x-4">
              <div class="text-3xl group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div>
                <h3 class="text-base font-medium text-gray-900 group-hover:text-blue-600">
                  {action.title}
                </h3>
                <p class="text-sm text-gray-500 mt-1">{action.description}</p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <!-- Weekly Overview -->
    <div class="mt-8 bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Weekly Overview</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="text-center">
            <p class="text-sm text-gray-600">Received</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {loading ? '...' : stats?.week.received || 0}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Verified</p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {loading ? '...' : stats?.week.verified || 0}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Staged</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">
              {loading ? '...' : stats?.week.staged || 0}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Shipped</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">
              {loading ? '...' : stats?.week.shipped || 0}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Exceptions</p>
            <p class="text-2xl font-bold text-red-600 mt-1">
              {loading ? '...' : stats?.week.exceptions || 0}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trends -->
    <div class="mt-8 bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Monthly Performance</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-4">Processing Efficiency</h3>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Receive to Verify</span>
                  <span class="font-medium">
                    {loading ? '...' : ((stats?.month.verified || 0) / Math.max(stats?.month.received || 1, 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <div class="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full"
                    style="width: {loading ? 0 : ((stats?.month.verified || 0) / Math.max(stats?.month.received || 1, 1) * 100)}%"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Stage to Ship</span>
                  <span class="font-medium">
                    {loading ? '...' : ((stats?.month.shipped || 0) / Math.max(stats?.month.staged || 1, 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <div class="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    style="width: {loading ? 0 : ((stats?.month.shipped || 0) / Math.max(stats?.month.staged || 1, 1) * 100)}%"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-4">Volume Distribution</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.month.received || 0}
                </p>
                <p class="text-sm text-gray-600 mt-1">Total Received</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.month.shipped || 0}
                </p>
                <p class="text-sm text-gray-600 mt-1">Total Shipped</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>