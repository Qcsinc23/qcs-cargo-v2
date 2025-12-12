<script lang="ts">
  export let targetId = 'main-content';
  export let label = 'Skip to main content';
</script>

<a
  href={`#${targetId}`}
  class="absolute -left-[9999px] top-4 z-50 rounded-lg bg-primary-600 px-4 py-2 text-white transition-all focus:left-4 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
>
  {label}
</a>