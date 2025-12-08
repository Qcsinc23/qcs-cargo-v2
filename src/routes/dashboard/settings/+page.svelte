<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { profileSchema, changePasswordSchema, validateForm } from '$lib/utils/validation';
  import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Shield,
    Bell,
    Trash2,
    Loader2,
    Camera,
    Check
  } from 'lucide-svelte';

  export let data;

  // Profile form state
  let profile = {
    name: data.user?.name || '',
    phone: data.user?.phone || '',
    address_line1: data.user?.address_line1 || '',
    address_line2: data.user?.address_line2 || '',
    city: data.user?.city || '',
    state: data.user?.state || '',
    zip: data.user?.zip || '',
    country: data.user?.country || ''
  };
  let profileLoading = false;
  let profileErrors: Record<string, string> = {};

  // Password form state
  let passwords = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  let passwordLoading = false;
  let passwordErrors: Record<string, string> = {};

  // Avatar upload
  let avatarInput: HTMLInputElement;
  let avatarLoading = false;

  async function updateProfile() {
    profileErrors = {};
    
    const validation = validateForm(profileSchema, profile);
    if (!validation.success) {
      profileErrors = validation.errors;
      return;
    }

    profileLoading = true;

    try {
      await auth.updateProfile(profile);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update profile');
    } finally {
      profileLoading = false;
    }
  }

  async function changePassword() {
    passwordErrors = {};
    
    const validation = validateForm(changePasswordSchema, passwords);
    if (!validation.success) {
      passwordErrors = validation.errors;
      return;
    }

    passwordLoading = true;

    try {
      await auth.changePassword(
        passwords.currentPassword,
        passwords.newPassword,
        passwords.confirmPassword
      );
      toast.success('Password changed successfully');
      passwords = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to change password');
    } finally {
      passwordLoading = false;
    }
  }

  async function handleAvatarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    avatarLoading = true;

    try {
      await auth.updateAvatar(file);
      toast.success('Avatar updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      avatarLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Settings | QCS Cargo</title>
</svelte:head>

<div class="max-w-3xl space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-muted-foreground">Manage your account settings and preferences</p>
  </div>

  <!-- Profile Section -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <User class="h-5 w-5" />
        Profile Information
      </CardTitle>
      <CardDescription>Update your personal information</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Avatar -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative">
          <div class="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {#if $auth.user?.avatar}
              <img src={$auth.user.avatar} alt="Avatar" class="h-full w-full object-cover" />
            {:else}
              <User class="h-8 w-8 text-primary-600" />
            {/if}
          </div>
          <button
            type="button"
            class="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
            on:click={() => avatarInput.click()}
            disabled={avatarLoading}
          >
            {#if avatarLoading}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              <Camera class="h-4 w-4" />
            {/if}
          </button>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            bind:this={avatarInput}
            on:change={handleAvatarChange}
          />
        </div>
        <div>
          <p class="font-medium">{data.user?.name}</p>
          <p class="text-sm text-muted-foreground">{data.user?.email}</p>
        </div>
      </div>

      <form on:submit|preventDefault={updateProfile} class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Full Name</Label>
            <Input
              id="name"
              bind:value={profile.name}
              disabled={profileLoading}
              aria-invalid={!!profileErrors.name}
            />
            {#if profileErrors.name}
              <p class="text-sm text-destructive">{profileErrors.name}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              bind:value={profile.phone}
              disabled={profileLoading}
            />
          </div>
        </div>

        <Separator />

        <div class="space-y-2">
          <Label for="address_line1">Address Line 1</Label>
          <Input
            id="address_line1"
            bind:value={profile.address_line1}
            placeholder="Street address"
            disabled={profileLoading}
          />
        </div>

        <div class="space-y-2">
          <Label for="address_line2">Address Line 2</Label>
          <Input
            id="address_line2"
            bind:value={profile.address_line2}
            placeholder="Apt, suite, unit (optional)"
            disabled={profileLoading}
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-2">
            <Label for="city">City</Label>
            <Input id="city" bind:value={profile.city} disabled={profileLoading} />
          </div>
          <div class="space-y-2">
            <Label for="state">State</Label>
            <Input id="state" bind:value={profile.state} disabled={profileLoading} />
          </div>
          <div class="space-y-2">
            <Label for="zip">ZIP Code</Label>
            <Input id="zip" bind:value={profile.zip} disabled={profileLoading} />
          </div>
        </div>

        <Button type="submit" disabled={profileLoading}>
          {#if profileLoading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Saving...
          {:else}
            <Check class="h-4 w-4 mr-2" />
            Save Changes
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>

  <!-- Password Section -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Lock class="h-5 w-5" />
        Change Password
      </CardTitle>
      <CardDescription>Update your account password</CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={changePassword} class="space-y-4">
        <div class="space-y-2">
          <Label for="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            bind:value={passwords.currentPassword}
            disabled={passwordLoading}
            aria-invalid={!!passwordErrors.currentPassword}
          />
          {#if passwordErrors.currentPassword}
            <p class="text-sm text-destructive">{passwordErrors.currentPassword}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            bind:value={passwords.newPassword}
            disabled={passwordLoading}
            aria-invalid={!!passwordErrors.newPassword}
          />
          {#if passwordErrors.newPassword}
            <p class="text-sm text-destructive">{passwordErrors.newPassword}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            bind:value={passwords.confirmPassword}
            disabled={passwordLoading}
            aria-invalid={!!passwordErrors.confirmPassword}
          />
          {#if passwordErrors.confirmPassword}
            <p class="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
          {/if}
        </div>

        <Button type="submit" disabled={passwordLoading}>
          {#if passwordLoading}
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Updating...
          {:else}
            Update Password
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>

  <!-- Quick Links -->
  <div class="grid gap-4 sm:grid-cols-2">
    <a href="/dashboard/settings/notifications">
      <Card class="h-full hover:border-primary-200 transition-colors cursor-pointer">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Bell class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p class="font-medium">Notification Preferences</p>
            <p class="text-sm text-muted-foreground">Manage email and SMS alerts</p>
          </div>
        </CardContent>
      </Card>
    </a>

    <a href="/dashboard/settings/sessions">
      <Card class="h-full hover:border-primary-200 transition-colors cursor-pointer">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Shield class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p class="font-medium">Active Sessions</p>
            <p class="text-sm text-muted-foreground">Manage logged-in devices</p>
          </div>
        </CardContent>
      </Card>
    </a>
  </div>

  <!-- Danger Zone -->
  <Card class="border-destructive/50">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-destructive">
        <Trash2 class="h-5 w-5" />
        Danger Zone
      </CardTitle>
      <CardDescription>Irreversible actions for your account</CardDescription>
    </CardHeader>
    <CardContent>
      <Alert variant="destructive">
        <AlertDescription>
          Deleting your account will remove all your data, including shipment history, saved recipients,
          and mailbox assignment. This action cannot be fully undone.
        </AlertDescription>
      </Alert>
      <a href="/dashboard/settings/delete-account" class="mt-4 inline-block">
        <Button variant="destructive">Delete Account</Button>
      </a>
    </CardContent>
  </Card>
</div>

