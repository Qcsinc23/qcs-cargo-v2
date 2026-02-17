<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { toast } from '$lib/stores/toast';
  import { ArrowLeft, Loader2, User, MapPin, Phone, Globe, Star } from 'lucide-svelte';

  let loading = false;
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

  function validate(): boolean {
    errors = {};
    
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!form.address_line1.trim()) {
      errors.address_line1 = 'Address is required';
    }
    if (!form.city.trim()) {
      errors.city = 'City is required';
    }
    if (!form.destination) {
      errors.destination = 'Please select a destination';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    loading = true;

    try {
      // API call would go here
      // const response = await fetch('/api/recipients', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Recipient added successfully');
      goto('/dashboard/recipients');
    } catch (err) {
      toast.error('Failed to add recipient');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Add Recipient | QCS Cargo</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <!-- Back link -->
  <a
    href="/dashboard/recipients"
    class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
  >
    <ArrowLeft class="w-4 h-4 mr-1" />
    Back to Recipients
  </a>

  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <User class="w-5 h-5" />
        Add New Recipient
      </CardTitle>
      <CardDescription>
        Save recipient details for faster booking in the future
      </CardDescription>
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
            <Input
              id="address_line2"
              bind:value={form.address_line2}
              placeholder="Apt 4B"
            />
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

        <!-- Delivery Instructions -->
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
          <Button variant="outline" href="/dashboard/recipients" class="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} class="flex-1">
            {#if loading}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Saving...
            {:else}
              Save Recipient
            {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
