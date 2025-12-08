<script lang="ts">
  import { Package } from 'lucide-svelte';
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
  <!-- Logo -->
  <a href="/" class="flex items-center gap-2 mb-8 group">
    <Package class="h-10 w-10 text-primary-600 group-hover:scale-110 transition-transform" />
    <span class="text-2xl font-bold text-primary-800">QCS Cargo</span>
  </a>

  <!-- Auth Card Container -->
  <div class="w-full max-w-md">
    <slot />
  </div>

  <!-- Footer -->
  <p class="mt-8 text-sm text-muted-foreground text-center">
    © {new Date().getFullYear()} QCS Cargo. All rights reserved.
  </p>
</div>

