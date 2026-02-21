<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import {
    Mail, Phone, MessageSquare, StickyNote, Send, Clock,
    ArrowLeft, Loader2, Plus, ChevronDown
  } from 'lucide-svelte';

  $: userId = $page.params.id;

  interface Comm {
    id: string;
    type: 'email' | 'sms' | 'phone' | 'note';
    direction: 'inbound' | 'outbound';
    subject?: string;
    content: string;
    sent_by_name?: string;
    sent_at: string;
  }

  let comms: Comm[] = [];
  let user: { name: string; email: string } | null = null;
  let loading = true;
  let sending = false;
  let showCompose = false;

  let compose = {
    type: 'email' as 'email' | 'sms' | 'phone' | 'note',
    subject: '',
    content: ''
  };

  const TYPE_ICONS = { email: Mail, sms: Phone, phone: Phone, note: StickyNote };
  const TYPE_LABELS = { email: 'Email', sms: 'SMS', phone: 'Phone Call', note: 'Internal Note' };
  const TYPE_COLORS = {
    email: 'bg-blue-100 text-blue-600',
    sms: 'bg-green-100 text-green-600',
    phone: 'bg-yellow-100 text-yellow-700',
    note: 'bg-gray-100 text-gray-600'
  };

  onMount(async () => {
    try {
      const [userRes, commsRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`),
        fetch(`/api/communications?user=${userId}`)
      ]);
      if (userRes.ok) user = await userRes.json();
      if (commsRes.ok) {
        const data = await commsRes.json();
        comms = data.items || data || [];
      }
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      loading = false;
    }
  });

  async function sendMessage() {
    if (!compose.content.trim()) {
      toast.error('Message content is required');
      return;
    }
    sending = true;
    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...compose, userId, direction: 'outbound' })
      });
      if (!response.ok) throw new Error('Failed to send');
      const newComm = await response.json();
      comms = [newComm, ...comms];
      compose = { type: 'email', subject: '', content: '' };
      showCompose = false;
      toast.success(`${TYPE_LABELS[compose.type] || 'Message'} sent successfully`);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      sending = false;
    }
  }

  function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Communications | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <Button variant="ghost" size="sm" href="/admin/users/{userId}">
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to User
    </Button>
  </div>

  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">
        Communications {user ? `— ${user.name}` : ''}
      </h1>
      <p class="text-slate-500">{user?.email || ''}</p>
    </div>
    <Button on:click={() => showCompose = !showCompose}>
      <Plus class="w-4 h-4 mr-2" />
      Add Communication
    </Button>
  </div>

  <!-- Compose panel -->
  {#if showCompose}
    <Card>
      <CardContent class="p-4 space-y-4">
        <h3 class="font-semibold text-slate-900">New Communication</h3>

        <!-- Type selector -->
        <div class="flex gap-2 flex-wrap">
          {#each Object.entries(TYPE_LABELS) as [val, label]}
            <button
              type="button"
              on:click={() => compose.type = val as any}
              class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                     {compose.type === val
                       ? 'bg-primary-600 text-white border-primary-600'
                       : 'bg-white text-gray-600 hover:border-primary-400'}"
            >
              {label}
            </button>
          {/each}
        </div>

        {#if compose.type === 'email'}
          <Input bind:value={compose.subject} placeholder="Subject..." />
        {/if}

        <textarea
          bind:value={compose.content}
          rows={4}
          placeholder={compose.type === 'note' ? 'Internal note...' : 'Message content...'}
          class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        ></textarea>

        <div class="flex gap-3 justify-end">
          <Button variant="outline" on:click={() => showCompose = false}>Cancel</Button>
          <Button on:click={sendMessage} disabled={sending}>
            {#if sending}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            {:else}
              <Send class="w-4 h-4 mr-2" />
            {/if}
            {compose.type === 'note' ? 'Save Note' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Timeline -->
  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else if comms.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No communications yet</h3>
        <p class="text-gray-500 mt-1">All emails, calls, and notes with this customer will appear here.</p>
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each comms as comm}
        {@const Icon = TYPE_ICONS[comm.type] || Mail}
        <Card>
          <CardContent class="p-4">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full {TYPE_COLORS[comm.type] || 'bg-gray-100 text-gray-600'}">
                <Icon class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span class="text-xs font-medium uppercase text-gray-500">{TYPE_LABELS[comm.type]}</span>
                    {#if comm.direction === 'inbound'}
                      <span class="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">Inbound</span>
                    {/if}
                  </div>
                  <span class="text-xs text-gray-400 whitespace-nowrap">{formatDate(comm.sent_at)}</span>
                </div>
                {#if comm.subject}
                  <p class="font-medium text-gray-900 mt-1">{comm.subject}</p>
                {/if}
                <p class="text-sm text-gray-700 mt-1 whitespace-pre-line">{comm.content}</p>
                {#if comm.sent_by_name}
                  <p class="text-xs text-gray-400 mt-2">By {comm.sent_by_name}</p>
                {/if}
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>
