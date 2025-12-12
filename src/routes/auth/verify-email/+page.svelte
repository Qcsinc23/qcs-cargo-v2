<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import {
    Mail,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    ArrowRight
  } from 'lucide-svelte';

  let status: 'loading' | 'success' | 'error' | 'resending' = 'loading';
  let errorMessage = '';
  let email = '';

  // Get token from URL
  $: token = $page.url.searchParams.get('token');

  onMount(async () => {
    if (token) {
      await verifyEmail();
    } else {
      status = 'error';
      errorMessage = 'No verification token provided. Please use the link from your email.';
    }
  });

  async function verifyEmail() {
    status = 'loading';
    
    try {
      // API call would go here
      // await auth.verifyEmail(token);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      status = 'success';
      toast.success('Email verified successfully!');
    } catch (err: unknown) {
      status = 'error';
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      } else {
        errorMessage = 'Failed to verify email. The link may have expired.';
      }
    }
  }

  async function resendVerification() {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    status = 'resending';
    
    try {
      // API call would go here
      // await auth.resendVerificationEmail(email);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Verification email sent!', {
        description: 'Check your inbox for a new verification link.'
      });
      status = 'error'; // Keep showing the form
    } catch (err) {
      toast.error('Failed to send verification email');
      status = 'error';
    }
  }
</script>

<svelte:head>
  <title>Verify Email | QCS Cargo</title>
</svelte:head>

<Card class="w-full max-w-md mx-auto">
  <CardHeader class="text-center">
    {#if status === 'loading'}
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>
      <CardTitle class="text-2xl">Verifying your email...</CardTitle>
      <CardDescription>Please wait while we verify your email address</CardDescription>
      
    {:else if status === 'success'}
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>
      <CardTitle class="text-2xl text-green-700">Email Verified!</CardTitle>
      <CardDescription>Your email has been successfully verified</CardDescription>
      
    {:else if status === 'resending'}
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>
      <CardTitle class="text-2xl">Sending verification...</CardTitle>
      <CardDescription>Please wait</CardDescription>
      
    {:else}
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <XCircle class="w-8 h-8 text-red-600" />
      </div>
      <CardTitle class="text-2xl text-red-700">Verification Failed</CardTitle>
      <CardDescription>We couldn't verify your email address</CardDescription>
    {/if}
  </CardHeader>

  <CardContent>
    {#if status === 'success'}
      <div class="space-y-4">
        <Alert class="bg-green-50 border-green-200">
          <CheckCircle class="w-4 h-4 text-green-600" />
          <AlertDescription class="text-green-800">
            You can now access all features of your QCS Cargo account.
          </AlertDescription>
        </Alert>

        <div class="flex flex-col gap-3">
          <Button href="/dashboard" class="w-full">
            Go to Dashboard
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" href="/auth/login" class="w-full">
            Sign In
          </Button>
        </div>
      </div>

    {:else if status === 'error'}
      <div class="space-y-4">
        <Alert variant="destructive">
          <XCircle class="w-4 h-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div class="border-t pt-4">
          <p class="text-sm text-gray-600 mb-4">
            Need a new verification link? Enter your email below:
          </p>
          
          <div class="space-y-3">
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                bind:value={email}
                placeholder="you@example.com"
                class="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <Button variant="outline" class="w-full" on:click={resendVerification}>
              <RefreshCw class="w-4 h-4 mr-2" />
              Resend Verification Email
            </Button>
          </div>
        </div>

        <div class="border-t pt-4 text-center">
          <a href="/auth/login" class="text-sm text-primary-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    {/if}
  </CardContent>
</Card>

