<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { Switch } from '$lib/components/ui/switch';
  import { 
    Settings, 
    DollarSign, 
    Bell,
    Mail,
    Globe,
    Clock,
    Shield,
    Database,
    Save,
    RotateCcw
  } from 'lucide-svelte';

  // Settings state
  let settings = {
    // Pricing
    pricing: {
      guyana: 3.50,
      trinidad: 3.50,
      jamaica: 3.75,
      barbados: 4.00,
      suriname: 4.25,
      dimDivisor: 166,
      minCharge: 15,
      insuranceRate: 0.02,
      minInsurance: 5
    },
    // Notifications
    notifications: {
      emailOnBooking: true,
      emailOnPayment: true,
      emailOnStatusChange: true,
      smsEnabled: false,
      lowStockAlert: true
    },
    // Business Hours
    hours: {
      weekdayOpen: '09:00',
      weekdayClose: '18:00',
      saturdayOpen: '09:00',
      saturdayClose: '14:00',
      sundayOpen: '',
      sundayClose: ''
    },
    // General
    general: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: true,
      maxPackagesPerBooking: 20
    }
  };

  let saving = false;
  let hasChanges = false;

  async function saveSettings() {
    saving = true;
    await new Promise(r => setTimeout(r, 1000));
    saving = false;
    hasChanges = false;
  }

  function markChanged() {
    hasChanges = true;
  }

  function setEmailOnBooking(v: boolean) {
    settings.notifications.emailOnBooking = v;
    markChanged();
  }

  function setEmailOnPayment(v: boolean) {
    settings.notifications.emailOnPayment = v;
    markChanged();
  }

  function setEmailOnStatusChange(v: boolean) {
    settings.notifications.emailOnStatusChange = v;
    markChanged();
  }

  function setSmsEnabled(v: boolean) {
    settings.notifications.smsEnabled = v;
    markChanged();
  }

  function setMaintenanceMode(v: boolean) {
    settings.general.maintenanceMode = v;
    markChanged();
  }

  function setAllowNewRegistrations(v: boolean) {
    settings.general.allowNewRegistrations = v;
    markChanged();
  }

  function setRequireEmailVerification(v: boolean) {
    settings.general.requireEmailVerification = v;
    markChanged();
  }
</script>

