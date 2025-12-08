<script lang="ts">
  export let targetId = 'main-content';
  export let label = 'Skip to main content';
</script>

<a
  href="#{targetId}"
  class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
>
  {label}
</a>