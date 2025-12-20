<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { forgotPasswordSchema, validateForm } from '$lib/utils/validation';
  import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-svelte';

  let email = '';
  let loading = false;
  let errors: Record<string, string> = {};
  let serverError = '';
  let success = false;

  async function handleSubmit() {
    serverError = '';
    errors = {};

    // Validate form
    const validation = validateForm(forgotPasswordSchema, { email });
    if (!validation.success) {
      errors = validation.errors;
      return;
    }

    loading = true;

    try {
      await auth.requestPasswordReset(email);
      success = true;
    } catch (err: unknown) {
      const error = err as Error;
      // Don't reveal if email exists or not for security
      success = true; // Show success anyway
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password | QCS Cargo</title>
  <meta name="description" content="Reset your QCS Cargo account password." />
</svelte:head>

<Card>
  <CardHeader class="text-center">
    <CardTitle class="text-2xl">Forgot password?</CardTitle>
    <CardDescription>
      {#if success}
        Check your email for reset instructions
      {:else}
        Enter your email and we'll send you a reset link
      {/if}
    </CardDescription>
  </CardHeader>

  <CardContent>
    {#if success}
      <div class="text-center py-4">
        <div class="mx-auto w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mb-4">
          <CheckCircle class="h-6 w-6 text-success-600" />
        </div>
        <p class="text-muted-foreground mb-4">
          If an account exists for <strong>{email}</strong>, you will receive a password reset email shortly.
        </p>
        <p class="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            type="button"
            class="text-primary-600 hover:underline"
            on:click={() => (success = false)}
          >
            try again
          </button>
        </p>
      </div>
    {:else}
      {#if serverError}
        <Alert variant="destructive" class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              bind:value={email}
              class="pl-10"
              disabled={loading}
              aria-invalid={!!errors.email}
            />
          </div>
          {#if errors.email}
            <p class="text-sm text-destructive">{errors.email}</p>
          {/if}
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Sending...
          {:else}
            Send reset link
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

