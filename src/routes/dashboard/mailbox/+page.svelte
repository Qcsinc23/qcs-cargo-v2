<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { COMPANY } from '$lib/config/constants';
  import { toast } from '$lib/stores/toast';
  import {
    Mail,
    Copy,
    Check,
    Package,
    MapPin,
    Clock,
    Info,
    ExternalLink
  } from 'lucide-svelte';

  export let data;

  // Mailbox data (will come from user's profile/PocketBase)
  let mailbox = {
    suite_code: 'QCS-' + (data.user?.id?.slice(0, 6).toUpperCase() || '000000'),
    status: 'active' as 'active' | 'pending' | 'suspended',
    packages_waiting: 0
  };

  let copied = false;

  // Format the full mailbox address
  $: fullAddress = `${data.user?.name || 'Your Name'}
Suite ${mailbox.suite_code}
${COMPANY.fullAddress}`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(fullAddress);
      copied = true;
      toast.success('Address copied to clipboard!');
      setTimeout(() => { copied = false; }, 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  }

  async function copySuiteCode() {
    try {
      await navigator.clipboard.writeText(mailbox.suite_code);
      toast.success('Suite code copied!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  }
</script>

<svelte:head>
  <title>My Mailbox | QCS Cargo</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">My Mailbox</h1>
    <p class="text-gray-600 mt-1">Your personal shipping address in New Jersey</p>
  </div>

  <!-- Mailbox Status -->
  <Card class="border-primary-200 bg-gradient-to-br from-primary-50 to-white">
    <CardContent class="p-6">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Mail class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">Personal Mailbox</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                {mailbox.status === 'active' ? 'bg-green-100 text-green-700' : 
                 mailbox.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                 'bg-red-100 text-red-700'}">
                {mailbox.status === 'active' ? '● Active' : 
                 mailbox.status === 'pending' ? '● Pending Setup' : 
                 '● Suspended'}
              </span>
            </div>
          </div>
        </div>

        {#if mailbox.packages_waiting > 0}
          <div class="text-right">
            <div class="text-2xl font-bold text-primary-600">{mailbox.packages_waiting}</div>
            <div class="text-sm text-gray-600">packages waiting</div>
          </div>
        {/if}
      </div>

      <!-- Suite Code -->
      <div class="bg-white rounded-lg border p-4 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">Your Suite Code</p>
            <p class="text-2xl font-mono font-bold text-primary-600 tracking-wider">
              {mailbox.suite_code}
            </p>
          </div>
          <Button variant="outline" size="sm" on:click={copySuiteCode}>
            <Copy class="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <!-- Full Address -->
      <div class="bg-white rounded-lg border p-4">
        <div class="flex items-start justify-between mb-3">
          <p class="text-sm text-gray-500">Your Shipping Address</p>
          <Button variant="outline" size="sm" on:click={copyAddress}>
            {#if copied}
              <Check class="w-4 h-4 mr-1 text-green-600" />
              Copied!
            {:else}
              <Copy class="w-4 h-4 mr-1" />
              Copy Address
            {/if}
          </Button>
        </div>
        <div class="font-medium text-gray-900 whitespace-pre-line text-sm leading-relaxed">
          {data.user?.name || 'Your Name'}
          <br />
          Suite {mailbox.suite_code}
          <br />
          {COMPANY.fullAddress}
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- How It Works -->
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">How Your Mailbox Works</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-xl font-bold text-primary-600">1</span>
          </div>
          <h3 class="font-medium text-gray-900 mb-1">Shop Online</h3>
          <p class="text-sm text-gray-600">
            Use your mailbox address when shopping from US stores
          </p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-xl font-bold text-primary-600">2</span>
          </div>
          <h3 class="font-medium text-gray-900 mb-1">We Receive</h3>
          <p class="text-sm text-gray-600">
            Packages arrive at our warehouse and we notify you
          </p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-xl font-bold text-primary-600">3</span>
          </div>
          <h3 class="font-medium text-gray-900 mb-1">We Ship</h3>
          <p class="text-sm text-gray-600">
            Book a shipment and we'll deliver to your destination
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Tips -->
  <Alert>
    <Info class="w-4 h-4" />
    <AlertDescription>
      <strong>Pro Tip:</strong> Always include your suite code ({mailbox.suite_code}) when placing online orders. 
      Without it, we may not be able to identify your packages.
    </AlertDescription>
  </Alert>

  <!-- Warehouse Info -->
  <Card>
    <CardHeader>
      <CardTitle class="text-lg flex items-center gap-2">
        <MapPin class="w-5 h-5" />
        Warehouse Location
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Address</h4>
          <p class="text-gray-600 text-sm">
            {COMPANY.fullAddress}
          </p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-2"
          >
            View on Google Maps
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Clock class="w-4 h-4" />
            Operating Hours
          </h4>
          <div class="text-sm text-gray-600 space-y-1">
            <p>Monday - Friday: {COMPANY.hours.weekday}</p>
            <p>Saturday: {COMPANY.hours.saturday}</p>
            <p>Sunday: {COMPANY.hours.sunday}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Quick Actions -->
  <div class="grid sm:grid-cols-2 gap-4">
    <Button variant="outline" href="/dashboard/shipments" class="h-auto py-4">
      <Package class="w-5 h-5 mr-2" />
      <div class="text-left">
        <div class="font-medium">View Shipments</div>
        <div class="text-xs text-gray-500">Track your packages</div>
      </div>
    </Button>
    <Button href="/dashboard/bookings/new" class="h-auto py-4">
      <Mail class="w-5 h-5 mr-2" />
      <div class="text-left">
        <div class="font-medium">Ship Packages</div>
        <div class="text-xs opacity-90">Book a new shipment</div>
      </div>
    </Button>
  </div>
</div>

