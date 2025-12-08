<script lang="ts">
  import { Package } from 'lucide-svelte';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div class="flex items-center gap-2 {className}">
  <Package class="h-full w-auto text-primary-600" />
  <span class="text-xl font-bold text-primary-800 dark:text-white">QCS Cargo</span>
</div>
