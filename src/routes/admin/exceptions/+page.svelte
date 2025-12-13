<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Select from '$lib/components/ui/select';
  import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Package,
    MapPin,
    Scale,
    Ban,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Bell,
    MessageSquare,
    User
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { 
    EXCEPTION_TYPES, 
    EXCEPTION_STATUS_CONFIG, 
    EXCEPTION_PRIORITY_CONFIG,
    getExceptionType,
    type ExceptionType,
    type ExceptionStatus,
    type ExceptionPriority
  } from '$lib/config/exceptions';
  import { toast } from 'svelte-sonner';

  interface Exception {
    id: string;
    package_id?: string;
    booking_id?: string;
    shipment_id?: string;
    type: ExceptionType;
    status: ExceptionStatus;
    priority: ExceptionPriority;
    description: string;
    resolution?: string;
    resolution_notes?: string;
    customer_notified: boolean;
    customer_notification_date?: string;
    assigned_to?: string;
    created_by: string;
    created: string;
    updated: string;
    package?: {
      id: string;
      tracking_number: string;
      description: string;
    };
    booking?: {
      id: string;
      customer_name: string;
      customer_email: string;
      destination: string;
    };
  }

  // State
  let exceptions: Exception[] = [];
  let totalItems = 0;
  let totalPages = 1;
  let currentPage = 1;
  const perPage = 20;
  let loading = true;

  // Filters
  let searchQuery = '';
  let statusFilter = 'all';
  let typeFilter = 'all';
  let priorityFilter = 'all';

  // Dialogs
  let createDialogOpen = false;
  let detailDialogOpen = false;
  let resolveDialogOpen = false;
  let selectedExceptionId: string | null = null;

  // Create form
  let newException = {
    type: 'other' as ExceptionType,
    priority: 'medium' as ExceptionPriority,
    description: '',
    package_id: '',
    booking_id: ''
  };

  // Resolve form
  let resolveData = {
    resolution: '',
    resolution_notes: '',
    notifyCustomer: true
  };

  $: selectedException = exceptions.find(e => e.id === selectedExceptionId);

  async function loadExceptions() {
    loading = true;
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: perPage.toString(),
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
        search: searchQuery
      });

      const response = await fetch(`/api/admin/exceptions?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          exceptions = result.data.exceptions;
          totalItems = result.data.totalItems;
          totalPages = result.data.totalPages;
        }
      }
    } catch (error) {
      console.error('Failed to load exceptions:', error);
      toast.error('Failed to load exceptions');
    } finally {
      loading = false;
    }
  }

  async function createException() {
    try {
      const response = await fetch('/api/admin/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newException)
      });

      if (response.ok) {
        toast.success('Exception created successfully');
        createDialogOpen = false;
        newException = {
          type: 'other',
          priority: 'medium',
          description: '',
          package_id: '',
          booking_id: ''
        };
        await loadExceptions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create exception');
      }
    } catch (error) {
      console.error('Failed to create exception:', error);
      toast.error('Failed to create exception');
    }
  }

  async function updateExceptionStatus(id: string, status: ExceptionStatus) {
    try {
      const response = await fetch('/api/admin/exceptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        toast.success('Status updated');
        await loadExceptions();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update exception:', error);
      toast.error('Failed to update status');
    }
  }

  async function resolveException() {
    if (!selectedExceptionId) return;

    try {
      const response = await fetch('/api/admin/exceptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedExceptionId,
          status: 'resolved',
          resolution: resolveData.resolution,
          resolution_notes: resolveData.resolution_notes,
          customer_notified: resolveData.notifyCustomer,
          customer_notification_date: resolveData.notifyCustomer ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        toast.success('Exception resolved');
        resolveDialogOpen = false;
        resolveData = { resolution: '', resolution_notes: '', notifyCustomer: true };
        await loadExceptions();
      } else {
        toast.error('Failed to resolve exception');
      }
    } catch (error) {
      console.error('Failed to resolve exception:', error);
      toast.error('Failed to resolve exception');
    }
  }

  function openDetail(id: string) {
    selectedExceptionId = id;
    detailDialogOpen = true;
  }

  function openResolve(id: string) {
    selectedExceptionId = id;
    const exception = exceptions.find(e => e.id === id);
    if (exception) {
      const typeConfig = getExceptionType(exception.type);
      resolveData.resolution = typeConfig?.resolutionOptions[0] || '';
    }
    resolveDialogOpen = true;
  }

  function getTypeIcon(type: ExceptionType) {
    const typeConfig = getExceptionType(type);
    return typeConfig?.icon || HelpCircle;
  }

  onMount(() => {
    loadExceptions();
  });

  // Reactively reload when filters change
  $: if (statusFilter || typeFilter || priorityFilter || searchQuery) {
    if (!loading) {
      currentPage = 1;
      loadExceptions();
    }
  }
</script>

<svelte:head>
  <title>Exception Management | QCS Cargo Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Exception Management</h1>
      <p class="text-sm text-gray-500 mt-1">
        Manage warehouse exceptions and customer issues
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" on:click={loadExceptions}>
        <RefreshCw class="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Button size="sm" on:click={() => createDialogOpen = true}>
        <Plus class="w-4 h-4 mr-2" />
        Report Exception
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-red-100">
          <AlertTriangle class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Open</p>
          <p class="text-xl font-semibold">{exceptions.filter(e => e.status === 'open').length}</p>
        </div>
      </div>
    </Card>
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-amber-100">
          <Clock class="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Investigating</p>
          <p class="text-xl font-semibold">{exceptions.filter(e => e.status === 'investigating').length}</p>
        </div>
      </div>
    </Card>
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-purple-100">
          <AlertTriangle class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Escalated</p>
          <p class="text-xl font-semibold">{exceptions.filter(e => e.status === 'escalated').length}</p>
        </div>
      </div>
    </Card>
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-green-100">
          <CheckCircle class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Resolved Today</p>
          <p class="text-xl font-semibold">
            {exceptions.filter(e => 
              e.status === 'resolved' && 
              new Date(e.updated).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by tracking # or description..."
          bind:value={searchQuery}
          class="pl-10"
        />
      </div>
      <div class="flex gap-2 flex-wrap">
        <Select.Root bind:selected={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : EXCEPTION_STATUS_CONFIG[statusFilter as ExceptionStatus]?.label }}>
          <Select.Trigger class="w-[140px]">
            <Select.Value placeholder="Status" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Status</Select.Item>
            {#each Object.entries(EXCEPTION_STATUS_CONFIG) as [key, config]}
              <Select.Item value={key}>{config.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <Select.Root bind:selected={{ value: typeFilter, label: typeFilter === 'all' ? 'All Types' : getExceptionType(typeFilter as ExceptionType)?.label }}>
          <Select.Trigger class="w-[160px]">
            <Select.Value placeholder="Type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Types</Select.Item>
            {#each EXCEPTION_TYPES as type}
              <Select.Item value={type.id}>{type.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <Select.Root bind:selected={{ value: priorityFilter, label: priorityFilter === 'all' ? 'All Priority' : EXCEPTION_PRIORITY_CONFIG[priorityFilter as ExceptionPriority]?.label }}>
          <Select.Trigger class="w-[140px]">
            <Select.Value placeholder="Priority" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Priority</Select.Item>
            {#each Object.entries(EXCEPTION_PRIORITY_CONFIG) as [key, config]}
              <Select.Item value={key}>{config.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </Card>

  <!-- Exceptions Table -->
  <Card>
    <div class="overflow-x-auto">
      {#if loading}
        <div class="p-12 text-center">
          <RefreshCw class="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p class="mt-2 text-gray-500">Loading exceptions...</p>
        </div>
      {:else if exceptions.length === 0}
        <div class="p-12 text-center">
          <CheckCircle class="w-12 h-12 mx-auto text-green-400" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">No exceptions found</h3>
          <p class="mt-2 text-gray-500">
            {#if searchQuery || statusFilter !== 'all' || typeFilter !== 'all'}
              Try adjusting your filters
            {:else}
              All packages are processing normally
            {/if}
          </p>
        </div>
      {:else}
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package/Booking</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Notified</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each exceptions as exception (exception.id)}
              {@const typeConfig = getExceptionType(exception.type)}
              {@const statusConfig = EXCEPTION_STATUS_CONFIG[exception.status]}
              {@const priorityConfig = EXCEPTION_PRIORITY_CONFIG[exception.priority]}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class={cn('inline-flex items-center gap-2 px-2 py-1 rounded-md', typeConfig?.bgColor, typeConfig?.borderColor, 'border')}>
                    <svelte:component this={typeConfig?.icon || HelpCircle} class={cn('w-4 h-4', typeConfig?.color)} />
                    <span class={cn('text-sm font-medium', typeConfig?.color)}>{typeConfig?.label}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="text-sm text-gray-900 line-clamp-2 max-w-xs">{exception.description}</p>
                </td>
                <td class="px-4 py-3">
                  {#if exception.package?.tracking_number}
                    <p class="text-sm font-mono text-gray-900">{exception.package.tracking_number}</p>
                  {:else if exception.booking_id}
                    <p class="text-sm text-gray-500">Booking #{exception.booking_id.slice(0, 8)}</p>
                  {:else}
                    <p class="text-sm text-gray-400">—</p>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <span class={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', priorityConfig?.bgColor, priorityConfig?.color)}>
                    {priorityConfig?.label}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', statusConfig?.bgColor, statusConfig?.color)}>
                    {statusConfig?.label}
                  </span>
                </td>
                <td class="px-4 py-3">
                  {#if exception.customer_notified}
                    <div class="flex items-center gap-1 text-green-600">
                      <CheckCircle class="w-4 h-4" />
                      <span class="text-sm">Yes</span>
                    </div>
                  {:else}
                    <div class="flex items-center gap-1 text-gray-400">
                      <XCircle class="w-4 h-4" />
                      <span class="text-sm">No</span>
                    </div>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <p class="text-sm text-gray-500">
                    {new Date(exception.created).toLocaleDateString()}
                  </p>
                  <p class="text-xs text-gray-400">
                    {new Date(exception.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>
                <td class="px-4 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      {#snippet child({ props })}
                        <button
                          {...props}
                          type="button"
                          class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
                          aria-label="Exception actions"
                        >
                          <MoreHorizontal class="h-4 w-4" />
                        </button>
                      {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onSelect={() => openDetail(exception.id)}>
                        <Eye class="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenu.Item>
                      {#if exception.status === 'open'}
                        <DropdownMenu.Item onSelect={() => updateExceptionStatus(exception.id, 'investigating')}>
                          <Clock class="mr-2 h-4 w-4" />
                          Start Investigation
                        </DropdownMenu.Item>
                      {/if}
                      {#if exception.status !== 'resolved' && exception.status !== 'closed'}
                        <DropdownMenu.Item onSelect={() => openResolve(exception.id)}>
                          <CheckCircle class="mr-2 h-4 w-4" />
                          Resolve Exception
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={() => updateExceptionStatus(exception.id, 'escalated')}>
                          <AlertTriangle class="mr-2 h-4 w-4" />
                          Escalate
                        </DropdownMenu.Item>
                      {/if}
                      {#if exception.status === 'resolved'}
                        <DropdownMenu.Item onSelect={() => updateExceptionStatus(exception.id, 'closed')}>
                          <XCircle class="mr-2 h-4 w-4" />
                          Close Exception
                        </DropdownMenu.Item>
                      {/if}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="p-4 border-t bg-gray-50 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems}
        </p>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            on:click={() => { currentPage--; loadExceptions(); }}
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <span class="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            on:click={() => { currentPage++; loadExceptions(); }}
          >
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
      </div>
    {/if}
  </Card>
</div>

<!-- Create Exception Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Report Exception</Dialog.Title>
      <Dialog.Description>
        Create a new exception record for a warehouse issue
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label for="type">Exception Type</Label>
        <Select.Root bind:selected={{ value: newException.type, label: getExceptionType(newException.type)?.label }}>
          <Select.Trigger>
            <Select.Value placeholder="Select type" />
          </Select.Trigger>
          <Select.Content>
            {#each EXCEPTION_TYPES as type}
              <Select.Item value={type.id}>
                <div class="flex items-center gap-2">
                  <svelte:component this={type.icon} class={cn('w-4 h-4', type.color)} />
                  {type.label}
                </div>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="grid gap-2">
        <Label for="priority">Priority</Label>
        <Select.Root bind:selected={{ value: newException.priority, label: EXCEPTION_PRIORITY_CONFIG[newException.priority]?.label }}>
          <Select.Trigger>
            <Select.Value placeholder="Select priority" />
          </Select.Trigger>
          <Select.Content>
            {#each Object.entries(EXCEPTION_PRIORITY_CONFIG) as [key, config]}
              <Select.Item value={key}>{config.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="grid gap-2">
        <Label for="package_id">Package ID (optional)</Label>
        <Input
          id="package_id"
          bind:value={newException.package_id}
          placeholder="Enter tracking number or package ID"
        />
      </div>
      <div class="grid gap-2">
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          bind:value={newException.description}
          placeholder="Describe the issue in detail..."
          rows={4}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button variant="outline" on:click={() => createDialogOpen = false}>Cancel</Button>
      <Button on:click={createException} disabled={!newException.description}>
        Create Exception
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Exception Detail Dialog -->
<Dialog.Root bind:open={detailDialogOpen}>
  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Exception Details</Dialog.Title>
    </Dialog.Header>
    {#if selectedException}
      {@const typeConfig = getExceptionType(selectedException.type)}
      {@const statusConfig = EXCEPTION_STATUS_CONFIG[selectedException.status]}
      {@const priorityConfig = EXCEPTION_PRIORITY_CONFIG[selectedException.priority]}
      <div class="space-y-4 py-4">
        <div class="flex items-center gap-4">
          <div class={cn('p-3 rounded-lg', typeConfig?.bgColor)}>
            <svelte:component this={typeConfig?.icon || HelpCircle} class={cn('w-6 h-6', typeConfig?.color)} />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{typeConfig?.label}</h3>
            <p class="text-sm text-gray-500">{typeConfig?.description}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Status</p>
            <span class={cn('inline-flex px-2 py-1 rounded-full text-sm font-medium', statusConfig?.bgColor, statusConfig?.color)}>
              {statusConfig?.label}
            </span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Priority</p>
            <span class={cn('inline-flex px-2 py-1 rounded-full text-sm font-medium', priorityConfig?.bgColor, priorityConfig?.color)}>
              {priorityConfig?.label}
            </span>
          </div>
        </div>

        {#if selectedException.package?.tracking_number}
          <div>
            <p class="text-sm font-medium text-gray-500">Package</p>
            <p class="font-mono">{selectedException.package.tracking_number}</p>
          </div>
        {/if}

        <div>
          <p class="text-sm font-medium text-gray-500">Description</p>
          <p class="text-gray-900 whitespace-pre-wrap">{selectedException.description}</p>
        </div>

        {#if selectedException.resolution}
          <div>
            <p class="text-sm font-medium text-gray-500">Resolution</p>
            <p class="text-gray-900">{selectedException.resolution}</p>
          </div>
        {/if}

        {#if selectedException.resolution_notes}
          <div>
            <p class="text-sm font-medium text-gray-500">Resolution Notes</p>
            <p class="text-gray-900 whitespace-pre-wrap">{selectedException.resolution_notes}</p>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p class="text-sm font-medium text-gray-500">Created</p>
            <p class="text-gray-900">{new Date(selectedException.created).toLocaleString()}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Customer Notified</p>
            <p class="text-gray-900">
              {selectedException.customer_notified ? 'Yes' : 'No'}
              {#if selectedException.customer_notification_date}
                ({new Date(selectedException.customer_notification_date).toLocaleString()})
              {/if}
            </p>
          </div>
        </div>
      </div>
    {/if}
    <Dialog.Footer>
      <Button variant="outline" on:click={() => detailDialogOpen = false}>Close</Button>
      {#if selectedException && selectedException.status !== 'resolved' && selectedException.status !== 'closed'}
        <Button on:click={() => { detailDialogOpen = false; openResolve(selectedException.id); }}>
          Resolve Exception
        </Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Resolve Exception Dialog -->
<Dialog.Root bind:open={resolveDialogOpen}>
  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Resolve Exception</Dialog.Title>
      <Dialog.Description>
        Select a resolution and add any notes
      </Dialog.Description>
    </Dialog.Header>
    {#if selectedException}
      {@const typeConfig = getExceptionType(selectedException.type)}
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="resolution">Resolution</Label>
          <Select.Root bind:selected={{ value: resolveData.resolution, label: resolveData.resolution }}>
            <Select.Trigger>
              <Select.Value placeholder="Select resolution" />
            </Select.Trigger>
            <Select.Content>
              {#each typeConfig?.resolutionOptions || [] as option}
                <Select.Item value={option}>{option}</Select.Item>
              {/each}
              <Select.Item value="Other">Other (specify in notes)</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="grid gap-2">
          <Label for="resolution_notes">Resolution Notes</Label>
          <Textarea
            id="resolution_notes"
            bind:value={resolveData.resolution_notes}
            placeholder="Add any additional details about the resolution..."
            rows={3}
          />
        </div>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyCustomer"
            bind:checked={resolveData.notifyCustomer}
            class="rounded border-gray-300"
          />
          <Label for="notifyCustomer" class="text-sm font-normal">
            Notify customer about resolution
          </Label>
        </div>
      </div>
    {/if}
    <Dialog.Footer>
      <Button variant="outline" on:click={() => resolveDialogOpen = false}>Cancel</Button>
      <Button on:click={resolveException} disabled={!resolveData.resolution}>
        <CheckCircle class="w-4 h-4 mr-2" />
        Resolve Exception
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

