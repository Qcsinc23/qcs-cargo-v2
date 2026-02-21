<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import {
    Mail, Phone, MessageSquare, Send, Search, Filter,
    Users, Loader2, Plus, ChevronDown, Clock
  } from 'lucide-svelte';

  type Tab = 'send' | 'history';
  let activeTab: Tab = 'send';

  let sendLoading = false;
  let historyLoading = true;
  let history: any[] = [];

  let compose = {
    type: 'email' as 'email' | 'sms' | 'note',
    subject: '',
    content: '',
    recipients: 'all' as 'all' | 'active_customers' | 'specific',
    specificEmails: ''
  };

  const RECIPIENT_OPTIONS = [
    { value: 'all', label: 'All customers' },
    { value: 'active_customers', label: 'Active customers (last 90 days)' },
    { value: 'specific', label: 'Specific email addresses' }
  ];

  onMount(async () => {
    try {
      const res = await fetch('/api/communications?admin=true&limit=50');
      if (res.ok) {
        const data = await res.json();
        history = data.items || data || [];
      }
    } catch (err) {
      console.error(err);
    } finally {
      historyLoading = false;
    }
  });

  async function sendMessage() {
    if (!compose.content.trim()) { toast.error('Message content is required'); return; }
    if (compose.type === 'email' && !compose.subject.trim()) { toast.error('Email subject is required'); return; }

    sendLoading = true;
    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compose)
      });
      if (!response.ok) throw new Error('Failed to send');
      const result = await response.json();
      toast.success(`Message sent to ${result.recipientCount || 0} recipient(s)`);
      compose = { type: 'email', subject: '', content: '', recipients: 'all', specificEmails: '' };
      activeTab = 'history';
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      sendLoading = false;
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>Communications | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Communications</h1>
    <p class="text-slate-500">Send messages to customers and view communication history</p>
  </div>

  <!-- Tabs -->
  <div class="border-b flex gap-0">
    {#each ([['send', 'Send Message'], ['history', 'History']] as const) as [tab, label]}
      <button
        on:click={() => activeTab = tab}
        class="px-6 py-3 text-sm font-medium border-b-2 transition-colors
               {activeTab === tab
                 ? 'border-primary-600 text-primary-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {label}
      </button>
    {/each}
  </div>

  {#if activeTab === 'send'}
    <div class="max-w-2xl">
      <Card>
        <CardContent class="p-6 space-y-5">
          <!-- Type -->
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Message Type</p>
            <div class="flex gap-2">
              {#each ([
                { val: 'email', label: 'Email', icon: Mail },
                { val: 'sms', label: 'SMS', icon: Phone },
                { val: 'note', label: 'Internal Note', icon: MessageSquare }
              ] as const) as opt}
                <button
                  type="button"
                  on:click={() => compose.type = opt.val as any}
                  class="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                         {compose.type === opt.val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 hover:border-primary-400'}"
                >
                  <svelte:component this={opt.icon} class="w-4 h-4" />
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Recipients -->
          <div>
            <label for="compose-recipients" class="text-sm font-medium text-gray-700 block mb-2">Recipients</label>
            <select
              id="compose-recipients"
              bind:value={compose.recipients}
              class="w-full h-10 px-3 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {#each RECIPIENT_OPTIONS as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>

          {#if compose.recipients === 'specific'}
            <div>
              <label for="compose-specific-emails" class="text-sm font-medium text-gray-700 block mb-2">Email Addresses</label>
              <textarea
                id="compose-specific-emails"
                bind:value={compose.specificEmails}
                rows={3}
                placeholder="Enter emails separated by commas or new lines..."
                class="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>
          {/if}

          {#if compose.type === 'email'}
            <div>
              <label for="compose-subject" class="text-sm font-medium text-gray-700 block mb-2">Subject *</label>
              <Input id="compose-subject" bind:value={compose.subject} placeholder="Email subject..." />
            </div>
          {/if}

          <div>
            <label for="compose-content" class="text-sm font-medium text-gray-700 block mb-2">
              {compose.type === 'note' ? 'Note' : 'Message'} *
            </label>
            <textarea
              id="compose-content"
              bind:value={compose.content}
              rows={6}
              placeholder="Write your message..."
              class="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <Button on:click={sendMessage} disabled={sendLoading} class="px-6">
              {#if sendLoading}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Sending...
              {:else}
                <Send class="w-4 h-4 mr-2" />
                Send {compose.type === 'note' ? 'Note' : 'Message'}
              {/if}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  {:else}
    {#if historyLoading}
      <div class="flex items-center justify-center h-32">
        <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
      </div>
    {:else if history.length === 0}
      <Card>
        <CardContent class="p-8 text-center">
          <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No communications sent yet</p>
        </CardContent>
      </Card>
    {:else}
      <div class="space-y-3">
        {#each history as item}
          <Card>
            <CardContent class="p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium
                      {item.type === 'email' ? 'bg-blue-100 text-blue-700' : item.type === 'sms' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                      {item.type}
                    </span>
                    {#if item.subject}
                      <span class="font-medium text-gray-900">{item.subject}</span>
                    {/if}
                  </div>
                  <p class="text-sm text-gray-700 line-clamp-2">{item.content}</p>
                  <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    {formatDate(item.sent_at)}
                    {#if item.sent_by_name}· By {item.sent_by_name}{/if}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  {/if}
</div>
