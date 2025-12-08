<script lang="ts">
  // Placeholder component - will be implemented with actual dashboard header
  // Props are defined for type safety but not used until implementation
  export let user: { name: string; email: string; avatar?: string; role: string } | null = null;
  
  // Suppress unused warning - this is intentional for placeholder
  void user;
</script>

<header class="bg-white shadow-sm border-b">
  <div class="px-4 py-3">
    <span class="text-sm text-gray-500">Dashboard Header (Placeholder)</span>
  </div>
</header>
