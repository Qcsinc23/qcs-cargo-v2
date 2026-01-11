<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { toast } from '$lib/stores/toast';
  import { PUBLIC_COMPANY_NAME } from '$env/static/public';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let isLoading = false;
  let errors = {
    name: '',
    email: ''
  };

  $: redirectTo = $page.url.searchParams.get('redirectTo') || '';

  function validateForm() {
    errors = { name: '', email: '' };

    if (!name.trim()) {
      errors.name = 'Please enter your name';
      return false;
    }

    if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      return false;
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address';
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name: name.trim(), redirectTo })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message) {
          errors.email = error.message;
        }
        toast.error(error.message || 'Failed to send magic link');
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
      toast.error(error.message || 'Something went wrong. Please try again.');
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
  <title>Sign Up | {PUBLIC_COMPANY_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Create Account</CardTitle>
      <p class="text-sm text-muted-foreground mt-2">
        Join {PUBLIC_COMPANY_NAME} and start shipping to the Caribbean
      </p>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            bind:value={name}
            on:keydown={handleKeyPress}
            disabled={isLoading}
            class={errors.name ? 'border-red-500' : ''}
            aria-invalid={!!errors.name}
            aria-errormessage={errors.name}
          />
          {#if errors.name}
            <p class="text-sm text-red-500 mt-1">{errors.name}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            on:keydown={handleKeyPress}
            disabled={isLoading}
            class={errors.email ? 'border-red-500' : ''}
            aria-invalid={!!errors.email}
            aria-errormessage={errors.email}
          />
          {#if errors.email}
            <p class="text-sm text-red-500 mt-1">{errors.email}</p>
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
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 0 0 0 0 0 0-7 4 0 0 0 0 0 0 0 0-7 4"></path>
              </svg>
              Creating Account...
            </span>
          {:else}
            Create Account
          {/if}
        </Button>
      </form>

      <div class="text-center text-sm text-muted-foreground mt-6">
        <p>Already have an account? <a href="/login" class="text-primary-600 hover:underline">Sign in</a></p>
      </div>

      <p class="text-xs text-muted-foreground text-center mt-4">
        By creating an account, you agree to our 
        <a href="/legal/terms" class="text-primary-600 hover:underline">Terms of Service</a> and 
        <a href="/legal/privacy" class="text-primary-600 hover:underline">Privacy Policy</a>
      </p>
    </CardContent>
  </Card>
</div>
