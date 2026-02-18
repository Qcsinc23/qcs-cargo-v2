<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { 
    Search, 
    Download, 
    Plus,
    MoreHorizontal,
    Eye,
    Mail,
    Edit,
    UserX,
    Users,
    UserCheck,
    Clock,
    ChevronLeft,
    ChevronRight,
    Shield,
    Package
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { goto } from '$app/navigation';

  // Filter state
  let searchQuery = '';
  let statusFilter = 'all';
  let roleFilter = 'all';
  let currentPage = 1;
  const perPage = 10;

  // Mock users data
  const allUsers = [
    { id: 'usr-1', name: 'Patricia Williams', email: 'patricia.w@email.com', phone: '+1 201-555-0101', role: 'customer', status: 'active', totalShipments: 23, totalSpent: 2450.75, created: '2023-06-15', lastActive: '2024-12-11' },
    { id: 'usr-2', name: 'Devon Thompson', email: 'devon.t@email.com', phone: '+1 201-555-0102', role: 'customer', status: 'active', totalShipments: 45, totalSpent: 5840.00, created: '2022-11-20', lastActive: '2024-12-12' },
    { id: 'usr-3', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '+1 201-555-0103', role: 'customer', status: 'active', totalShipments: 67, totalSpent: 8920.50, created: '2021-08-05', lastActive: '2024-12-12' },
    { id: 'usr-4', name: 'James Robinson', email: 'james.r@email.com', phone: '+1 201-555-0104', role: 'customer', status: 'inactive', totalShipments: 8, totalSpent: 650.00, created: '2024-01-10', lastActive: '2024-09-15' },
    { id: 'usr-5', name: 'Lisa Martinez', email: 'lisa.m@email.com', phone: '+1 201-555-0105', role: 'customer', status: 'active', totalShipments: 34, totalSpent: 3890.25, created: '2023-03-22', lastActive: '2024-12-10' },
    { id: 'usr-6', name: 'Michael Brown', email: 'michael.b@email.com', phone: '+1 201-555-0106', role: 'customer', status: 'active', totalShipments: 52, totalSpent: 6780.00, created: '2022-07-18', lastActive: '2024-12-11' },
    { id: 'usr-7', name: 'Sarah Kim', email: 'sarah.k@email.com', phone: '+1 201-555-0107', role: 'customer', status: 'suspended', totalShipments: 3, totalSpent: 280.50, created: '2024-08-01', lastActive: '2024-10-05' },
    { id: 'usr-8', name: 'John Davis', email: 'john.d@email.com', phone: '+1 201-555-0108', role: 'customer', status: 'active', totalShipments: 19, totalSpent: 2150.75, created: '2023-09-12', lastActive: '2024-12-09' },
    { id: 'staff-1', name: 'Admin User', email: 'admin@qcscargo.com', phone: '+1 201-249-0929', role: 'admin', status: 'active', totalShipments: 0, totalSpent: 0, created: '2021-01-01', lastActive: '2024-12-12' },
    { id: 'staff-2', name: 'Warehouse Staff', email: 'staff@qcscargo.com', phone: '+1 201-555-0200', role: 'staff', status: 'active', totalShipments: 0, totalSpent: 0, created: '2022-04-15', lastActive: '2024-12-12' }
  ];

  const statusColors = {
    active: { bg: 'bg-green-100', text: 'text-green-800' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
    suspended: { bg: 'bg-red-100', text: 'text-red-800' }
  };

  // Filter users
  $: filteredUsers = allUsers.filter(u => {
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !u.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.phone.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  $: totalPages = Math.ceil(filteredUsers.length / perPage);
  $: paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Stats
  $: totalCustomers = allUsers.filter(u => u.role === 'customer').length;
  $: activeCustomers = allUsers.filter(u => u.role === 'customer' && u.status === 'active').length;
  $: newThisMonth = allUsers.filter(u => {
    const created = new Date(u.created);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  function getStatusStyle(status: string) {
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  }
</script>

<svelte:head>
  <title>Users | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Users</h1>
      <p class="text-slate-500">Manage customers and staff accounts</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm">
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-blue-100 rounded-lg">
        <Users class="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Total Customers</p>
        <p class="text-2xl font-bold text-slate-900">{totalCustomers}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-green-100 rounded-lg">
        <UserCheck class="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Active Customers</p>
        <p class="text-2xl font-bold text-slate-900">{activeCustomers}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-purple-100 rounded-lg">
        <Clock class="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">New This Month</p>
        <p class="text-2xl font-bold text-slate-900">{newThisMonth}</p>
      </div>
    </Card>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search by name, email, or phone..."
            class="pl-10"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <select 
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={statusFilter}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select 
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={roleFilter}
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  </Card>

  <!-- Users Table -->
  <Card class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 border-b">
          <tr>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">User</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Contact</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Shipments</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Spent</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Last Active</th>
            <th class="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          {#each paginatedUsers as user (user.id)}
            {@const statusStyle = getStatusStyle(user.status)}
            <tr class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <a href={`/admin/users/${user.id}`} class="text-sm font-medium text-slate-900 hover:underline">
                      {user.name}
                    </a>
                    <p class="text-xs text-slate-500">Since {new Date(user.created).toLocaleDateString()}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div>
                  <p class="text-sm text-slate-900">{user.email}</p>
                  <p class="text-xs text-slate-500">{user.phone}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                )}>
                  {#if user.role === 'admin'}
                    <Shield class="h-3 w-3" />
                  {/if}
                  {user.role}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 text-sm text-slate-600">
                  <Package class="h-4 w-4" />
                  {user.totalShipments}
                </div>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">
                {user.totalSpent > 0 ? `$${user.totalSpent.toFixed(2)}` : '-'}
              </td>
              <td class="px-4 py-3">
                <span class={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  statusStyle.bg, statusStyle.text
                )}>
                  {user.status}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {new Date(user.lastActive).toLocaleDateString()}
              </td>
              <td class="px-4 py-3 text-right">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                      <button
                        {...props}
                        type="button"
                        class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="User actions"
                      >
                        <MoreHorizontal class="h-4 w-4" />
                      </button>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onSelect={() => goto(`/admin/users/${user.id}`)}>
                      <Eye class="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Mail class="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Edit class="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    {#if user.status === 'active'}
                      <DropdownMenu.Item class="text-red-600">
                        <UserX class="mr-2 h-4 w-4" />
                        Suspend User
                      </DropdownMenu.Item>
                    {:else}
                      <DropdownMenu.Item class="text-green-600">
                        <UserCheck class="mr-2 h-4 w-4" />
                        Activate User
                      </DropdownMenu.Item>
                    {/if}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="p-4 border-t bg-slate-50 flex items-center justify-between">
        <p class="text-sm text-slate-600">
          Showing <strong>{(currentPage - 1) * perPage + 1}</strong> to <strong>{Math.min(currentPage * perPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> results
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
          {#each Array(totalPages) as _, i}
            <Button 
              variant={currentPage === i + 1 ? 'default' : 'outline'}
              size="sm"
              on:click={() => currentPage = i + 1}
            >
              {i + 1}
            </Button>
          {/each}
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