<svelte:head>
  <title>Settings | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6 max-w-4xl">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Settings</h1>
      <p class="text-slate-500">Configure system-wide settings and preferences</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" disabled={!hasChanges}>
        <RotateCcw class="h-4 w-4 mr-2" />
        Reset
      </Button>
      <Button on:click={saveSettings} disabled={!hasChanges || saving}>
        <Save class="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  </div>

  <!-- Pricing Settings -->
  <Card class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-emerald-100 rounded-lg">
        <DollarSign class="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-slate-900">Pricing Configuration</h2>
        <p class="text-sm text-slate-500">Set base rates per destination</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="space-y-2">
        <Label>Guyana ($/lb)</Label>
        <Input 
          type="number" 
          step="0.25" 
          bind:value={settings.pricing.guyana}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Trinidad ($/lb)</Label>
        <Input 
          type="number" 
          step="0.25" 
          bind:value={settings.pricing.trinidad}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Jamaica ($/lb)</Label>
        <Input 
          type="number" 
          step="0.25" 
          bind:value={settings.pricing.jamaica}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Barbados ($/lb)</Label>
        <Input 
          type="number" 
          step="0.25" 
          bind:value={settings.pricing.barbados}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Suriname ($/lb)</Label>
        <Input 
          type="number" 
          step="0.25" 
          bind:value={settings.pricing.suriname}
          on:input={markChanged}
        />
      </div>
    </div>

    <Separator class="my-6" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="space-y-2">
        <Label>Dim Weight Divisor</Label>
        <Input 
          type="number" 
          bind:value={settings.pricing.dimDivisor}
          on:input={markChanged}
        />
        <p class="text-xs text-slate-500">L×W×H ÷ divisor</p>
      </div>
      <div class="space-y-2">
        <Label>Minimum Charge ($)</Label>
        <Input 
          type="number" 
          bind:value={settings.pricing.minCharge}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Insurance Rate (%)</Label>
        <Input 
          type="number" 
          step="0.01" 
          bind:value={settings.pricing.insuranceRate}
          on:input={markChanged}
        />
      </div>
      <div class="space-y-2">
        <Label>Min Insurance ($)</Label>
        <Input 
          type="number" 
          bind:value={settings.pricing.minInsurance}
          on:input={markChanged}
        />
      </div>
    </div>
  </Card>

  <!-- Notification Settings -->
  <Card class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-blue-100 rounded-lg">
        <Bell class="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-slate-900">Notifications</h2>
        <p class="text-sm text-slate-500">Configure email and SMS alerts</p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <Label>Email on New Booking</Label>
          <p class="text-sm text-slate-500">Send admin email when customer creates booking</p>
        </div>
        <Switch 
          checked={settings.notifications.emailOnBooking}
          onCheckedChange={setEmailOnBooking}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>Email on Payment</Label>
          <p class="text-sm text-slate-500">Send admin email when payment is received</p>
        </div>
        <Switch 
          checked={settings.notifications.emailOnPayment}
          onCheckedChange={setEmailOnPayment}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>Email on Status Change</Label>
          <p class="text-sm text-slate-500">Notify customers when shipment status changes</p>
        </div>
        <Switch 
          checked={settings.notifications.emailOnStatusChange}
          onCheckedChange={setEmailOnStatusChange}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>SMS Notifications</Label>
          <p class="text-sm text-slate-500">Enable SMS notifications for customers</p>
        </div>
        <Switch 
          checked={settings.notifications.smsEnabled}
          onCheckedChange={setSmsEnabled}
        />
      </div>
    </div>
  </Card>

  <!-- Business Hours -->
  <Card class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-amber-100 rounded-lg">
        <Clock class="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-slate-900">Business Hours</h2>
        <p class="text-sm text-slate-500">Set operating hours for bookings</p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4 items-center">
        <Label>Weekdays (Mon-Fri)</Label>
        <Input 
          type="time" 
          bind:value={settings.hours.weekdayOpen}
          on:input={markChanged}
        />
        <Input 
          type="time" 
          bind:value={settings.hours.weekdayClose}
          on:input={markChanged}
        />
      </div>
      <div class="grid grid-cols-3 gap-4 items-center">
        <Label>Saturday</Label>
        <Input 
          type="time" 
          bind:value={settings.hours.saturdayOpen}
          on:input={markChanged}
        />
        <Input 
          type="time" 
          bind:value={settings.hours.saturdayClose}
          on:input={markChanged}
        />
      </div>
      <div class="grid grid-cols-3 gap-4 items-center">
        <Label>Sunday</Label>
        <Input 
          type="time" 
          placeholder="Closed"
          bind:value={settings.hours.sundayOpen}
          on:input={markChanged}
        />
        <Input 
          type="time" 
          placeholder="Closed"
          bind:value={settings.hours.sundayClose}
          on:input={markChanged}
        />
      </div>
    </div>
  </Card>

  <!-- General Settings -->
  <Card class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-slate-100 rounded-lg">
        <Settings class="h-5 w-5 text-slate-600" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-slate-900">General Settings</h2>
        <p class="text-sm text-slate-500">System configuration options</p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <Label>Maintenance Mode</Label>
          <p class="text-sm text-slate-500">Temporarily disable customer access</p>
        </div>
        <Switch 
          checked={settings.general.maintenanceMode}
          onCheckedChange={setMaintenanceMode}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>Allow New Registrations</Label>
          <p class="text-sm text-slate-500">Enable customer self-registration</p>
        </div>
        <Switch 
          checked={settings.general.allowNewRegistrations}
          onCheckedChange={setAllowNewRegistrations}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>Require Email Verification</Label>
          <p class="text-sm text-slate-500">Customers must verify email before booking</p>
        </div>
        <Switch 
          checked={settings.general.requireEmailVerification}
          onCheckedChange={setRequireEmailVerification}
        />
      </div>
      <Separator />
      <div class="flex items-center justify-between">
        <div>
          <Label>Max Packages per Booking</Label>
          <p class="text-sm text-slate-500">Maximum number of packages in a single booking</p>
        </div>
        <Input 
          type="number" 
          class="w-24"
          bind:value={settings.general.maxPackagesPerBooking}
          on:input={markChanged}
        />
      </div>
    </div>
  </Card>
</div>

