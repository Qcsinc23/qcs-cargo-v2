<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { 
    Search, 
    Filter,
    Download,
    Activity,
    User,
    Package,
    CreditCard,
    Settings,
    LogIn,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  // Filter state
  let searchQuery = '';
  let typeFilter = 'all';
  let userFilter = 'all';
  let currentPage = 1;
  const perPage = 20;

  // Mock activity data
  const activityLog = [
    { id: 1, type: 'user', action: 'login', user: 'Admin User', description: 'Logged in to admin panel', ip: '192.168.1.100', timestamp: '2024-12-12T10:30:00' },
    { id: 2, type: 'shipment', action: 'status_update', user: 'Admin User', description: 'Updated shipment SH-2024-0162 status to "In Transit"', resource: 'SH-2024-0162', timestamp: '2024-12-12T10:28:00' },
    { id: 3, type: 'booking', action: 'create', user: 'System', description: 'New booking BK-2024-0095 created by Maria G.', resource: 'BK-2024-0095', timestamp: '2024-12-12T10:15:00' },
    { id: 4, type: 'payment', action: 'received', user: 'System', description: 'Payment of $234.50 received for INV-2024-0089', resource: 'INV-2024-0089', timestamp: '2024-12-12T10:16:00' },
    { id: 5, type: 'user', action: 'register', user: 'System', description: 'New user registration: john.d@email.com', timestamp: '2024-12-12T09:45:00' },
    { id: 6, type: 'shipment', action: 'create', user: 'Warehouse Staff', description: 'Created shipment SH-2024-0162 from booking BK-2024-0093', resource: 'SH-2024-0162', timestamp: '2024-12-12T09:30:00' },
    { id: 7, type: 'settings', action: 'update', user: 'Admin User', description: 'Updated pricing for Jamaica to $3.75/lb', timestamp: '2024-12-11T16:00:00' },
    { id: 8, type: 'user', action: 'update', user: 'Admin User', description: 'Updated user profile for Devon T.', resource: 'usr-2', timestamp: '2024-12-11T15:30:00' },
    { id: 9, type: 'shipment', action: 'status_update', user: 'System', description: 'Shipment SH-2024-0160 cleared customs', resource: 'SH-2024-0160', timestamp: '2024-12-11T14:00:00' },
    { id: 10, type: 'booking', action: 'cancel', user: 'Admin User', description: 'Cancelled booking BK-2024-0088 by request', resource: 'BK-2024-0088', timestamp: '2024-12-11T11:00:00' }
  ];

  const typeIcons: Record<string, typeof Activity> = {
    user: User,
    shipment: Package,
    booking: Package,
    payment: CreditCard,
    settings: Settings
  };

  const actionColors: Record<string, string> = {
    login: 'bg-blue-100 text-blue-700',
    logout: 'bg-gray-100 text-gray-700',
    create: 'bg-green-100 text-green-700',
    update: 'bg-amber-100 text-amber-700',
    delete: 'bg-red-100 text-red-700',
    status_update: 'bg-purple-100 text-purple-700',
    register: 'bg-emerald-100 text-emerald-700',
    received: 'bg-green-100 text-green-700',
    cancel: 'bg-red-100 text-red-700'
  };

  // Filter
  $: filteredActivity = activityLog.filter(a => {
    if (searchQuery && !a.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.user.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  $: totalPages = Math.ceil(filteredActivity.length / perPage);
  $: paginatedActivity = filteredActivity.slice((currentPage - 1) * perPage, currentPage * perPage);

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  let refreshing = false;
  async function refresh() {
    refreshing = true;
    await new Promise(r => setTimeout(r, 1000));
    refreshing = false;
  }
</script>

<svelte:head>
  <title>Activity Log | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Activity Log</h1>
      <p class="text-slate-500">Track all system activity and user actions</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={refresh} disabled={refreshing}>
        <RefreshCw class={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
        Refresh
      </Button>
      <Button variant="outline" size="sm">
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search activity..."
            class="pl-10"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <select 
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={typeFilter}
        >
          <option value="all">All Types</option>
          <option value="user">User</option>
          <option value="shipment">Shipment</option>
          <option value="booking">Booking</option>
          <option value="payment">Payment</option>
          <option value="settings">Settings</option>
        </select>
      </div>
    </div>
  </Card>

  <!-- Activity List -->
  <Card class="overflow-hidden">
    <div class="divide-y">
      {#each paginatedActivity as activity (activity.id)}
        {@const Icon = typeIcons[activity.type] || Activity}
        <div class="p-4 hover:bg-slate-50 flex items-start gap-4">
          <div class={cn(
            'p-2 rounded-lg',
            activity.type === 'user' ? 'bg-blue-100' :
            activity.type === 'shipment' ? 'bg-purple-100' :
            activity.type === 'booking' ? 'bg-amber-100' :
            activity.type === 'payment' ? 'bg-green-100' :
            'bg-slate-100'
          )}>
            <Icon class={cn(
              'h-4 w-4',
              activity.type === 'user' ? 'text-blue-600' :
              activity.type === 'shipment' ? 'text-purple-600' :
              activity.type === 'booking' ? 'text-amber-600' :
              activity.type === 'payment' ? 'text-green-600' :
              'text-slate-600'
            )} />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class={cn(
                'px-2 py-0.5 rounded text-xs font-medium capitalize',
                actionColors[activity.action] || 'bg-slate-100 text-slate-700'
              )}>
                {activity.action.replace('_', ' ')}
              </span>
              <span class="text-sm text-slate-500">{activity.user}</span>
            </div>
            <p class="text-sm text-slate-900">{activity.description}</p>
            {#if activity.ip}
              <p class="text-xs text-slate-400 mt-1">IP: {activity.ip}</p>
            {/if}
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-500">{formatTime(activity.timestamp)}</p>
            {#if activity.resource}
              <span class="text-xs text-blue-600">{activity.resource}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="p-4 border-t bg-slate-50 flex items-center justify-between">
        <p class="text-sm text-slate-600">
          Showing <strong>{(currentPage - 1) * perPage + 1}</strong> to <strong>{Math.min(currentPage * perPage, filteredActivity.length)}</strong> of <strong>{filteredActivity.length}</strong>
        </p>
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            on:click={() => currentPage--}
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            on:click={() => currentPage++}
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    {/if}
  </Card>
</div>

