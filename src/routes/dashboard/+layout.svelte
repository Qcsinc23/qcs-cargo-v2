<script lang="ts">
  import { Header, Sidebar, MobileBottomNav } from '$lib/components/layout';

  export let data;

  // Transform user data to expected format
  $: user = data.user ? {
    name: data.user.name || '',
    email: data.user.email || '',
    avatar: data.user.avatar,
    role: data.user.role || 'customer'
  } : null;
</script>

<div class="min-h-screen bg-gray-50">
  <Header user={user} />
  
  <div class="flex">
    <Sidebar role={user?.role || 'customer'} />
    
    <main id="main-content" class="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
      <slot />
    </main>
  </div>
  
  <MobileBottomNav user={user} />
</div>

