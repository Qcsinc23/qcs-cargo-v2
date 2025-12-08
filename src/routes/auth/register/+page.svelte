<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Separator } from '$lib/components/ui/separator';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { registerSchema, validateForm } from '$lib/utils/validation';
  import { Mail, Lock, User, Phone, Loader2, AlertCircle, Check, X } from 'lucide-svelte';

  let name = '';
  let email = '';
  let phone = '';
  let password = '';
  let confirmPassword = '';
  let acceptTerms = false;
  let loading = false;
  let errors: Record<string, string> = {};
  let serverError = '';

  // Password strength indicators
  $: passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };
  $: passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  async function handleSubmit() {
    serverError = '';
    errors = {};

    // Validate form
    const validation = validateForm(registerSchema, {
      name,
      email,
      phone: phone || undefined,
      password,
      confirmPassword,
      acceptTerms
    });

    if (!validation.success) {
      errors = validation.errors;
      return;
    }

    loading = true;

    try {
      await auth.register({
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
        phone: phone || undefined
      });

      toast.success('Account created!', {
        description: 'Please check your email to verify your account.'
      });
      goto('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      serverError = error.message || 'Registration failed. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function handleGoogleSignup() {
    loading = true;
    try {
      await auth.loginWithGoogle();
      toast.success('Account created!', { description: 'Welcome to QCS Cargo.' });
      goto('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      serverError = error.message || 'Google signup failed. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create Account | QCS Cargo</title>
  <meta name="description" content="Create your QCS Cargo account to start shipping to the Caribbean." />
</svelte:head>

<Card>
  <CardHeader class="text-center">
    <CardTitle class="text-2xl">Create an account</CardTitle>
    <CardDescription>Start shipping to the Caribbean today</CardDescription>
  </CardHeader>

  <CardContent>
    {#if serverError}
      <Alert variant="destructive" class="mb-4">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{serverError}</AlertDescription>
      </Alert>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Full Name</Label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            bind:value={name}
            class="pl-10"
            disabled={loading}
            aria-invalid={!!errors.name}
          />
        </div>
        {#if errors.name}
          <p class="text-sm text-destructive">{errors.name}</p>
        {/if}
      </div>

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

      <div class="space-y-2">
        <Label for="phone">Phone (Optional)</Label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (201) 555-0123"
            bind:value={phone}
            class="pl-10"
            disabled={loading}
          />
        </div>
        {#if errors.phone}
          <p class="text-sm text-destructive">{errors.phone}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="password">Password</Label>
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
        <Label for="confirmPassword">Confirm Password</Label>
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

      <div class="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          bind:checked={acceptTerms}
          class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <Label for="terms" class="text-sm font-normal leading-relaxed">
          I agree to the{' '}
          <a href="/terms" class="text-primary-600 hover:underline" target="_blank">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" class="text-primary-600 hover:underline" target="_blank">Privacy Policy</a>
        </Label>
      </div>
      {#if errors.acceptTerms}
        <p class="text-sm text-destructive">{errors.acceptTerms}</p>
      {/if}

      <Button type="submit" class="w-full" disabled={loading}>
        {#if loading}
          <Loader2 class="h-4 w-4 mr-2 animate-spin" />
          Creating account...
        {:else}
          Create account
        {/if}
      </Button>
    </form>

    <div class="relative my-6">
      <Separator />
      <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
        or continue with
      </span>
    </div>

    <Button variant="outline" class="w-full" on:click={handleGoogleSignup} disabled={loading}>
      <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </Button>
  </CardContent>

  <CardFooter class="flex justify-center">
    <p class="text-sm text-muted-foreground">
      Already have an account?{' '}
      <a href="/auth/login" class="text-primary-600 hover:underline font-medium">
        Sign in
      </a>
    </p>
  </CardFooter>
</Card>

