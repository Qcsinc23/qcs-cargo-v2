<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import { Home, ChevronRight, MoreHorizontal } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';
  import type { BreadcrumbPath } from './types';

  export let customPath: BreadcrumbPath[] | undefined = undefined;
  export let showHome = true;
  export let separator: ComponentType = ChevronRight;
  export let maxItems = 3;

  const dispatch = createEventDispatcher();

  // Explicit locals keep TypeScript happy even when the editor falls back to plain TS analysis.
  let paths: BreadcrumbPath[] = [];
  let displayPaths: BreadcrumbPath[] = [];
  let shouldTruncate = false;
  let visiblePaths: BreadcrumbPath[] = [];

  $: paths = customPath || generateBreadcrumbPaths($page.url.pathname);

  function generateBreadcrumbPaths(pathname: string): BreadcrumbPath[] {
    const segments = pathname.split('/').filter(Boolean);
    const paths: BreadcrumbPath[] = [];

    // Determine the route type
    const routeType = getRouteType(pathname);

    // Build paths based on route type
    switch (routeType) {
      case 'public':
        paths.push(...generatePublicPaths(segments));
        break;
      case 'dashboard':
        paths.push(...generateDashboardPaths(segments));
        break;
      case 'admin':
        paths.push(...generateAdminPaths(segments));
        break;
      case 'warehouse':
        paths.push(...generateWarehousePaths(segments));
        break;
      case 'auth':
        paths.push(...generateAuthPaths(segments));
        break;
      default:
        paths.push(...generateDefaultPaths(segments));
    }

    return paths;
  }

  function getRouteType(pathname: string): string {
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/warehouse')) return 'warehouse';
    if (pathname.startsWith('/auth')) return 'auth';
    return 'public';
  }

  function generatePublicPaths(segments: string[]): BreadcrumbPath[] {
    const paths: BreadcrumbPath[] = [];
    let currentPath = '';

    for (const segment of segments) {
      currentPath += `/${segment}`;

      switch (segment) {
        case 'destinations':
          paths.push({ label: 'Destinations', href: currentPath });
          break;
        case 'services':
          paths.push({ label: 'Services', href: currentPath });
          break;
        case 'pricing':
          paths.push({ label: 'Pricing', href: currentPath });
          break;
        case 'faq':
          paths.push({ label: 'FAQ', href: currentPath });
          break;
        case 'prohibited-items':
          paths.push({ label: 'Prohibited Items', href: currentPath });
          break;
        case 'track':
          paths.push({ label: 'Track Shipment', href: currentPath });
          break;
        case 'about':
          paths.push({ label: 'About', href: currentPath });
          break;
        case 'contact':
          paths.push({ label: 'Contact', href: currentPath });
          break;
        case 'privacy':
          paths.push({ label: 'Privacy Policy', href: currentPath });
          break;
        case 'terms':
          paths.push({ label: 'Terms of Service', href: currentPath });
          break;
        default:
          if (segments.indexOf(segment) === segments.length - 1) {
            // Last segment, don't make it a link
            paths.push({ label: formatLabel(segment), disabled: true });
          } else {
            paths.push({ label: formatLabel(segment), href: currentPath });
          }
      }
    }

    return paths;
  }

  function generateDashboardPaths(segments: string[]): BreadcrumbPath[] {
    const paths: BreadcrumbPath[] = [];
    paths.push({ label: 'Dashboard', href: '/dashboard' });

    let currentPath = '/dashboard';

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      switch (segment) {
        case 'bookings':
          paths.push({ label: 'Bookings', href: currentPath });
          break;
        case 'new':
          paths.push({ label: 'New Booking', href: currentPath });
          break;
        case 'shipments':
          paths.push({ label: 'Shipments', href: currentPath });
          break;
        case 'recipients':
          paths.push({ label: 'Recipients', href: currentPath });
          break;
        case 'mailbox':
          paths.push({ label: 'Mailbox', href: currentPath });
          break;
        case 'invoices':
          paths.push({ label: 'Invoices', href: currentPath });
          break;
        case 'settings':
          paths.push({ label: 'Settings', href: currentPath });
          break;
        case 'profile':
          paths.push({ label: 'Profile', href: currentPath });
          break;
        case 'notifications':
          paths.push({ label: 'Notifications', href: currentPath });
          break;
        case 'security':
          paths.push({ label: 'Security', href: currentPath });
          break;
        default:
          if (i === segments.length - 1) {
            paths.push({ label: formatLabel(segment), disabled: true });
          } else {
            paths.push({ label: formatLabel(segment), href: currentPath });
          }
      }
    }

    return paths;
  }

  function generateAdminPaths(segments: string[]): BreadcrumbPath[] {
    const paths: BreadcrumbPath[] = [];
    paths.push({ label: 'Admin', href: '/admin' });

    let currentPath = '/admin';

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      switch (segment) {
        case 'users':
          paths.push({ label: 'Users', href: currentPath });
          break;
        case 'bookings':
          paths.push({ label: 'Bookings', href: currentPath });
          break;
        case 'shipments':
          paths.push({ label: 'Shipments', href: currentPath });
          break;
        case 'invoices':
          paths.push({ label: 'Invoices', href: currentPath });
          break;
        case 'receiving':
          paths.push({ label: 'Receiving', href: currentPath });
          break;
        case 'activity':
          paths.push({ label: 'Activity Log', href: currentPath });
          break;
        case 'settings':
          paths.push({ label: 'Settings', href: currentPath });
          break;
        default:
          if (i === segments.length - 1) {
            paths.push({ label: formatLabel(segment), disabled: true });
          } else {
            paths.push({ label: formatLabel(segment), href: currentPath });
          }
      }
    }

    return paths;
  }

  function generateWarehousePaths(segments: string[]): BreadcrumbPath[] {
    const paths: BreadcrumbPath[] = [];
    paths.push({ label: 'Warehouse', href: '/warehouse' });

    let currentPath = '/warehouse';

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      switch (segment) {
        case 'scan':
          paths.push({ label: 'Scan Package', href: currentPath });
          break;
        case 'inventory':
          paths.push({ label: 'Inventory', href: currentPath });
          break;
        case 'outbound':
          paths.push({ label: 'Outbound', href: currentPath });
          break;
        case 'reports':
          paths.push({ label: 'Reports', href: currentPath });
          break;
        default:
          if (i === segments.length - 1) {
            paths.push({ label: formatLabel(segment), disabled: true });
          } else {
            paths.push({ label: formatLabel(segment), href: currentPath });
          }
      }
    }

    return paths;
  }

  function generateAuthPaths(segments: string[]): BreadcrumbPath[] {
    const paths: BreadcrumbPath[] = [];

    for (const segment of segments) {
      switch (segment) {
        case 'login':
          paths.push({ label: 'Sign In', disabled: true });
          break;
        case 'register':
          paths.push({ label: 'Create Account', disabled: true });
          break;
        case 'forgot-password':
          paths.push({ label: 'Reset Password', disabled: true });
          break;
        case 'verify':
          paths.push({ label: 'Email Verification', disabled: true });
          break;
        default:
          paths.push({ label: formatLabel(segment), disabled: true });
      }
    }

    return paths;
  }

  function generateDefaultPaths(segments: string[]): BreadcrumbPath[] {
    return segments.map((segment, index) => ({
      label: formatLabel(segment),
      href: index < segments.length - 1 ? `/${segments.slice(0, index + 1).join('/')}` : undefined,
      disabled: index === segments.length - 1
    }));
  }

  function formatLabel(segment: string): string {
    // Convert kebab-case and snake_case to Title Case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\bID\b/gi, 'ID')
      .replace(/\bAPI\b/gi, 'API');
  }

  $: displayPaths = showHome && !paths.some(p => p.href === '/')
    ? [{ label: 'Home', href: '/', icon: Home }, ...paths]
    : paths;

  $: shouldTruncate = displayPaths.length > maxItems;
  $: visiblePaths = (shouldTruncate
    ? [
        displayPaths[0],
        { label: '...', icon: MoreHorizontal, disabled: true } satisfies BreadcrumbPath,
        ...displayPaths.slice(-maxItems + 2)
      ]
    : displayPaths) as BreadcrumbPath[];

  function handleClick(path: BreadcrumbPath, index: number) {
    if (path.disabled) return;

    dispatch('navigate', { path: path.href, index });
  }
