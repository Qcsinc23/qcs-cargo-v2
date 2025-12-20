<script lang="ts">
  import { Package } from 'lucide-svelte';
</script>

<div class="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FBF8F2] via-white to-[#DDE8DF]/55 p-8 sm:p-12 overflow-hidden">
  <!-- Decorative background -->
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div
      class="absolute inset-0 opacity-25"
      style="background-image: linear-gradient(90deg, rgba(0, 119, 182, 0.10) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 119, 182, 0.10) 1px, transparent 1px); background-size: 96px 96px;"
    ></div>
    <div class="absolute -top-44 left-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[#F3DDD4]/55 blur-3xl"></div>
    <div class="absolute -bottom-52 right-[-16rem] h-[40rem] w-[40rem] rounded-full bg-[#DDE8DF]/55 blur-3xl"></div>
  </div>

  <!-- Logo -->
  <a href="/" class="relative flex items-center gap-3 mb-12 group">
    <Package class="h-10 w-10 text-[#023E8A] group-hover:scale-110 transition-transform" />
    <span class="text-2xl font-display text-[#001D3D] tracking-wide">QCS Cargo</span>
  </a>

  <!-- Auth Card Container -->
  <div class="relative w-full max-w-md">
    <slot />
  </div>

  <!-- Footer -->
  <p class="relative mt-12 text-sm text-[#001D3D]/60 text-center tracking-wide font-light">
    © {new Date().getFullYear()} QCS Cargo. All rights reserved.
  </p>
</div>

