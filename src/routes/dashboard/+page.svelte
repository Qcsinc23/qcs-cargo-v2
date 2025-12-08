<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { EmptyState } from '$lib/components/shared';
  import { Package, Plus, ArrowRight, Mail, Clock, TrendingUp } from 'lucide-svelte';

  export let data;

  $: user = data.user;
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
    <a href="/dashboard/book">
      <Button>
        <Plus class="h-4 w-4 mr-2" />
        New Booking
      </Button>
    </a>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active Shipments</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Package class="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Pending Bookings</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center">
            <Clock class="h-6 w-6 text-warning-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Completed</p>
            <p class="text-2xl font-bold">0</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
            <TrendingUp class="h-6 w-6 text-success-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Mailbox</p>
            <p class="text-lg font-bold text-primary-600">Coming Soon</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <Mail class="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
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
          <a href="/dashboard/book">
            <Button variant="outline" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Book Shipment
            </Button>
          </a>
        </EmptyState>
      </CardContent>
    </Card>

    <!-- Upcoming Bookings -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Bookings</CardTitle>
        <a href="/dashboard/book" class="text-sm text-primary-600 hover:underline inline-flex items-center">
          New booking
          <ArrowRight class="h-4 w-4 ml-1" />
        </a>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No upcoming bookings"
          description="Schedule a drop-off to bring packages to our warehouse."
          icon="package"
        >
          <a href="/dashboard/book">
            <Button variant="outline" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Schedule Drop-off
            </Button>
          </a>
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
        <a href="/shipping-calculator" class="block p-4 rounded-lg border hover:bg-accent hover:border-primary-200 transition-colors">
          <div class="font-medium">Get Quote</div>
          <p class="text-sm text-muted-foreground">Calculate shipping costs</p>
        </a>
        <a href="/tracking" class="block p-4 rounded-lg border hover:bg-accent hover:border-primary-200 transition-colors">
          <div class="font-medium">Track Package</div>
          <p class="text-sm text-muted-foreground">Check shipment status</p>
        </a>
        <a href="/dashboard/recipients" class="block p-4 rounded-lg border hover:bg-accent hover:border-primary-200 transition-colors">
          <div class="font-medium">My Recipients</div>
          <p class="text-sm text-muted-foreground">Manage addresses</p>
        </a>
        <a href="/contact" class="block p-4 rounded-lg border hover:bg-accent hover:border-primary-200 transition-colors">
          <div class="font-medium">Get Help</div>
          <p class="text-sm text-muted-foreground">Contact support</p>
        </a>
      </div>
    </CardContent>
  </Card>
</div>

