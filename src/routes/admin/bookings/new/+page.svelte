<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card } from '$lib/components/ui/card';
  import { Label } from '$lib/components/ui/label';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { TIME_SLOTS, SATURDAY_SLOTS } from '$lib/config/constants';
  import { toast } from '$lib/stores/toast';

  type ServiceType = 'standard' | 'express' | 'door-to-door' | 'consolidated';
  type RecipientMode = 'existing' | 'new';

  interface CustomerOption {
    id: string;
    name: string;
    email: string;
  }

  interface RecipientOption {
    id: string;
    name: string;
    phone: string;
    city: string;
    address_line1?: string;
  }

  interface FormPackage {
    id: string;
    weight: string;
    weightUnknown: boolean;
    length: string;
    width: string;
    height: string;
    dimensionsUnknown: boolean;
    declaredValue: string;
    contentsDescription: string;
    specialInstructions: string;
  }

  interface NewRecipientForm {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    deliveryInstructions: string;
    saveForFuture: boolean;
  }

  let loadingCustomers = false;
  let loadingRecipients = false;
  let submitting = false;
  let customerSearch = '';
  let customers: CustomerOption[] = [];
  let recipients: RecipientOption[] = [];

  let customerId = '';
  let recipientMode: RecipientMode = 'existing';
  let recipientId = '';

  let serviceType: ServiceType = 'standard';
  let destination = DESTINATIONS[0]?.id || 'guyana';
  let scheduledDate = '';
  let timeSlot = '';
  let specialInstructions = '';

  let packages: FormPackage[] = [createPackage(1)];
  let newRecipient: NewRecipientForm = {
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    deliveryInstructions: '',
    saveForFuture: false
  };

  function createPackage(index: number): FormPackage {
    return {
      id: `pkg-${index}-${Date.now()}`,
      weight: '',
      weightUnknown: false,
      length: '',
      width: '',
      height: '',
      dimensionsUnknown: false,
      declaredValue: '',
      contentsDescription: '',
      specialInstructions: ''
    };
  }

  function toPositiveOrNull(value: string): number | null {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  function toNonNegativeOrNull(value: string): number | null {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? num : null;
  }

  function getTomorrowIsoDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  function getAvailableSlots(date: string): string[] {
    if (!date) return [];
    const day = new Date(`${date}T12:00:00`).getDay();
    if (day === 0) return [];
    if (day === 6) return SATURDAY_SLOTS;
    return TIME_SLOTS;
  }

  $: availableSlots = getAvailableSlots(scheduledDate);
  $: if (timeSlot && !availableSlots.includes(timeSlot)) {
    timeSlot = '';
  }

  async function loadCustomers() {
    loadingCustomers = true;
    try {
      const params = new URLSearchParams({
        page: '1',
        perPage: '100',
        ...(customerSearch ? { search: customerSearch } : {})
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || 'Failed to load customers');
      }

      const payload = body?.data || body;
      customers = payload.customers || [];
    } catch (err) {
      console.error('Failed to load customers', err);
      toast.error('Failed to load customers');
    } finally {
      loadingCustomers = false;
    }
  }

  async function loadRecipientsForCustomer(selectedCustomerId: string) {
    if (!selectedCustomerId) {
      recipients = [];
      recipientId = '';
      return;
    }

    loadingRecipients = true;
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomerId })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to load customer details');
      }

      const payload = body?.data || body;
      recipients = payload.recipients || [];
      if (recipients.length > 0) {
        recipientMode = 'existing';
        recipientId = recipients[0].id;
      } else {
        recipientMode = 'new';
        recipientId = '';
      }
    } catch (err) {
      console.error('Failed to load recipients', err);
      toast.error('Failed to load customer recipients');
    } finally {
      loadingRecipients = false;
    }
  }

  function onCustomerChange(selectedCustomerId: string) {
    customerId = selectedCustomerId;
    void loadRecipientsForCustomer(selectedCustomerId);
  }

  function addPackage() {
    if (packages.length >= 20) return;
    packages = [...packages, createPackage(packages.length + 1)];
  }

  function removePackage(index: number) {
    if (packages.length <= 1) return;
    packages = packages.filter((_, i) => i !== index);
  }

  function validateForm(): string | null {
    if (!customerId) return 'Please select a customer';
    if (!destination) return 'Please select a destination';
    if (!scheduledDate) return 'Please select a date';
    if (!timeSlot) return 'Please select a time slot';
    if (packages.length === 0) return 'At least one package is required';

    for (const pkg of packages) {
      if (!pkg.weightUnknown && !toPositiveOrNull(pkg.weight)) {
        return 'Each package must have a valid weight or mark weight as unknown';
      }
    }

    if (recipientMode === 'existing') {
      if (!recipientId) return 'Please select a recipient';
    } else {
      if (!newRecipient.name.trim()) return 'Recipient name is required';
      if (!newRecipient.phone.trim()) return 'Recipient phone is required';
      if (!newRecipient.addressLine1.trim()) return 'Recipient address is required';
      if (!newRecipient.city.trim()) return 'Recipient city is required';
    }

    return null;
  }

  async function submit() {
    if (submitting) return;
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      customerId,
      serviceType,
      destination,
      scheduledDate,
      timeSlot,
      packages: packages.map((pkg) => ({
        id: pkg.id,
        weight: pkg.weightUnknown ? null : toPositiveOrNull(pkg.weight),
        weightUnknown: pkg.weightUnknown,
        length: pkg.dimensionsUnknown ? null : toPositiveOrNull(pkg.length),
        width: pkg.dimensionsUnknown ? null : toPositiveOrNull(pkg.width),
        height: pkg.dimensionsUnknown ? null : toPositiveOrNull(pkg.height),
        dimensionsUnknown: pkg.dimensionsUnknown,
        declaredValue: toNonNegativeOrNull(pkg.declaredValue),
        contentsDescription: pkg.contentsDescription,
        specialInstructions: pkg.specialInstructions
      })),
      recipientId: recipientMode === 'existing' ? recipientId : null,
      recipient:
        recipientMode === 'new'
          ? {
              name: newRecipient.name.trim(),
              phone: newRecipient.phone.trim(),
              addressLine1: newRecipient.addressLine1.trim(),
              addressLine2: newRecipient.addressLine2.trim(),
              city: newRecipient.city.trim(),
              destination,
              deliveryInstructions: newRecipient.deliveryInstructions.trim(),
              saveForFuture: !!newRecipient.saveForFuture
            }
          : null,
      specialInstructions
    };

    submitting = true;
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok || body?.status !== 'success') {
        const details = body?.data?.issues?.map((issue: { message: string }) => issue.message).join('; ');
        throw new Error(details || body?.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully');
      await goto('/admin/bookings');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      toast.error(message);
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    void loadCustomers();
  });
