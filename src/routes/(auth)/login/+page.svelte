<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { toast } from '$lib/stores/toast';
  import { PUBLIC_COMPANY_NAME } from '$env/static/public';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let email = '';
  let isLoading = false;
  let emailError = '';

  $: redirectTo = $page.url.searchParams.get('redirectTo') || '';

  async function handleSubmit() {
    if (!email) {
      emailError = 'Please enter your email address';
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      emailError = 'Please enter a valid email address';
      return;
    }

    isLoading = true;
    emailError = '';

    try {
      const response = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, redirectTo })
      });

      if (!response.ok) {
        const error = await response.json();
        emailError = error.message || 'Failed to send magic link';
        toast.error(emailError);
        return;
      }

      const data = await response.json();
      toast.success(data.message || 'Magic link sent to your email!');
      
      // Redirect to verify page with redirectTo param
      let verifyUrl = `/verify?email=${encodeURIComponent(email)}`;
      if (redirectTo) {
        verifyUrl += `&redirectTo=${encodeURIComponent(redirectTo)}`;
      }
      goto(verifyUrl);
    } catch (error: any) {
      emailError = error.message || 'Something went wrong. Please try again.';
      toast.error(emailError);
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>Sign In | {PUBLIC_COMPANY_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Sign In</CardTitle>
      <p class="text-sm text-muted-foreground mt-2">
        Enter your email to receive a magic link for passwordless sign-in
      </p>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            on:keydown={handleKeyPress}
            disabled={isLoading}
            class={emailError ? 'border-red-500' : ''}
            aria-invalid={!!emailError}
            aria-errormessage={emailError}
          />
          {#if emailError}
            <p class="text-sm text-red-500 mt-1">{emailError}</p>
          {/if}
        </div>

        <Button
          type="submit"
          class="w-full"
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 0 0 0 0 0 0-7 4 0 0 0 0 0 0 0-7 4 0 0 0 0 0 0 0 0 0-7 4"></path>
              </svg>
              Sending...
            </span>
          {:else}
            Send Magic Link
          {/if}
        </Button>
      </form>

      <div class="text-center text-sm text-muted-foreground mt-6">
        <p>
          Don't have an account?
          <a href="/register" class="text-primary-700 underline underline-offset-2 hover:text-primary-800">
            Sign up
          </a>
        </p>
        <p class="mt-2">
          <a href="/forgot-password" class="text-primary-700 underline underline-offset-2 hover:text-primary-800">
            Forgot your password?
          </a>
        </p>
      </div>
    </CardContent>
  </Card>
</div>
