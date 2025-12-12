<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth, user } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { Bell, Mail, Smartphone, Package, Truck, CheckCircle2, Loader2 } from 'lucide-svelte';

  let saving = false;
  
  // Initialize from user store
  let notificationEmail = $user?.notification_email ?? true;
  let notificationSms = $user?.notification_sms ?? false;
  let notifyReceived = $user?.notify_received ?? true;
  let notifyTransit = $user?.notify_transit ?? true;
  let notifyDelivered = $user?.notify_delivered ?? true;

  // Track if changes were made
  $: hasChanges = $user && (
    notificationEmail !== $user.notification_email ||
    notificationSms !== $user.notification_sms ||
    notifyReceived !== $user.notify_received ||
    notifyTransit !== $user.notify_transit ||
    notifyDelivered !== $user.notify_delivered
  );

  async function savePreferences() {
    saving = true;
    
    try {
      await auth.updateNotificationPreferences({
        notification_email: notificationEmail,
        notification_sms: notificationSms,
        notify_received: notifyReceived,
        notify_transit: notifyTransit,
        notify_delivered: notifyDelivered
      });
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Notification Settings | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Notification Preferences</h1>
    <p class="text-gray-600 mt-1">Choose how you want to be notified about your shipments</p>
  </div>

  <!-- Notification Channels -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Bell class="w-5 h-5" />
        Notification Channels
      </CardTitle>
      <CardDescription>Choose how you want to receive notifications</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Mail class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <Label class="text-base font-medium">Email Notifications</Label>
            <p class="text-sm text-gray-500">Receive updates via email</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={notificationEmail}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <Smartphone class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <Label class="text-base font-medium">SMS Notifications</Label>
            <p class="text-sm text-gray-500">Receive text messages for important updates</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={notificationSms}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {#if notificationSms && !$user?.phone}
        <Alert>
          <AlertDescription>
            To receive SMS notifications, please add a phone number in your 
            <a href="/dashboard/settings" class="text-primary-600 hover:underline">profile settings</a>.
          </AlertDescription>
        </Alert>
      {/if}
    </CardContent>
  </Card>

  <!-- Shipment Updates -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Package class="w-5 h-5" />
        Shipment Updates
      </CardTitle>
      <CardDescription>Choose which shipment events you want to be notified about</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-100 rounded-lg">
            <Package class="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <Label class="text-base font-medium">Package Received</Label>
            <p class="text-sm text-gray-500">When we receive your package at the warehouse</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={notifyReceived}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-cyan-100 rounded-lg">
            <Truck class="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <Label class="text-base font-medium">In Transit</Label>
            <p class="text-sm text-gray-500">When your shipment departs and during transit</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={notifyTransit}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <Label class="text-base font-medium">Delivered</Label>
            <p class="text-sm text-gray-500">When your shipment is delivered to the recipient</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={notifyDelivered}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </CardContent>
  </Card>

  <!-- Save Button -->
  <div class="flex justify-end">
    <Button on:click={savePreferences} disabled={saving || !hasChanges}>
      {#if saving}
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Saving...
      {:else}
        Save Preferences
      {/if}
    </Button>
  </div>
</div>

