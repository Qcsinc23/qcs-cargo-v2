<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    Plus,
    Package,
    CalendarDays,
    Search,
    Users,
    MessageSquare,
    Download,
    Settings,
    BarChart3,
    Truck
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  const quickActions = [
    {
      label: 'Create Booking',
      icon: CalendarDays,
      href: '/admin/bookings/new',
      description: 'Schedule a new customer drop-off'
    },
    {
      label: 'Add Shipment',
      icon: Package,
      href: '/admin/shipments/new',
      description: 'Create a new shipment'
    },
    {
      label: 'Customer Lookup',
      icon: Users,
      href: '/admin/search',
      description: 'Find customer information'
    },
    {
      label: 'Print Labels',
      icon: Download,
      action: 'printLabels',
      description: 'Generate shipping labels'
    },
    {
      label: 'Send Notification',
      icon: MessageSquare,
      action: 'sendNotification',
      description: 'Notify customers'
    },
    {
      label: 'View Reports',
      icon: BarChart3,
      href: '/admin/reports',
      description: 'Analytics and insights'
    }
  ];

  function handleAction(action: string) {
    dispatch(action);
  }

  function handlePrintLabels() {
    handleAction('printLabels');
  }

  function handleSendNotification() {
    handleAction('sendNotification');
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  {#each quickActions as action}
    {#if action.href}
      <a
        href={action.href}
        class="group p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            <svelte:component this={action.icon} class="h-5 w-5 text-slate-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900">{action.label}</p>
            <p class="text-xs text-slate-500 mt-1">{action.description}</p>
          </div>
        </div>
      </a>
    {:else}
      <button
        on:click={action.action === 'printLabels' ? handlePrintLabels : handleSendNotification}
        class="group p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all text-left w-full"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            <svelte:component this={action.icon} class="h-5 w-5 text-slate-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900">{action.label}</p>
            <p class="text-xs text-slate-500 mt-1">{action.description}</p>
          </div>
        </div>
      </button>
    {/if}
  {/each}
</div>