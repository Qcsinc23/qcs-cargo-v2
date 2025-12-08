<script lang="ts">
  import { PublicHeader, PublicFooter } from '$lib/components/layout';

  export let data;
  $: user = data.user;
</script>

<div class="flex min-h-screen flex-col">
  <PublicHeader {user} />

  <main id="main-content" class="flex-1">
    <slot />
  </main>

  <PublicFooter />
</div>
