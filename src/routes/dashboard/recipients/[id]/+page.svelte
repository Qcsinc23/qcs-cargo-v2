<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { toast } from '$lib/stores/toast';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { ArrowLeft, Loader2, User, MapPin, Phone, Globe, Star, Trash2 } from 'lucide-svelte';
  import { ConfirmDialog } from '$lib/components/shared';

  $: recipientId = $page.params.id;

  let loading = false;
  let pageLoading = true;
  let showDeleteConfirm = false;
  let errors: Record<string, string> = {};

  let form = {
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    destination: '',
    delivery_instructions: '',
    is_default: false
  };

  onMount(async () => {
    try {
      const response = await fetch(`/api/recipients/${recipientId}`);
      if (!response.ok) {
        toast.error('Recipient not found');
        goto('/dashboard/recipients');
        return;
      }
      const data = await response.json();
      form = {
        name: data.name || '',
        phone: data.phone || '',
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2 || '',
        city: data.city || '',
        destination: data.destination || '',
        delivery_instructions: data.delivery_instructions || '',
        is_default: data.is_default || false
      };
    } catch (err) {
      toast.error('Failed to load recipient');
      goto('/dashboard/recipients');
    } finally {
      pageLoading = false;
    }
  });

  function validate(): boolean {
    errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.address_line1.trim()) errors.address_line1 = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.destination) errors.destination = 'Please select a destination';
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    loading = true;
    try {
      const response = await fetch(`/api/recipients/${recipientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update recipient');
      }

      toast.success('Recipient updated successfully');
      goto('/dashboard/recipients');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update recipient');
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/recipients/${recipientId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Recipient deleted');
      goto('/dashboard/recipients');
    } catch (err) {
      toast.error('Failed to delete recipient');
    } finally {
      showDeleteConfirm = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Recipient | QCS Cargo</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <!-- Back link -->
  <a href="/dashboard/recipients" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
    <ArrowLeft class="w-4 h-4 mr-1" />
    Back to Recipients
  </a>

  {#if pageLoading}
    <Card>
      <CardContent class="p-8 flex items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <User class="w-5 h-5" />
              Edit Recipient
            </CardTitle>
            <CardDescription>Update recipient details</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-red-600 hover:text-red-700 hover:bg-red-50"
            on:click={() => showDeleteConfirm = true}
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-900 flex items-center gap-2">
              <User class="w-4 h-4" />
              Personal Information
            </h3>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="name">Full Name *</Label>
                <Input
                  id="name"
                  bind:value={form.name}
                  placeholder="John Doe"
                  class={errors.name ? 'border-red-500' : ''}
                />
                {#if errors.name}
                  <p class="text-sm text-red-500">{errors.name}</p>
                {/if}
              </div>

              <div class="space-y-2">
                <Label for="phone">Phone Number *</Label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    bind:value={form.phone}
                    placeholder="+1 (555) 123-4567"
                    class="pl-10 {errors.phone ? 'border-red-500' : ''}"
                  />
                </div>
                {#if errors.phone}
                  <p class="text-sm text-red-500">{errors.phone}</p>
                {/if}
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="space-y-4 pt-4 border-t">
            <h3 class="font-medium text-gray-900 flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              Delivery Address
            </h3>

            <div class="space-y-2">
              <Label for="destination">Destination Country *</Label>
              <div class="relative">
                <Globe class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="destination"
                  bind:value={form.destination}
                  class="w-full h-10 pl-10 pr-4 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 {errors.destination ? 'border-red-500' : ''}"
                >
                  <option value="">Select destination</option>
                  {#each DESTINATIONS as dest}
                    <option value={dest.id}>{dest.flag} {dest.name}</option>
                  {/each}
                </select>
              </div>
              {#if errors.destination}
                <p class="text-sm text-red-500">{errors.destination}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="address_line1">Street Address *</Label>
              <Input
                id="address_line1"
                bind:value={form.address_line1}
                placeholder="123 Main Street"
                class={errors.address_line1 ? 'border-red-500' : ''}
              />
              {#if errors.address_line1}
                <p class="text-sm text-red-500">{errors.address_line1}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="address_line2">Apartment, Suite, etc. (optional)</Label>
              <Input id="address_line2" bind:value={form.address_line2} placeholder="Apt 4B" />
            </div>

            <div class="space-y-2">
              <Label for="city">City *</Label>
              <Input
                id="city"
                bind:value={form.city}
                placeholder="Georgetown"
                class={errors.city ? 'border-red-500' : ''}
              />
              {#if errors.city}
                <p class="text-sm text-red-500">{errors.city}</p>
              {/if}
            </div>
          </div>

          <!-- Additional Info -->
          <div class="space-y-4 pt-4 border-t">
            <h3 class="font-medium text-gray-900">Additional Information</h3>

            <div class="space-y-2">
              <Label for="instructions">Delivery Instructions (optional)</Label>
              <textarea
                id="instructions"
                bind:value={form.delivery_instructions}
                rows={3}
                placeholder="Gate code, landmarks, or special instructions..."
                class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>

            <div class="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
              <input
                type="checkbox"
                id="is_default"
                bind:checked={form.is_default}
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div class="flex-1">
                <Label for="is_default" class="font-medium cursor-pointer">
                  <Star class="w-4 h-4 inline mr-1 text-primary-600" />
                  Set as default recipient
                </Label>
                <p class="text-sm text-gray-600">This address will be pre-selected in new bookings</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4">
            <Button variant="outline" href="/dashboard/recipients" class="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} class="flex-1">
              {#if loading}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Saving...
              {:else}
                Save Changes
              {/if}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteConfirm}
  title="Delete Recipient?"
  description="Are you sure you want to delete {form.name}? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  on:confirm={handleDelete}
  on:cancel={() => showDeleteConfirm = false}
/>
