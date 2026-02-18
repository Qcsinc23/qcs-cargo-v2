<script lang="ts">
  import { Package } from 'lucide-svelte';

  let className: string | undefined = undefined;
  export let iconClass = 'text-primary-600';
  export let textClass = 'text-foreground';
  export { className as class };
</script>

<div class="flex items-center gap-2 {className}">
  <Package class={`h-full w-auto ${iconClass}`} />
  <span class={`text-xl font-bold ${textClass}`}>QCS Cargo</span>
</div>
