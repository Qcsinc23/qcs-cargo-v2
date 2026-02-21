<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import { ConfirmDialog, EmptyState } from '$lib/components/shared';
  import {
    Plus,
    Search,
    BookTemplate,
    Pencil,
    Trash2,
    MoreVertical,
    MapPin,
    Package,
    Copy,
    Loader2
  } from 'lucide-svelte';
  import { getDestinationLabel } from '$lib/config/destinations';

  interface Template {
    id: string;
    name: string;
    destination: string;
    service_type: string;
    recipient_name?: string;
    default_contents?: string;
    usage_count: number;
    last_used?: string;
  }

  let templates: Template[] = [];
  let loading = true;
  let searchQuery = '';
  let menuOpenId: string | null = null;
  let deleteTarget: Template | null = null;
  let showDeleteConfirm = false;

  $: filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SERVICE_LABELS: Record<string, string> = {
    standard: 'Standard Air Freight',
    express: 'Express Delivery',
    door_to_door: 'Door-to-Door',
    consolidated: 'Consolidated Cargo'
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        templates = data.items || data || [];
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      loading = false;
    }
  });

  function toggleMenu(id: string) {
    menuOpenId = menuOpenId === id ? null : id;
  }

  async function useTemplate(template: Template) {
    goto(`/dashboard/bookings/new?template=${template.id}`);
  }

  async function deleteTemplate() {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/templates/${deleteTarget.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      templates = templates.filter(t => t.id !== deleteTarget!.id);
      toast.success('Template deleted');
    } catch (err) {
      toast.error('Failed to delete template');
    } finally {
      showDeleteConfirm = false;
      deleteTarget = null;
    }
  }
</script>

<svelte:head>
  <title>Booking Templates | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Booking Templates</h1>
      <p class="text-gray-600 mt-1">Save common shipment configurations for faster booking</p>
    </div>
    <Button href="/dashboard/bookings/new">
      <Plus class="w-4 h-4 mr-2" />
      New Booking
    </Button>
  </div>

  <!-- Search -->
  {#if !loading && templates.length > 0}
    <div class="relative max-w-md">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        bind:value={searchQuery}
        placeholder="Search templates..."
        class="pl-10"
      />
    </div>
  {/if}

  <!-- Content -->
  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else if templates.length === 0}
    <Card>
      <CardContent class="p-8">
        <EmptyState
          title="No templates yet"
          description="Templates are saved automatically after you complete a booking. You can also create one from the booking wizard."
        >
          <Button href="/dashboard/bookings/new">
            <Plus class="w-4 h-4 mr-2" />
            Create First Booking
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  {:else if filteredTemplates.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No matching templates</h3>
        <p class="text-gray-500 mt-1">Try a different search term</p>
      </CardContent>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredTemplates as template}
        <Card class="relative hover:shadow-md transition-shadow">
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <BookTemplate class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{template.name}</h3>
                  <p class="text-sm text-primary-600">{getDestinationLabel(template.destination)}</p>
                </div>
              </div>

              <div class="relative">
                <Button variant="ghost" size="sm" on:click={() => toggleMenu(template.id)}>
                  <MoreVertical class="w-4 h-4" />
                </Button>
                {#if menuOpenId === template.id}
                  <button
                    type="button"
                    class="fixed inset-0 z-10"
                    aria-label="Close menu"
                    on:click={() => menuOpenId = null}
                  ></button>
                  <div class="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border z-20">
                    <button
                      class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      on:click={() => { useTemplate(template); menuOpenId = null; }}
                    >
                      <Copy class="w-4 h-4" />
                      Use Template
                    </button>
                    <button
                      class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      on:click={() => { deleteTarget = template; showDeleteConfirm = true; menuOpenId = null; }}
                    >
                      <Trash2 class="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Package class="w-4 h-4 text-gray-400" />
                <span>{SERVICE_LABELS[template.service_type] || template.service_type}</span>
              </div>
              {#if template.recipient_name}
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span>To: {template.recipient_name}</span>
                </div>
              {/if}
              {#if template.default_contents}
                <p class="text-xs text-gray-500 truncate">{template.default_contents}</p>
              {/if}
            </div>

            <div class="mt-4 pt-4 border-t flex items-center justify-between">
              <span class="text-xs text-gray-400">
                Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
              </span>
              <Button size="sm" on:click={() => useTemplate(template)}>
                <Copy class="w-3 h-3 mr-1" />
                Use
              </Button>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteConfirm}
  title="Delete Template?"
  description="Are you sure you want to delete '{deleteTarget?.name}'? This cannot be undone."
  confirmText="Delete"
  variant="destructive"
  on:confirm={deleteTemplate}
  on:cancel={() => { showDeleteConfirm = false; deleteTarget = null; }}
/>
