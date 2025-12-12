<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-svelte';
  import { z } from 'zod';

  let email = '';
  let loading = false;
  let sent = false;
  let error = '';

  const emailSchema = z.string().email('Please enter a valid email address');

  async function handleSubmit() {
    error = '';

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      error = result.error.errors[0].message;
      return;
    }

    loading = true;

    try {
      await auth.requestMagicLink(email);
      sent = true;
      toast.success('Magic link sent!', { description: 'Check your email for the login link.' });
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to send magic link';
    } finally {
      loading = false;
    }
  }

  function reset() {
    sent = false;
    email = '';
    error = '';
  }
</script>

<svelte:head>
  <title>Magic Link Login | QCS Cargo</title>
  <meta name="description" content="Sign in to QCS Cargo without a password using a magic link sent to your email." />
</svelte:head>

<Card>
  <CardHeader class="text-center">
    <CardTitle class="text-2xl">Magic Link Login</CardTitle>
    <CardDescription>Sign in without a password</CardDescription>
  </CardHeader>

  <CardContent>
    {#if sent}
      <div class="text-center py-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
        <p class="text-gray-600 mb-6">
          We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
        </p>
        <div class="space-y-3">
          <p class="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button variant="outline" on:click={reset}>
            Try a different email
          </Button>
        </div>
      </div>
    {:else}
      {#if error}
        <Alert variant="destructive" class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      {/if}

      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
          <Mail class="w-6 h-6 text-primary-600" />
        </div>
        <p class="text-sm text-gray-600">
          Enter your email and we'll send you a link to sign in instantly—no password needed.
        </p>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            disabled={loading}
            autocomplete="email"
          />
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Sending magic link...
          {:else}
            Send magic link
          {/if}
        </Button>
      </form>
    {/if}
  </CardContent>

  <CardFooter class="flex flex-col gap-4">
    <div class="relative w-full">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-card px-2 text-muted-foreground">Or</span>
      </div>
    </div>
    
    <div class="flex flex-col gap-2 w-full text-center text-sm">
      <a href="/auth/login" class="text-primary-600 hover:underline inline-flex items-center justify-center gap-1">
        <ArrowLeft class="w-4 h-4" />
        Sign in with password
      </a>
      <p class="text-muted-foreground">
        Don't have an account?{' '}
        <a href="/auth/register" class="text-primary-600 hover:underline font-medium">
          Sign up
        </a>
      </p>
    </div>
  </CardFooter>
</Card>

