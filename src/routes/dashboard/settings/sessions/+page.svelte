<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { Monitor, Smartphone, Globe, Trash2, Shield, Loader2, AlertCircle } from 'lucide-svelte';

  interface Session {
    id: string;
    device_info: string;
    ip_address: string;
    last_active: string;
    created: string;
  }

  let sessions: Session[] = [];
  let currentSessionId: string | null = null;
  let loading = true;
  let revoking = false;
  let error = '';

  onMount(async () => {
    await loadSessions();
  });

  async function loadSessions() {
    loading = true;
    error = '';
    
    try {
      const result = await auth.getSessions();
      // Map the PocketBase records to our Session interface
      sessions = result.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        device_info: (r.device_info as string) || 'Unknown Device',
        ip_address: (r.ip_address as string) || 'Unknown',
        last_active: (r.last_active as string) || (r.updated as string) || new Date().toISOString(),
        created: (r.created as string) || new Date().toISOString()
      }));
      // In a real implementation, we'd identify the current session
    } catch (err) {
      error = 'Failed to load sessions';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function revokeSession(sessionId: string) {
    revoking = true;
    
    try {
      await auth.revokeSession(sessionId);
      sessions = sessions.filter(s => s.id !== sessionId);
      toast.success('Session revoked');
    } catch (err) {
      toast.error('Failed to revoke session');
    } finally {
      revoking = false;
    }
  }

  async function revokeAllOther() {
    revoking = true;
    
    try {
      await auth.revokeAllOtherSessions();
      sessions = sessions.filter(s => s.id === currentSessionId);
      toast.success('All other sessions revoked');
    } catch (err) {
      toast.error('Failed to revoke sessions');
    } finally {
      revoking = false;
    }
  }

  function getDeviceIcon(device: string) {
    if (device?.includes('Mobile') || device?.includes('iPhone') || device?.includes('Android')) {
      return Smartphone;
    }
    return Monitor;
  }

  function formatRelative(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Active Sessions | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Active Sessions</h1>
    <p class="text-gray-600 mt-1">Manage devices where you're logged in</p>
  </div>

  {#if error}
    <Alert variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  {/if}

  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Your Devices</CardTitle>
        <CardDescription>View and manage your active sessions</CardDescription>
      </div>
      {#if sessions.length > 1}
        <Button variant="outline" on:click={revokeAllOther} disabled={revoking}>
          <Shield class="w-4 h-4 mr-2" />
          Log Out All Other Devices
        </Button>
      {/if}
    </CardHeader>
    <CardContent>
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
        </div>
      {:else if sessions.length === 0}
        <div class="text-center py-12">
          <Monitor class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No active sessions found</p>
          <p class="text-sm text-gray-400 mt-1">Session tracking will be available soon</p>
        </div>
      {:else}
        <div class="divide-y">
          {#each sessions as session}
            {@const Icon = getDeviceIcon(session.device_info)}
            <div class="py-4 flex items-center gap-4">
              <div class="p-2 bg-gray-100 rounded-lg">
                <Icon class="w-5 h-5 text-gray-600" />
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-gray-900 truncate">
                    {session.device_info || 'Unknown Device'}
                  </p>
                  {#if session.id === currentSessionId}
                    <span class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      Current
                    </span>
                  {/if}
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <Globe class="w-3 h-3" />
                  <span>{session.ip_address || 'Unknown IP'}</span>
                  <span>•</span>
                  <span>Last active {formatRelative(session.last_active)}</span>
                </div>
              </div>

              {#if session.id !== currentSessionId}
                <Button
                  variant="ghost"
                  size="sm"
                  on:click={() => revokeSession(session.id)}
                  disabled={revoking}
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>

  <div class="text-sm text-gray-500">
    <p>
      <strong>Note:</strong> If you notice any suspicious activity, we recommend changing your password 
      and logging out of all other devices.
    </p>
  </div>
</div>