</script>

<svelte:head>
  <title>New Booking | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Create Booking</h1>
      <p class="text-slate-500">Create a booking on behalf of a customer.</p>
    </div>
    <Button variant="outline" href="/admin/bookings">Back to Bookings</Button>
  </div>

  <Card class="p-5 space-y-4">
    <div class="flex flex-col md:flex-row gap-3">
      <div class="flex-1">
        <Label for="customer-search">Search Customer</Label>
        <Input
          id="customer-search"
          placeholder="Search by name or email"
          bind:value={customerSearch}
          on:keydown={(e) => e.key === 'Enter' && loadCustomers()}
        />
      </div>
      <div class="md:self-end">
        <Button type="button" variant="outline" on:click={loadCustomers} disabled={loadingCustomers}>
          {loadingCustomers ? 'Loading...' : 'Search'}
        </Button>
      </div>
    </div>

    <div>
      <Label for="customer-id">Customer</Label>
      <select
        id="customer-id"
        class="w-full h-10 border rounded-md px-3 bg-white text-sm"
        bind:value={customerId}
        on:change={(e) => onCustomerChange((e.currentTarget as HTMLSelectElement).value)}
      >
        <option value="">Select customer</option>
        {#each customers as customer}
          <option value={customer.id}>{customer.name || customer.email} ({customer.email})</option>
        {/each}
      </select>
    </div>
  </Card>

  <Card class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Recipient</h2>
      {#if recipients.length > 0}
        <div class="flex gap-2">
          <Button type="button" variant={recipientMode === 'existing' ? 'default' : 'outline'} size="sm" on:click={() => (recipientMode = 'existing')}>
            Existing
          </Button>
          <Button type="button" variant={recipientMode === 'new' ? 'default' : 'outline'} size="sm" on:click={() => (recipientMode = 'new')}>
            New
          </Button>
        </div>
      {/if}
    </div>

    {#if loadingRecipients}
      <p class="text-sm text-slate-500">Loading recipients...</p>
    {:else if recipientMode === 'existing' && recipients.length > 0}
      <div>
        <Label for="recipient-id">Saved Recipient</Label>
        <select id="recipient-id" class="w-full h-10 border rounded-md px-3 bg-white text-sm" bind:value={recipientId}>
          <option value="">Select recipient</option>
          {#each recipients as recipient}
            <option value={recipient.id}>
              {recipient.name} - {recipient.phone} ({recipient.city})
            </option>
          {/each}
        </select>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label for="rec-name">Recipient Name</Label>
          <Input id="rec-name" bind:value={newRecipient.name} />
        </div>
        <div>
          <Label for="rec-phone">Phone</Label>
          <Input id="rec-phone" bind:value={newRecipient.phone} />
        </div>
        <div class="md:col-span-2">
          <Label for="rec-address1">Address Line 1</Label>
          <Input id="rec-address1" bind:value={newRecipient.addressLine1} />
        </div>
        <div class="md:col-span-2">
          <Label for="rec-address2">Address Line 2</Label>
          <Input id="rec-address2" bind:value={newRecipient.addressLine2} />
        </div>
        <div>
          <Label for="rec-city">City</Label>
          <Input id="rec-city" bind:value={newRecipient.city} />
        </div>
        <div class="flex items-end">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" bind:checked={newRecipient.saveForFuture} />
            Save recipient for future
          </label>
        </div>
        <div class="md:col-span-2">
          <Label for="rec-instructions">Delivery Instructions</Label>
          <textarea
            id="rec-instructions"
            class="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm"
            bind:value={newRecipient.deliveryInstructions}
          ></textarea>
        </div>
      </div>
    {/if}
  </Card>

  <Card class="p-5 space-y-4">
    <h2 class="text-lg font-semibold text-slate-900">Booking Details</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label for="service-type">Service Type</Label>
        <select id="service-type" class="w-full h-10 border rounded-md px-3 bg-white text-sm" bind:value={serviceType}>
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="door-to-door">Door to Door</option>
          <option value="consolidated">Consolidated</option>
        </select>
      </div>

      <div>
        <Label for="destination">Destination</Label>
        <select id="destination" class="w-full h-10 border rounded-md px-3 bg-white text-sm" bind:value={destination}>
          {#each DESTINATIONS as item}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <Label for="scheduled-date">Scheduled Date</Label>
        <Input id="scheduled-date" type="date" min={getTomorrowIsoDate()} bind:value={scheduledDate} />
      </div>

      <div>
        <Label for="time-slot">Time Slot</Label>
        <select id="time-slot" class="w-full h-10 border rounded-md px-3 bg-white text-sm" bind:value={timeSlot} disabled={!scheduledDate}>
          <option value="">Select time slot</option>
          {#each availableSlots as slot}
            <option value={slot}>{slot}</option>
          {/each}
        </select>
      </div>
    </div>

    <div>
      <Label for="booking-notes">Special Instructions</Label>
      <textarea id="booking-notes" class="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm" bind:value={specialInstructions}></textarea>
    </div>
  </Card>

  <Card class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Packages</h2>
      <Button type="button" variant="outline" size="sm" on:click={addPackage} disabled={packages.length >= 20}>
        Add Package
      </Button>
    </div>

    {#each packages as pkg, idx}
      <div class="border rounded-md p-4 space-y-3">
        <div class="flex items-center justify-between">
          <p class="font-medium text-slate-800">Package {idx + 1}</p>
          <Button type="button" variant="ghost" size="sm" on:click={() => removePackage(idx)} disabled={packages.length <= 1}>
            Remove
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Weight (lb)</Label>
            <input class="w-full h-10 border rounded-md px-3 text-sm" type="number" min="0" step="0.1" bind:value={pkg.weight} disabled={pkg.weightUnknown} />
          </div>
          <div class="md:col-span-3 flex items-end">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" bind:checked={pkg.weightUnknown} />
              Weight unknown
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Length (in)</Label>
            <input class="w-full h-10 border rounded-md px-3 text-sm" type="number" min="0" step="0.1" bind:value={pkg.length} disabled={pkg.dimensionsUnknown} />
          </div>
          <div>
            <Label>Width (in)</Label>
            <input class="w-full h-10 border rounded-md px-3 text-sm" type="number" min="0" step="0.1" bind:value={pkg.width} disabled={pkg.dimensionsUnknown} />
          </div>
          <div>
            <Label>Height (in)</Label>
            <input class="w-full h-10 border rounded-md px-3 text-sm" type="number" min="0" step="0.1" bind:value={pkg.height} disabled={pkg.dimensionsUnknown} />
          </div>
          <div>
            <Label>Declared Value ($)</Label>
            <input class="w-full h-10 border rounded-md px-3 text-sm" type="number" min="0" step="0.01" bind:value={pkg.declaredValue} />
          </div>
        </div>

        <div>
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" bind:checked={pkg.dimensionsUnknown} />
            Dimensions unknown
          </label>
        </div>

        <div>
          <Label>Contents Description</Label>
          <Input bind:value={pkg.contentsDescription} />
        </div>
        <div>
          <Label>Package Instructions</Label>
          <textarea class="w-full min-h-[70px] border rounded-md px-3 py-2 text-sm" bind:value={pkg.specialInstructions}></textarea>
        </div>
      </div>
    {/each}
  </Card>

  <div class="flex justify-end">
    <Button type="button" on:click={submit} disabled={submitting}>
      {submitting ? 'Creating Booking...' : 'Create Booking'}
    </Button>
  </div>
</div>
