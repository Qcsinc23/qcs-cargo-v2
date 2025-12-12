import type { ComponentType } from 'svelte';
import {
  Home,
  Package,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  BarChart3,
  Users,
  MapPin,
  CalendarDays,
  Receipt,
  Mailbox,
  Truck,
  Search,
  Activity,
  Cog,
  Warehouse,
  Scan,
  LayoutGrid
} from 'lucide-svelte';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType;
  badge?: number;
  roles?: string[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export const navigationConfig: {
  customer: NavItem[];
  staff: NavItem[];
  admin: NavItem[];
} = {
  customer: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      id: 'shipments',
      label: 'Shipments',
      href: '/dashboard/shipments',
      icon: Package
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: '/dashboard/bookings',
      icon: CalendarDays
    },
    {
      id: 'recipients',
      label: 'Recipients',
      href: '/dashboard/recipients',
      icon: Users
    },
    {
      id: 'mailbox',
      label: 'Mailbox',
      href: '/dashboard/mailbox',
      icon: Mailbox
    },
    {
      id: 'invoices',
      label: 'Invoices',
      href: '/dashboard/invoices',
      icon: Receipt
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ],
  staff: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: BarChart3
    },
    {
      id: 'shipments',
      label: 'Shipments',
      href: '/admin/shipments',
      icon: Package
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: '/admin/bookings',
      icon: CalendarDays
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      href: '/warehouse',
      icon: Warehouse
    },
    {
      id: 'receiving',
      label: 'Receiving',
      href: '/admin/receiving',
      icon: Truck
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ],
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: BarChart3
    },
    {
      id: 'shipments',
      label: 'Shipments',
      href: '/admin/shipments',
      icon: Package
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: '/admin/bookings',
      icon: CalendarDays
    },
    {
      id: 'users',
      label: 'Customers',
      href: '/admin/users',
      icon: Users
    },
    {
      id: 'invoices',
      label: 'Invoices',
      href: '/admin/invoices',
      icon: Receipt
    },
    {
      id: 'receiving',
      label: 'Receiving',
      href: '/admin/receiving',
      icon: Truck
    },
    {
      id: 'activity',
      label: 'Activity Log',
      href: '/admin/activity',
      icon: Activity,
      desktopOnly: true
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/admin/settings',
      icon: Cog
    }
  ]
};