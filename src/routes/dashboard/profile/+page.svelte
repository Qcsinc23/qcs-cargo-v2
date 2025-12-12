<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { toast } from '$lib/stores/toast';
  import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Loader2,
    Check,
    Edit,
    Save,
    X
  } from 'lucide-svelte';

  export let data;

  $: user = data.user;

  // Form state
  let editing = false;
  let saving = false;
  let form = {
    name: user?.name || '',
    phone: user?.phone || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || ''
  };

  // Avatar upload
  let avatarFile: File | null = null;
  let avatarPreview: string | null = null;
  let uploadingAvatar = false;

  function startEditing() {
    form = {
      name: user?.name || '',
      phone: user?.phone || '',
      address_line1: user?.address_line1 || '',
      address_line2: user?.address_line2 || '',
      city: user?.city || '',
      state: user?.state || '',
      zip: user?.zip || ''
    };
    editing = true;
  }

  function cancelEditing() {
    editing = false;
    form = {
      name: user?.name || '',
      phone: user?.phone || '',
      address_line1: user?.address_line1 || '',
      address_line2: user?.address_line2 || '',
      city: user?.city || '',
      state: user?.state || '',
      zip: user?.zip || ''
    };
  }

  async function saveProfile() {
    saving = true;
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Profile updated successfully');
      editing = false;
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      saving = false;
    }
  }

  function handleAvatarSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      avatarFile = file;
      avatarPreview = URL.createObjectURL(file);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    
    uploadingAvatar = true;
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Avatar updated successfully');
      avatarFile = null;
      avatarPreview = null;
    } catch (err) {
      toast.error('Failed to upload avatar');
    } finally {
      uploadingAvatar = false;
    }
  }

  function cancelAvatarUpload() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    avatarFile = null;
    avatarPreview = null;
  }

  // Get initials for avatar placeholder
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<svelte:head>
  <title>My Profile | QCS Cargo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
      <p class="text-gray-600 mt-1">Manage your personal information</p>
    </div>
    {#if !editing}
      <Button variant="outline" on:click={startEditing}>
        <Edit class="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
    {/if}
  </div>

  <!-- Avatar Section -->
  <Card>
    <CardContent class="p-6">
      <div class="flex items-center gap-6">
        <!-- Avatar -->
        <div class="relative">
          {#if avatarPreview || user?.avatar}
            <img
              src={avatarPreview || user?.avatar}
              alt={user?.name || 'Profile'}
              class="w-24 h-24 rounded-full object-cover"
            />
          {:else}
            <div class="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-2xl font-bold text-primary-600">
                {getInitials(user?.name || 'U')}
              </span>
            </div>
          {/if}
          
          <label class="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
            <Camera class="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              class="hidden"
              on:change={handleAvatarSelect}
            />
          </label>
        </div>

        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
          <p class="text-gray-600">{user?.email}</p>
          <p class="text-sm text-gray-500 mt-1">
            Member since {user?.created ? new Date(user.created).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
          </p>
        </div>
      </div>

      {#if avatarFile}
        <div class="mt-4 flex items-center gap-3">
          <Button size="sm" on:click={uploadAvatar} disabled={uploadingAvatar}>
            {#if uploadingAvatar}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            {:else}
              <Check class="w-4 h-4 mr-2" />
            {/if}
            Save Avatar
          </Button>
          <Button variant="outline" size="sm" on:click={cancelAvatarUpload}>
            Cancel
          </Button>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Profile Information -->
  <Card>
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
      <CardDescription>Your basic profile information</CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={saveProfile} class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Full Name</Label>
            {#if editing}
              <Input
                id="name"
                bind:value={form.name}
                placeholder="Your full name"
              />
            {:else}
              <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                {user?.name || '—'}
              </p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="email">Email Address</Label>
            <p class="py-2 px-3 bg-gray-100 rounded-md text-gray-600 flex items-center gap-2">
              <Mail class="w-4 h-4" />
              {user?.email || '—'}
            </p>
            <p class="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div class="space-y-2">
            <Label for="phone">Phone Number</Label>
            {#if editing}
              <Input
                id="phone"
                bind:value={form.phone}
                placeholder="+1 (555) 123-4567"
              />
            {:else}
              <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
                <Phone class="w-4 h-4 text-gray-400" />
                {user?.phone || '—'}
              </p>
            {/if}
          </div>
        </div>

        <!-- Address Section -->
        <div class="pt-4 border-t space-y-4">
          <h3 class="font-medium text-gray-900 flex items-center gap-2">
            <MapPin class="w-4 h-4" />
            Address (Optional)
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="address1">Street Address</Label>
              {#if editing}
                <Input
                  id="address1"
                  bind:value={form.address_line1}
                  placeholder="123 Main Street"
                />
              {:else}
                <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                  {user?.address_line1 || '—'}
                </p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="address2">Apt, Suite, etc.</Label>
              {#if editing}
                <Input
                  id="address2"
                  bind:value={form.address_line2}
                  placeholder="Apartment 4B"
                />
              {:else}
                <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                  {user?.address_line2 || '—'}
                </p>
              {/if}
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="space-y-2">
                <Label for="city">City</Label>
                {#if editing}
                  <Input
                    id="city"
                    bind:value={form.city}
                    placeholder="New York"
                  />
                {:else}
                  <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                    {user?.city || '—'}
                  </p>
                {/if}
              </div>

              <div class="space-y-2">
                <Label for="state">State</Label>
                {#if editing}
                  <Input
                    id="state"
                    bind:value={form.state}
                    placeholder="NJ"
                  />
                {:else}
                  <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                    {user?.state || '—'}
                  </p>
                {/if}
              </div>

              <div class="space-y-2">
                <Label for="zip">ZIP Code</Label>
                {#if editing}
                  <Input
                    id="zip"
                    bind:value={form.zip}
                    placeholder="07032"
                  />
                {:else}
                  <p class="py-2 px-3 bg-gray-50 rounded-md text-gray-900">
                    {user?.zip || '—'}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        </div>

        {#if editing}
          <div class="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              {#if saving}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Saving...
              {:else}
                <Save class="w-4 h-4 mr-2" />
                Save Changes
              {/if}
            </Button>
            <Button variant="outline" type="button" on:click={cancelEditing}>
              <X class="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        {/if}
      </form>
    </CardContent>
  </Card>

  <!-- Quick Links -->
  <div class="grid sm:grid-cols-2 gap-4">
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-4">
        <a href="/dashboard/settings/security" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <User class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Security Settings</h3>
            <p class="text-sm text-gray-500">Password & 2FA</p>
          </div>
        </a>
      </CardContent>
    </Card>

    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-4">
        <a href="/dashboard/settings/notifications" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Mail class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Notifications</h3>
            <p class="text-sm text-gray-500">Email & SMS preferences</p>
          </div>
        </a>
      </CardContent>
    </Card>
  </div>
</div>

