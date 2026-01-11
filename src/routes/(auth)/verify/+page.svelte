<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { toast } from '$lib/stores/toast';
  import { PUBLIC_COMPANY_NAME } from '$env/static/public';

  let email = '';
  let redirectTo = '';
  let isVerifying = false;
  let verificationStatus: 'pending' | 'success' | 'error' = 'pending';
  let errorMessage = '';

  onMount(() => {
    // Get email from query params
    email = $page.url.searchParams.get('email') || '';
    redirectTo = $page.url.searchParams.get('redirectTo') || '';
    
    // Check if there's a token in the URL (from magic link)
    const token = $page.url.searchParams.get('token');
    if (token) {
      verifyToken(token);
    }
  });

  async function verifyToken(token: string) {
    isVerifying = true;
    verificationStatus = 'pending';

    try {
      const response = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const error = await response.json();
        errorMessage = error.message || 'Invalid or expired magic link';
        verificationStatus = 'error';
        toast.error(errorMessage);
        return;
      }

      const data = await response.json();
      verificationStatus = 'success';
      toast.success('Successfully signed in!');
      
      // Redirect to dashboard or redirectTo after a brief delay
      setTimeout(() => {
        goto(redirectTo || '/dashboard');
      }, 1500);
    } catch (error: any) {
      errorMessage = error.message || 'Failed to verify magic link';
      verificationStatus = 'error';
      toast.error(errorMessage);
    } finally {
      isVerifying = false;
    }
  }

  async function resendMagicLink() {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

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
        toast.error(error.message || 'Failed to resend magic link');
        return;
      }

      toast.success('Magic link resent! Check your email.');
    } catch (error: any) {
      toast.error('Failed to resend magic link');
    }
  }
</script>

<svelte:head>
  <title>Verify Email | {PUBLIC_COMPANY_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>
        {#if verificationStatus === 'pending' && !isVerifying}
          Check Your Email
        {:else if verificationStatus === 'pending' && isVerifying}
          Verifying...
        {:else if verificationStatus === 'success'}
          Welcome Back!
        {:else}
          Verification Failed
        {/if}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {#if verificationStatus === 'pending' && !isVerifying}
        <div class="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <p class="text-sm text-muted-foreground">
            We've sent a magic link to<br>
            <strong class="text-foreground">{email}</strong>
          </p>
          
          <p class="text-sm text-muted-foreground">
            Click the link in your email to sign in. The link will expire in 10 minutes.
          </p>

          <div class="pt-4">
            <Button
              variant="outline"
              class="w-full"
              on:click={resendMagicLink}
            >
              Resend Magic Link
            </Button>
          </div>

          <div class="text-center text-sm text-muted-foreground">
            <a href="/login" class="text-primary-600 hover:underline">Back to sign in</a>
          </div>
        </div>

      {:else if verificationStatus === 'pending' && isVerifying}
        <div class="text-center space-y-4">
          <div class="mx-auto">
            <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-sm text-muted-foreground">
            Verifying your magic link...
          </p>
        </div>

      {:else if verificationStatus === 'success'}
        <div class="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <p class="text-sm text-muted-foreground">
            You've been successfully signed in!<br>
            Redirecting to your dashboard...
          </p>
        </div>

      {:else if verificationStatus === 'error'}
        <div class="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <p class="text-sm text-red-600">
            {errorMessage}
          </p>
          
          <p class="text-sm text-muted-foreground">
            The magic link may have expired or already been used.
          </p>

          <div class="space-y-2 pt-4">
            {#if email}
              <Button
                class="w-full"
                on:click={resendMagicLink}
              >
                Request New Magic Link
              </Button>
            {/if}
            
            <Button
              variant="outline"
              class="w-full"
              on:click={() => window.location.href = '/login'}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
