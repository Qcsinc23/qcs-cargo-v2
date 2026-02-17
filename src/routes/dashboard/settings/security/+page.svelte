<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { toast } from '$lib/stores/toast';
  import {
    Lock,
    Key,
    Shield,
    AlertTriangle,
    Check,
    Loader2,
    Eye,
    EyeOff
  } from 'lucide-svelte';

  // Password change form
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let showPasswords = false;
  let changingPassword = false;
  let passwordErrors: Record<string, string> = {};

  // Two-factor authentication
  let twoFactorEnabled = false;
  let enablingTwoFactor = false;

  function validatePasswordChange(): boolean {
    passwordErrors = {};
    
    if (!currentPassword) {
      passwordErrors.current = 'Current password is required';
    }
    
    if (!newPassword) {
      passwordErrors.new = 'New password is required';
    } else if (newPassword.length < 8) {
      passwordErrors.new = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.new = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      passwordErrors.new = 'Password must contain a number';
    }
    
    if (!confirmPassword) {
      passwordErrors.confirm = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      passwordErrors.confirm = 'Passwords do not match';
    }
    
    return Object.keys(passwordErrors).length === 0;
  }

  async function handlePasswordChange() {
    if (!validatePasswordChange()) return;
    
    changingPassword = true;
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password updated successfully');
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      changingPassword = false;
    }
  }

  async function toggleTwoFactor() {
    enablingTwoFactor = true;
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      
      twoFactorEnabled = !twoFactorEnabled;
      toast.success(twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
    } catch (err) {
      toast.error('Failed to update two-factor authentication');
    } finally {
      enablingTwoFactor = false;
    }
  }

  // Password strength indicator
  $: passwordStrength = calculatePasswordStrength(newPassword);

  function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
  }
</script>

<svelte:head>
  <title>Security Settings | QCS Cargo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Security Settings</h1>
    <p class="text-gray-600 mt-1">Manage your password and security preferences</p>
  </div>

  <!-- Change Password -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Lock class="w-5 h-5" />
        Change Password
      </CardTitle>
      <CardDescription>
        Update your password to keep your account secure
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
        <div class="space-y-2">
          <Label for="currentPassword">Current Password</Label>
          <div class="relative">
            <Input
              id="currentPassword"
              type={showPasswords ? 'text' : 'password'}
              bind:value={currentPassword}
              placeholder="Enter your current password"
              class={passwordErrors.current ? 'border-red-500' : ''}
            />
          </div>
          {#if passwordErrors.current}
            <p class="text-sm text-red-500">{passwordErrors.current}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="newPassword">New Password</Label>
          <div class="relative">
            <Input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              bind:value={newPassword}
              placeholder="Enter your new password"
              class={passwordErrors.new ? 'border-red-500' : ''}
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              on:click={() => showPasswords = !showPasswords}
            >
              {#if showPasswords}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
          {#if passwordErrors.new}
            <p class="text-sm text-red-500">{passwordErrors.new}</p>
          {/if}
          
          <!-- Password strength indicator -->
          {#if newPassword}
            <div class="space-y-1">
              <div class="flex gap-1">
                {#each [1, 2, 3] as level}
                  <div class="h-1 flex-1 rounded {level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}"></div>
                {/each}
              </div>
              <p class="text-xs text-gray-500">Password strength: {passwordStrength.label}</p>
            </div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type={showPasswords ? 'text' : 'password'}
            bind:value={confirmPassword}
            placeholder="Confirm your new password"
            class={passwordErrors.confirm ? 'border-red-500' : ''}
          />
          {#if passwordErrors.confirm}
            <p class="text-sm text-red-500">{passwordErrors.confirm}</p>
          {/if}
        </div>

        <Button type="submit" disabled={changingPassword}>
          {#if changingPassword}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            Updating...
          {:else}
            <Key class="w-4 h-4 mr-2" />
            Update Password
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>

  <!-- Two-Factor Authentication -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Shield class="w-5 h-5" />
        Two-Factor Authentication
      </CardTitle>
      <CardDescription>
        Add an extra layer of security to your account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900">
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p class="text-sm text-gray-600">
            {twoFactorEnabled 
              ? 'Your account is protected with two-factor authentication' 
              : 'Enable two-factor authentication for enhanced security'}
          </p>
        </div>
        <Button 
          variant={twoFactorEnabled ? 'outline' : 'default'}
          on:click={toggleTwoFactor}
          disabled={enablingTwoFactor}
        >
          {#if enablingTwoFactor}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          {:else if twoFactorEnabled}
            Disable
          {:else}
            Enable
          {/if}
        </Button>
      </div>

      {#if twoFactorEnabled}
        <Alert class="mt-4 bg-green-50 border-green-200">
          <Check class="w-4 h-4 text-green-600" />
          <AlertDescription class="text-green-800">
            Two-factor authentication is active. You'll need to enter a verification code when signing in from a new device.
          </AlertDescription>
        </Alert>
      {/if}
    </CardContent>
  </Card>

  <!-- Active Sessions Link -->
  <Card>
    <CardContent class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium text-gray-900">Active Sessions</h3>
          <p class="text-sm text-gray-600">View and manage your logged-in devices</p>
        </div>
        <Button variant="outline" href="/dashboard/settings/sessions">
          Manage Sessions
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Security Tips -->
  <Card class="bg-blue-50 border-blue-200">
    <CardContent class="p-4">
      <h3 class="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <Shield class="w-4 h-4" />
        Security Tips
      </h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Use a unique password that you don't use elsewhere</li>
        <li>• Enable two-factor authentication for extra protection</li>
        <li>• Review your active sessions regularly</li>
        <li>• Log out from devices you don't recognize</li>
      </ul>
    </CardContent>
  </Card>
</div>
