<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { resetPasswordSchema, validateForm } from '$lib/utils/validation';
  import { Lock, Loader2, AlertCircle, Check, X, ArrowLeft } from 'lucide-svelte';

  let password = '';
  let confirmPassword = '';
  let loading = false;
  let errors: Record<string, string> = {};
  let serverError = '';

  // Get token from URL
  $: token = $page.url.searchParams.get('token') || '';

  // Password strength indicators
  $: passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };

  async function handleSubmit() {
    serverError = '';
    errors = {};

    if (!token) {
      serverError = 'Invalid or missing reset token. Please request a new reset link.';
      return;
    }

    // Validate form
    const validation = validateForm(resetPasswordSchema, { token, password, confirmPassword });
    if (!validation.success) {
      errors = validation.errors;
      return;
    }

    loading = true;

    try {
      await auth.confirmPasswordReset(token, password, confirmPassword);
      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password.'
      });
      goto('/auth/login?message=Password reset successful. Please log in.');
    } catch (err: unknown) {
      const error = err as Error;
      serverError = error.message || 'Failed to reset password. The link may have expired.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password | QCS Cargo</title>
  <meta name="description" content="Set a new password for your QCS Cargo account." />
</svelte:head>

<Card>
  <CardHeader class="text-center">
    <CardTitle class="text-2xl">Reset your password</CardTitle>
    <CardDescription>Enter your new password below</CardDescription>
  </CardHeader>

  <CardContent>
    {#if !token}
      <Alert variant="destructive" class="mb-4">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Invalid reset link. Please request a new password reset.
        </AlertDescription>
      </Alert>
      <Button variant="outline" class="w-full" href="/auth/forgot-password">
        Request new reset link
      </Button>
    {:else}
      {#if serverError}
        <Alert variant="destructive" class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="password">New Password</Label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              bind:value={password}
              class="pl-10"
              disabled={loading}
              aria-invalid={!!errors.password}
            />
          </div>
          {#if password}
            <div class="space-y-1 text-xs">
              <div class="flex items-center gap-1 {passwordChecks.length ? 'text-success-600' : 'text-muted-foreground'}">
                {#if passwordChecks.length}<Check class="h-3 w-3" />{:else}<X class="h-3 w-3" />{/if}
                At least 8 characters
              </div>
              <div class="flex items-center gap-1 {passwordChecks.uppercase ? 'text-success-600' : 'text-muted-foreground'}">
                {#if passwordChecks.uppercase}<Check class="h-3 w-3" />{:else}<X class="h-3 w-3" />{/if}
                One uppercase letter
              </div>
              <div class="flex items-center gap-1 {passwordChecks.lowercase ? 'text-success-600' : 'text-muted-foreground'}">
                {#if passwordChecks.lowercase}<Check class="h-3 w-3" />{:else}<X class="h-3 w-3" />{/if}
                One lowercase letter
              </div>
              <div class="flex items-center gap-1 {passwordChecks.number ? 'text-success-600' : 'text-muted-foreground'}">
                {#if passwordChecks.number}<Check class="h-3 w-3" />{:else}<X class="h-3 w-3" />{/if}
                One number
              </div>
            </div>
          {/if}
          {#if errors.password}
            <p class="text-sm text-destructive">{errors.password}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="confirmPassword">Confirm New Password</Label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              bind:value={confirmPassword}
              class="pl-10"
              disabled={loading}
              aria-invalid={!!errors.confirmPassword}
            />
          </div>
          {#if errors.confirmPassword}
            <p class="text-sm text-destructive">{errors.confirmPassword}</p>
          {/if}
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Resetting...
          {:else}
            Reset password
          {/if}
        </Button>
      </form>
    {/if}
  </CardContent>

  <CardFooter class="flex justify-center">
    <a href="/auth/login" class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft class="h-4 w-4 mr-1" />
      Back to login
    </a>
  </CardFooter>
</Card>

