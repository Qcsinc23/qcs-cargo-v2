<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';

  $: userId = $page.params.id;
</script>

<svelte:head>
  <title>User Details | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">User Details</h1>
      <p class="text-slate-500">User ID: {userId}</p>
    </div>
    <Button variant="outline" href="/admin/users">Back to Users</Button>
  </div>

  <div class="rounded-lg border bg-white p-6">
    <p class="text-sm text-slate-600">
      Detailed user profile tooling is being migrated into this route.
    </p>
  </div>
</div>
