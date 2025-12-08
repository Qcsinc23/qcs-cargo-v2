<script lang="ts">
  // Placeholder component - will be implemented with actual sidebar
  // Props are defined for type safety but not used until implementation
  export let role: string = 'customer';
  
  // Suppress unused warning - this is intentional for placeholder
  void role;
</script>

<aside class="hidden md:block w-64 bg-white border-r min-h-screen">
  <div class="p-4">
    <span class="text-sm text-gray-500">Sidebar (Placeholder)</span>
  </div>
</aside>