</script>

<nav
  aria-label="Breadcrumb"
  class="flex items-center space-x-1 text-sm text-gray-500"
>
  {#each visiblePaths as path, index}
    {@const Icon = path.icon}
    {@const isLast = index === visiblePaths.length - 1}

    <div class="flex items-center">
      {#if index > 0}
        <svelte:component this={separator} class="w-4 h-4 mx-1 flex-shrink-0 text-gray-400" />
      {/if}

      {#if path.href && !path.disabled}
        <button
          type="button"
          on:click={() => handleClick(path, index)}
          class="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors group"
        >
          {#if Icon}
            <Icon class="w-4 h-4 group-hover:text-gray-700" />
          {/if}
          <span class="font-medium group-hover:text-gray-700">{path.label}</span>
        </button>
      {:else}
        <div class="flex items-center space-x-1 px-2 py-1" aria-current={isLast ? 'page' : undefined}>
          {#if Icon}
            <Icon class="w-4 h-4 text-gray-400" />
          {/if}
          <span class="font-medium {isLast ? 'text-gray-900' : 'text-gray-500'}">{path.label}</span>
        </div>
      {/if}
    </div>
  {/each}
</nav>

<!-- Optional: Schema.org structured data for SEO -->
<svelte:head>
  {#if paths.length > 0}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": displayPaths.map((path, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": path.label,
          ...(path.href && !path.disabled ? { "item": new URL(path.href, $page.url.origin).href } : {})
        }))
      })}
    </script>
  {/if}
</svelte:head>
