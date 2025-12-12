<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Separator } from '$lib/components/ui/separator';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { loginSchema, validateForm } from '$lib/utils/validation';
  import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-svelte';

  let email = '';
  let password = '';
  let remember = false;
  let loading = false;
  let errors: Record<string, string> = {};
  let serverError = '';

  // Get redirect URL from query params
  $: redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';
  $: message = $page.url.searchParams.get('message');

  async function handleSubmit() {
    serverError = '';
    errors = {};

    // Validate form
    const validation = validateForm(loginSchema, { email, password, remember });
    if (!validation.success) {
      errors = validation.errors;
      return;
    }

    loading = true;

    try {
      await auth.login(email, password);

      // The server hook will automatically set the cookie in the response
      // No need to manually set it on the client side

      toast.success('Welcome back!', { description: 'You have been logged in successfully.' });

      // Use hard navigation to ensure server picks up the new auth cookie
      // This forces a full page reload which allows the server hook to read the updated cookie
      window.location.href = redirectTo;
    } catch (err: unknown) {
      serverError = getErrorMessage(err, 'Login failed. Please check your credentials.');
    } finally {
      loading = false;
    }
  }

  async function handleGoogleLogin() {
    loading = true;
    try {
      await auth.loginWithGoogle();

      // The server hook will automatically set the cookie in the response
      // No need to manually set it on the client side

      toast.success('Welcome!', { description: 'You have been logged in with Google.' });

      // Use hard navigation to ensure server picks up the new auth cookie
      window.location.href = redirectTo;
    } catch (err: unknown) {
      serverError = getErrorMessage(err, 'Google login failed. Please try again.');
    } finally {
      loading = false;
    }
  }

  // Helper function for error messages
  function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    if (typeof error === 'string') {
      return error;
    }
    return defaultMessage;
  }
</script>

<svelte:head>
  <title>Login | QCS Cargo</title>
  <meta name="description" content="Sign in to your QCS Cargo account to manage shipments and track packages." />
</svelte:head>

<Card>
  <CardHeader class="text-center">
    <CardTitle class="text-2xl">Welcome back</CardTitle>
    <CardDescription>Sign in to your account to continue</CardDescription>
  </CardHeader>

  <CardContent>
    {#if message}
      <Alert variant="default" class="mb-4">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    {/if}

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
            class="pl-10 transition-colors {errors.email ? 'border-red-500' : ''} {email && !errors.email ? 'border-green-500' : ''}"
            disabled={loading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {#if email && !errors.email}
            <CheckCircle class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-check-appear" />
          {/if}
        </div>
        {#if errors.email}
          <div class="flex items-center gap-2 mt-2 text-red-600 text-sm animate-fade-in">
            <AlertCircle class="h-4 w-4" />
            {errors.email}
          </div>
        {/if}
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <a href="/auth/forgot-password" class="text-sm text-primary-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            bind:value={password}
            class="pl-10 transition-colors {errors.password ? 'border-red-500' : ''} {password && !errors.password ? 'border-green-500' : ''}"
            disabled={loading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </div>
        {#if errors.password}
          <div class="flex items-center gap-2 mt-2 text-red-600 text-sm animate-fade-in">
            <AlertCircle class="h-4 w-4" />
            {errors.password}
          </div>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          bind:checked={remember}
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <Label for="remember" class="text-sm font-normal">Remember me for 30 days</Label>
      </div>

      <button 
        type="submit" 
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        disabled={loading}
      >
        {#if loading}
          <Loader2 class="h-4 w-4 mr-2 animate-spin" />
          Signing in...
        {:else}
          Sign in
        {/if}
      </button>
    </form>

    <div class="relative my-6">
      <Separator />
      <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
        or continue with
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <Button variant="outline" class="w-full" on:click={handleGoogleLogin} disabled={loading}>
        <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </Button>
      <a href="/auth/magic-link" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full {loading ? 'opacity-50 pointer-events-none' : ''}">
        <Mail class="h-4 w-4 mr-2" />
        Magic Link
      </a>
    </div>
  </CardContent>

  <CardFooter class="flex justify-center">
    <p class="text-sm text-muted-foreground">
      Don't have an account?{' '}
      <a href="/auth/register" class="text-primary-600 hover:underline font-medium">
        Sign up
      </a>
    </p>
  </CardFooter>
</Card>
