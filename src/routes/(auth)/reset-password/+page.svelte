<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { toast } from '$lib/stores/toast';
  import { KeyRound, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-svelte';

  $: token = $page.url.searchParams.get('token') || '';

  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let showConfirm = false;
  let isLoading = false;
  let errors: Record<string, string> = {};
  let success = false;

  function validate(): boolean {
    errors = {};
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new link.');
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, passwordConfirm: confirmPassword })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to reset password');
      }

      success = true;
      toast.success('Password reset successfully!');

      setTimeout(() => goto('/login'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password | QCS Cargo</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-blue-100 rounded-full">
          <KeyRound class="w-5 h-5 text-blue-600" />
        </div>
        <CardTitle>Reset Password</CardTitle>
      </div>
      <p class="text-sm text-muted-foreground">
        Enter your new password below.
      </p>
    </CardHeader>

    <CardContent>
      {#if !token}
        <Alert class="bg-red-50 border-red-200">
          <AlertTriangle class="w-4 h-4 text-red-600" />
          <AlertDescription class="text-red-700">
            Invalid or missing reset token. Please
            <a href="/forgot-password" class="underline font-medium">request a new link</a>.
          </AlertDescription>
        </Alert>
      {:else if success}
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center">
            <div class="p-4 bg-green-100 rounded-full">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 class="font-semibold text-gray-900">Password Reset!</h3>
          <p class="text-sm text-gray-600">Your password has been reset successfully. Redirecting you to sign in...</p>
          <Button href="/login" class="w-full">Sign In</Button>
        </div>
      {:else}
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="password">New Password</Label>
            <div class="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                placeholder="At least 8 characters"
                disabled={isLoading}
                class={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                on:click={() => showPassword = !showPassword}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="w-4 h-4" />
                {:else}
                  <Eye class="w-4 h-4" />
                {/if}
              </button>
            </div>
            {#if errors.password}
              <p class="text-sm text-red-500">{errors.password}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="confirm">Confirm New Password</Label>
            <div class="relative">
              <Input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                bind:value={confirmPassword}
                placeholder="Re-enter your password"
                disabled={isLoading}
                class={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                on:click={() => showConfirm = !showConfirm}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {#if showConfirm}
                  <EyeOff class="w-4 h-4" />
                {:else}
                  <Eye class="w-4 h-4" />
                {/if}
              </button>
            </div>
            {#if errors.confirmPassword}
              <p class="text-sm text-red-500">{errors.confirmPassword}</p>
            {/if}
          </div>

          <!-- Password strength hint -->
          <div class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p class="font-medium mb-1">Password must:</p>
            <ul class="space-y-0.5">
              <li class={password.length >= 8 ? 'text-green-600' : ''}>✓ Be at least 8 characters</li>
            </ul>
          </div>

          <Button type="submit" class="w-full" disabled={isLoading}>
            {#if isLoading}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Resetting...
            {:else}
              Reset Password
            {/if}
          </Button>

          <div class="text-center">
            <a href="/login" class="text-sm text-primary-700 underline underline-offset-2">
              Back to Sign In
            </a>
          </div>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>
