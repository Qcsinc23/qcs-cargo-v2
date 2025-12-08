<script lang="ts">
  // Placeholder component - will be implemented with actual mobile navigation
  // Props are defined for type safety but not used until implementation
  export let user: { name: string; email: string; avatar?: string; role: string } | null = null;
  
  // Suppress unused warning - this is intentional for placeholder
  void user;
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
  <div class="px-4 py-2">
    <span class="text-xs text-gray-500">Mobile Nav (Placeholder)</span>
  </div>
</nav>
