<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { AlertTriangle, Loader2, Download, FileText } from 'lucide-svelte';

  let confirmText = '';
  let password = '';
  let deleting = false;
  let showConfirm = false;
  let error = '';

  const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

  $: canDelete = confirmText === CONFIRM_PHRASE && password.length >= 8;

  function initiateDelete() {
    if (!canDelete) return;
    showConfirm = true;
  }

  function cancelDelete() {
    showConfirm = false;
  }

  async function confirmDelete() {
    deleting = true;
    error = '';

    try {
      await auth.deleteAccount(password);
      toast.success('Account scheduled for deletion', { 
        description: 'You have 30 days to recover your account by logging back in.' 
      });
      goto('/');
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to delete account';
      showConfirm = false;
    } finally {
      deleting = false;
    }
  }
</script>

<svelte:head>
  <title>Delete Account | QCS Cargo</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Delete Your Account</h1>
    <p class="text-gray-600 mt-1">Permanently remove your account and all associated data</p>
  </div>

  <!-- Warning Card -->
  <Card class="border-red-200 bg-red-50">
    <CardHeader>
      <div class="flex items-start gap-4">
        <div class="p-3 bg-red-100 rounded-full">
          <AlertTriangle class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <CardTitle class="text-red-900">This action is permanent</CardTitle>
          <CardDescription class="text-red-700">
            Please read carefully before proceeding
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="p-4 bg-white rounded-lg border border-red-200">
          <h3 class="font-medium text-gray-900 mb-2">What happens when you delete your account:</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start gap-2">
              <span class="text-red-500">•</span>
              Your account will be <strong>deactivated immediately</strong>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500">•</span>
              You have <strong>30 days</strong> to recover your account by logging in
            </li>
            <li class="flex items-start gap-2">
              <span class="text-red-500">•</span>
              After 30 days, all personal data will be <strong>permanently deleted</strong>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-gray-500">•</span>
              Shipment history will be anonymized for business records
            </li>
            <li class="flex items-start gap-2">
              <span class="text-gray-500">•</span>
              Your mailbox suite code will be released
            </li>
          </ul>
        </div>

        <div class="p-4 bg-white rounded-lg border border-amber-200">
          <h3 class="font-medium text-gray-900 mb-2">Before you go:</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-center gap-2">
              <Download class="w-4 h-4 text-gray-400" />
              Download any invoices you need from your 
              <a href="/dashboard/invoices" class="text-primary-600 hover:underline">invoice history</a>
            </li>
            <li class="flex items-center gap-2">
              <FileText class="w-4 h-4 text-gray-400" />
              Ensure all active shipments are delivered
            </li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Deletion Form -->
  {#if !showConfirm}
    <Card>
      <CardHeader>
        <CardTitle>Confirm Account Deletion</CardTitle>
        <CardDescription>Complete both fields to proceed with deletion</CardDescription>
      </CardHeader>
      <CardContent>
        {#if error}
          <Alert variant="destructive" class="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        {/if}

        <form on:submit|preventDefault={initiateDelete} class="space-y-6">
          <div class="space-y-2">
            <Label for="confirm">
              Type <strong class="text-red-600">{CONFIRM_PHRASE}</strong> to confirm:
            </Label>
            <Input
              id="confirm"
              bind:value={confirmText}
              placeholder={CONFIRM_PHRASE}
              class="font-mono"
              autocomplete="off"
            />
            {#if confirmText && confirmText !== CONFIRM_PHRASE}
              <p class="text-sm text-red-600">Please type the exact phrase above</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="password">Enter your password:</Label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Your current password"
              autocomplete="current-password"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <Button variant="outline" href="/dashboard/settings" class="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="destructive" 
              disabled={!canDelete}
              class="flex-1"
            >
              Delete My Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  {:else}
    <!-- Final Confirmation -->
    <Card class="border-red-300">
      <CardHeader class="bg-red-50">
        <CardTitle class="text-red-900">Final Confirmation</CardTitle>
        <CardDescription class="text-red-700">
          Are you absolutely sure? This will immediately deactivate your account.
        </CardDescription>
      </CardHeader>
      <CardContent class="pt-6">
        <div class="flex gap-3">
          <Button variant="outline" on:click={cancelDelete} class="flex-1" disabled={deleting}>
            No, Keep My Account
          </Button>
          <Button 
            variant="destructive" 
            on:click={confirmDelete}
            disabled={deleting}
            class="flex-1"
          >
            {#if deleting}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            {:else}
              Yes, Delete Account
            {/if}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Help Text -->
  <div class="text-center text-sm text-gray-500">
    <p>
      Having issues? 
      <a href="/contact" class="text-primary-600 hover:underline">Contact our support team</a>
      — we're here to help.
    </p>
  </div>
</div>

