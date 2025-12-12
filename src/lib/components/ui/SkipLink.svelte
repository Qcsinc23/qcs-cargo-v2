<script lang="ts">
  export let target = '#main-content';
  export let label = 'Skip to main content';
</script>

<a
  href={target}
  class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary-600 text-white px-4 py-2 text-sm font-medium rounded-br-lg"
>
  {label}
</a>