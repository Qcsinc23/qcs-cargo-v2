<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Mail, Phone, MessageSquare, FileText, Search, Plus, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { cn } from '$lib/utils';

  export let userId: string;
  export let isAdmin = false;

  interface Communication {
    id: string;
    type: 'email' | 'sms' | 'phone' | 'note';
    subject?: string;
    content: string;
    direction: 'inbound' | 'outbound' | 'internal';
    sent_at?: string;
    opened_at?: string;
    created: string;
    expand?: {
      sent_by?: { name: string; email: string };
    };
  }

  let communications: Communication[] = [];
  let loading = true;
  let searchQuery = '';
  let typeFilter = 'all';
  let directionFilter = 'all';
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;
  const perPage = 20;

  // Add communication dialog
  let addDialogOpen = false;
  let newComm = {
    type: 'note' as Communication['type'],
    subject: '',
    content: '',
    direction: 'internal' as Communication['direction']
  };

  async function loadCommunications() {
    loading = true;
    try {
      const params = new URLSearchParams({
        userId,
        page: currentPage.toString(),
        limit: perPage.toString()
      });

      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (directionFilter !== 'all') params.append('direction', directionFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/communications?${params}`);
      const result = await response.json();

      if (result.status === 'success') {
        communications = result.data.items;
        totalItems = result.data.totalItems;
        totalPages = result.data.totalPages;
      }
    } catch (error) {
      console.error('Failed to load communications:', error);
      toast.error('Failed to load communication history');
    } finally {
      loading = false;
    }
  }

  async function createCommunication() {
    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...newComm
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Communication logged');
        addDialogOpen = false;
        newComm = {
          type: 'note',
          subject: '',
          content: '',
          direction: 'internal'
        };
        await loadCommunications();
      } else {
        toast.error(result.message || 'Failed to log communication');
      }
    } catch (error) {
      console.error('Failed to create communication:', error);
      toast.error('Failed to log communication');
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'phone': return Phone;
      case 'note': return FileText;
      default: return FileText;
    }
  }

  function getDirectionIcon(direction: string) {
    switch (direction) {
      case 'inbound': return ArrowDownLeft;
      case 'outbound': return ArrowUpRight;
      case 'internal': return Minus;
      default: return Minus;
    }
  }

  function getDirectionColor(direction: string) {
    switch (direction) {
      case 'inbound': return 'text-green-600';
      case 'outbound': return 'text-blue-600';
      case 'internal': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  onMount(() => {
    loadCommunications();
  });
</script>

<svelte:head>
  <title>Communication History | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Communication History</h1>
      <p class="text-sm text-gray-500 mt-1">
        All customer interactions and internal notes
      </p>
    </div>
    {#if isAdmin}
      <Button size="sm" on:click={() => addDialogOpen = true}>
        <Plus class="w-4 h-4 mr-2" />
        Log Communication
      </Button>
    {/if}
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search messages..."
          bind:value={searchQuery}
          on:input={() => { currentPage = 1; loadCommunications(); }}
          class="pl-10"
        />
      </div>
      <select
        bind:value={typeFilter}
        on:change={() => { currentPage = 1; loadCommunications(); }}
        class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="all">All Types</option>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
        <option value="phone">Phone</option>
        <option value="note">Notes</option>
      </select>
      <select
        bind:value={directionFilter}
        on:change={() => { currentPage = 1; loadCommunications(); }}
        class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="all">All Directions</option>
        <option value="inbound">Inbound</option>
        <option value="outbound">Outbound</option>
        <option value="internal">Internal</option>
      </select>
    </div>
  </Card>

  <!-- Communications List -->
  <Card>
    {#if loading}
      <div class="p-12 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Loading...</p>
      </div>
    {:else if communications.length === 0}
      <div class="p-12 text-center">
        <FileText class="w-12 h-12 mx-auto text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No communications found</h3>
        <p class="mt-2 text-gray-500">
          {searchQuery ? 'Try adjusting your search' : 'No communication history yet'}
        </p>
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each communications as comm (comm.id)}
          <div class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svelte:component this={getTypeIcon(comm.type)} class="w-5 h-5 text-gray-600" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900 capitalize">{comm.type}</span>
                  <svelte:component 
                    this={getDirectionIcon(comm.direction)} 
                    class={cn('w-4 h-4', getDirectionColor(comm.direction))} 
                  />
                  <span class={cn('text-sm capitalize', getDirectionColor(comm.direction))}>
                    {comm.direction}
                  </span>
                </div>

                {#if comm.subject}
                  <p class="font-medium text-gray-900 mb-1">{comm.subject}</p>
                {/if}

                <p class="text-sm text-gray-600 line-clamp-2">{comm.content}</p>

                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{new Date(comm.created).toLocaleString()}</span>
                  {#if comm.expand?.sent_by}
                    <span>• By {comm.expand.sent_by.name}</span>
                  {/if}
                  {#if comm.opened_at}
                    <span>• Opened {new Date(comm.opened_at).toLocaleDateString()}</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="p-4 border-t bg-gray-50 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems}
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              on:click={() => { currentPage--; loadCommunications(); }}
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <span class="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              on:click={() => { currentPage++; loadCommunications(); }}
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </Card>
</div>

<!-- Add Communication Dialog -->
{#if isAdmin}
  <Dialog.Root bind:open={addDialogOpen}>
    <Dialog.Content class="sm:max-w-[500px]">
      <Dialog.Header>
        <Dialog.Title>Log Communication</Dialog.Title>
        <Dialog.Description>
          Record a customer interaction or internal note
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="type">Type</Label>
          <select
            id="type"
            bind:value={newComm.type}
            class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone Call</option>
            <option value="note">Internal Note</option>
          </select>
        </div>
        <div class="grid gap-2">
          <Label for="direction">Direction</Label>
          <select
            id="direction"
            bind:value={newComm.direction}
            class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="inbound">Inbound (Customer to Us)</option>
            <option value="outbound">Outbound (Us to Customer)</option>
            <option value="internal">Internal Note</option>
          </select>
        </div>
        {#if newComm.type === 'email'}
          <div class="grid gap-2">
            <Label for="subject">Subject</Label>
            <Input
              id="subject"
              bind:value={newComm.subject}
              placeholder="Email subject"
            />
          </div>
        {/if}
        <div class="grid gap-2">
          <Label for="content">Content</Label>
          <Textarea
            id="content"
            bind:value={newComm.content}
            placeholder="Communication details..."
            rows={4}
          />
        </div>
      </div>
      <Dialog.Footer>
        <Button variant="outline" on:click={() => addDialogOpen = false}>Cancel</Button>
        <Button on:click={createCommunication} disabled={!newComm.content}>
          Log Communication
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{/if}


