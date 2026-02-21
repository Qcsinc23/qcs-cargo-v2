<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { toast } from '$lib/stores/toast';
  import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-svelte';

  let email = '';
  let isLoading = false;
  let emailError = '';
  let submitted = false;

  async function handleSubmit() {
    emailError = '';

    if (!email.trim()) {
      emailError = 'Please enter your email address';
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      emailError = 'Please enter a valid email address';
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'password_reset' })
      });

      // Always show success to prevent email enumeration
      submitted = true;
    } catch (err) {
      // Still show success to prevent email enumeration
      submitted = true;
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password | QCS Cargo</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-blue-100 rounded-full">
          <Mail class="w-5 h-5 text-blue-600" />
        </div>
        <CardTitle>Forgot Password</CardTitle>
      </div>
      <p class="text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </CardHeader>

    <CardContent>
      {#if submitted}
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center">
            <div class="p-4 bg-green-100 rounded-full">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 class="font-semibold text-gray-900">Check your email</h3>
          <p class="text-sm text-gray-600">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
          </p>
          <p class="text-xs text-gray-500">The link expires in 1 hour.</p>
          <div class="pt-2">
            <Button variant="outline" href="/login" class="w-full">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </div>
      {:else}
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              bind:value={email}
              disabled={isLoading}
              class={emailError ? 'border-red-500' : ''}
              aria-invalid={!!emailError}
            />
            {#if emailError}
              <p class="text-sm text-red-500">{emailError}</p>
            {/if}
          </div>

          <Button type="submit" class="w-full" disabled={isLoading}>
            {#if isLoading}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Sending...
            {:else}
              Send Reset Link
            {/if}
          </Button>

          <div class="text-center">
            <a href="/login" class="text-sm text-primary-700 underline underline-offset-2 hover:text-primary-800 inline-flex items-center gap-1">
              <ArrowLeft class="w-3 h-3" />
              Back to Sign In
            </a>
          </div>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>
