<script lang="ts">
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import {
    LayoutDashboard,
    Package,
    CalendarPlus,
    History,
    Mail,
    Settings,
    Users,
    ClipboardList,
    BarChart3,
    Warehouse,
    FileText,
    HelpCircle
  } from 'lucide-svelte';

  export let role: 'customer' | 'staff' | 'admin' = 'customer';

  $: currentPath = $page.url.pathname;

  const customerNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Book Shipment', href: '/dashboard/book', icon: CalendarPlus },
    { name: 'My Shipments', href: '/dashboard/shipments', icon: Package },
    { name: 'Shipment History', href: '/dashboard/history', icon: History },
    { name: 'My Mailbox', href: '/dashboard/mailbox', icon: Mail },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
  ];

  const staffNav = [
    { name: 'Dashboard', href: '/warehouse', icon: LayoutDashboard },
    { name: 'Scan Packages', href: '/warehouse/scan', icon: Package },
    { name: 'Check-In', href: '/warehouse/checkin', icon: ClipboardList },
    { name: 'Inventory', href: '/warehouse/inventory', icon: Warehouse }
  ];

  const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarPlus },
    { name: 'Shipments', href: '/admin/shipments', icon: Package },
    { name: 'Manifests', href: '/admin/manifests', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  $: navigation = role === 'admin' ? adminNav : role === 'staff' ? staffNav : customerNav;
</script>

<aside class="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-gray-50/50">
  <nav class="flex-1 px-4 py-6 space-y-1" aria-label="Sidebar navigation">
    {#each navigation as item}
      <a
        href={item.href}
        class={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          currentPath === item.href || currentPath.startsWith(item.href + '/')
            ? 'bg-primary-50 text-primary-700'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
        aria-current={currentPath === item.href ? 'page' : undefined}
      >
        <svelte:component
          this={item.icon}
          class={cn(
            'h-5 w-5 flex-shrink-0',
            currentPath === item.href || currentPath.startsWith(item.href + '/')
              ? 'text-primary-600'
              : 'text-muted-foreground group-hover:text-accent-foreground'
          )}
        />
        {item.name}
      </a>
    {/each}
  </nav>

  <!-- Help section -->
  <div class="p-4 border-t">
    <a
      href="/help"
      class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <HelpCircle class="h-5 w-5" />
      Help & Support
    </a>
  </div>
</aside>

