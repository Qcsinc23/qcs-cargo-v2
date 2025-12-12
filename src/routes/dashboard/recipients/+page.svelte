<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { EmptyState, ConfirmDialog } from '$lib/components/shared';
  import { getDestinationLabel } from '$lib/config/destinations';
  import { toast } from '$lib/stores/toast';
  import {
    Plus,
    Search,
    MapPin,
    Phone,
    Star,
    MoreVertical,
    Pencil,
    Trash2,
    User
  } from 'lucide-svelte';

  export let data;

  interface Recipient {
    id: string;
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    destination: string;
    is_default: boolean;
    usage_count: number;
  }

  // Placeholder recipients (will come from PocketBase)
  let recipients: Recipient[] = [];
  let searchQuery = '';
  let deleteTarget: Recipient | null = null;
  let showDeleteConfirm = false;
  let menuOpenId: string | null = null;

  $: filteredRecipients = recipients.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleMenu(id: string) {
    menuOpenId = menuOpenId === id ? null : id;
  }

  async function setDefault(recipient: Recipient) {
    try {
      // API call would go here
      recipients = recipients.map(r => ({
        ...r,
        is_default: r.id === recipient.id
      }));
      toast.success(`${recipient.name} set as default recipient`);
    } catch (err) {
      toast.error('Failed to update default recipient');
    }
    menuOpenId = null;
  }

  function confirmDelete(recipient: Recipient) {
    deleteTarget = recipient;
    showDeleteConfirm = true;
    menuOpenId = null;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    
    try {
      // API call would go here
      recipients = recipients.filter(r => r.id !== deleteTarget!.id);
      toast.success('Recipient deleted');
    } catch (err) {
      toast.error('Failed to delete recipient');
    } finally {
      showDeleteConfirm = false;
      deleteTarget = null;
    }
  }
</script>

<svelte:head>
  <title>My Recipients | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Recipients</h1>
      <p class="text-gray-600 mt-1">Save recipient details for faster booking</p>
    </div>
    <Button href="/dashboard/recipients/new">
      <Plus class="w-4 h-4 mr-2" />
      Add Recipient
    </Button>
  </div>

  <!-- Search -->
  {#if recipients.length > 0}
    <div class="relative max-w-md">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        bind:value={searchQuery}
        placeholder="Search by name, city, or destination..."
        class="pl-10"
      />
    </div>
  {/if}

  <!-- Recipients Grid -->
  {#if recipients.length === 0}
    <Card>
      <CardContent class="p-8">
        <EmptyState
          title="No recipients saved"
          description="Save recipient information to speed up your future bookings."
          icon="users"
        >
          <Button href="/dashboard/recipients/new">
            <Plus class="w-4 h-4 mr-2" />
            Add First Recipient
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  {:else if filteredRecipients.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No matching recipients</h3>
        <p class="text-gray-500 mt-1">Try a different search term</p>
      </CardContent>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredRecipients as recipient}
        <Card class="relative overflow-visible {recipient.is_default ? 'ring-2 ring-primary-500' : ''}">
          {#if recipient.is_default}
            <div class="absolute -top-2 -right-2 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 z-10">
              <Star class="w-3 h-3" />
              Default
            </div>
          {/if}

          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{recipient.name}</h3>
                  <p class="text-sm text-primary-600">{getDestinationLabel(recipient.destination)}</p>
                </div>
              </div>

              <!-- Actions Menu -->
              <div class="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  on:click={() => toggleMenu(recipient.id)}
                >
                  <MoreVertical class="w-4 h-4" />
                </Button>

                {#if menuOpenId === recipient.id}
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    class="fixed inset-0 z-10"
                    role="button"
                    tabindex="-1"
                    on:click={() => menuOpenId = null}
                  />
                  <div class="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <a
                      href="/dashboard/recipients/{recipient.id}"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil class="w-4 h-4" />
                      Edit
                    </a>
                    {#if !recipient.is_default}
                      <button
                        class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        on:click={() => setDefault(recipient)}
                      >
                        <Star class="w-4 h-4" />
                        Set as Default
                      </button>
                    {/if}
                    <button
                      class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      on:click={() => confirmDelete(recipient)}
                    >
                      <Trash2 class="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-start gap-2">
                <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{recipient.address_line1}</p>
                  {#if recipient.address_line2}
                    <p>{recipient.address_line2}</p>
                  {/if}
                  <p>{recipient.city}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4" />
                <span>{recipient.phone}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-400">
              <span>Used {recipient.usage_count} time{recipient.usage_count !== 1 ? 's' : ''}</span>
              <a
                href="/dashboard/bookings/new?recipient={recipient.id}"
                class="text-primary-600 hover:underline font-medium"
              >
                Ship to this address →
              </a>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:open={showDeleteConfirm}
  title="Delete Recipient?"
  description="Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  on:confirm={handleDelete}
  on:cancel={() => { showDeleteConfirm = false; deleteTarget = null; }}
/>

