<script lang="ts">
  import { Logo } from '$lib/components/shared';
  import '../../app.css';
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
  <div class="absolute top-4 left-4">
    <a href="/" class="flex items-center gap-2">
      <Logo class="h-8 w-auto" />
    </a>
  </div>

  <slot />
</div>
