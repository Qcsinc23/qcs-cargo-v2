<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { EmptyState } from '$lib/components/shared';
  import { COMPANY } from '$lib/config/constants';
  import { toast } from '$lib/stores/toast';
  import { 
    Package, 
    Plus, 
    ArrowRight, 
    Mail, 
    Clock, 
    TrendingUp, 
    Copy, 
    Check,
    Calculator,
    MapPin,
    Users,
    HelpCircle
  } from 'lucide-svelte';

  export let data;

  $: user = data.user;
  
  // Generate mailbox suite code from user ID
  $: suiteCode = 'QCS-' + (user?.id?.slice(0, 6).toUpperCase() || '000000');
  
  let copiedSuite = false;
  
  async function copySuiteCode() {
    try {
      await navigator.clipboard.writeText(suiteCode);
      copiedSuite = true;
      toast.success('Suite code copied!');
      setTimeout(() => { copiedSuite = false; }, 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }
</script>

<svelte:head>
  <title>Dashboard | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Welcome Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
      </h1>
      <p class="text-muted-foreground mt-1">Here's what's happening with your shipments</p>
    </div>
    <Button href="/dashboard/bookings/new">
      <Plus class="h-4 w-4 mr-2" />
      New Booking
    </Button>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active Shipments</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Package class="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <a href="/dashboard/shipments" class="text-xs text-primary-600 hover:underline mt-2 inline-block">
          View all →
        </a>
      </CardContent>
    </Card>

    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Pending Bookings</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock class="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <a href="/dashboard/bookings" class="text-xs text-primary-600 hover:underline mt-2 inline-block">
          View all →
        </a>
      </CardContent>
    </Card>

    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Completed</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp class="h-6 w-6 text-green-600" />
          </div>
        </div>
        <span class="text-xs text-gray-400 mt-2 inline-block">All time</span>
      </CardContent>
    </Card>

    <!-- Mailbox Widget -->
    <Card class="bg-gradient-to-br from-primary-50 to-white border-primary-200 hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-primary-700">Your Mailbox</p>
          <Mail class="h-5 w-5 text-primary-600" />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-primary-700">{suiteCode}</span>
          <button 
            class="p-1 hover:bg-primary-100 rounded"
            on:click={copySuiteCode}
          >
            {#if copiedSuite}
              <Check class="w-4 h-4 text-green-600" />
            {:else}
              <Copy class="w-4 h-4 text-primary-600" />
            {/if}
          </button>
        </div>
        <a href="/dashboard/mailbox" class="text-xs text-primary-600 hover:underline mt-2 inline-block">
          Full address →
        </a>
      </CardContent>
    </Card>
  </div>

  <!-- Main Content Area -->
  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Recent Shipments -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Recent Shipments</CardTitle>
        <a href="/dashboard/shipments" class="text-sm text-primary-600 hover:underline inline-flex items-center">
          View all
          <ArrowRight class="h-4 w-4 ml-1" />
        </a>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No shipments yet"
          description="Book your first shipment to start tracking packages."
          icon="package"
        >
          <Button variant="outline" size="sm" href="/dashboard/bookings/new">
            <Plus class="h-4 w-4 mr-2" />
            Book Shipment
          </Button>
        </EmptyState>
      </CardContent>
    </Card>

    <!-- Upcoming Bookings -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Bookings</CardTitle>
        <a href="/dashboard/bookings/new" class="text-sm text-primary-600 hover:underline inline-flex items-center">
          New booking
          <ArrowRight class="h-4 w-4 ml-1" />
        </a>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No upcoming bookings"
          description="Schedule a drop-off to bring packages to our warehouse."
          icon="calendar"
        >
          <Button variant="outline" size="sm" href="/dashboard/bookings/new">
            <Plus class="h-4 w-4 mr-2" />
            Schedule Drop-off
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  </div>

  <!-- Quick Actions -->
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a href="/shipping-calculator" class="group block p-4 rounded-lg border hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Calculator class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div class="font-medium">Get Quote</div>
              <p class="text-sm text-muted-foreground">Calculate shipping costs</p>
            </div>
          </div>
        </a>
        <a href="/tracking" class="group block p-4 rounded-lg border hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MapPin class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div class="font-medium">Track Package</div>
              <p class="text-sm text-muted-foreground">Check shipment status</p>
            </div>
          </div>
        </a>
        <a href="/dashboard/recipients" class="group block p-4 rounded-lg border hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="font-medium">My Recipients</div>
              <p class="text-sm text-muted-foreground">Manage addresses</p>
            </div>
          </div>
        </a>
        <a href="/contact" class="group block p-4 rounded-lg border hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <HelpCircle class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div class="font-medium">Get Help</div>
              <p class="text-sm text-muted-foreground">Contact support</p>
            </div>
          </div>
        </a>
      </div>
    </CardContent>
  </Card>
</div>

