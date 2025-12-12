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
  MapPin
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
      id: 'book',
      label: 'Book',
      href: '/dashboard/book',
      icon: FileText,
      mobileOnly: true
    },
    {
      id: 'tracking',
      label: 'Tracking',
      href: '/dashboard/tracking',
      icon: MapPin
    },
    {
      id: 'billing',
      label: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard
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
      href: '/dashboard',
      icon: BarChart3
    },
    {
      id: 'shipments',
      label: 'Shipments',
      href: '/dashboard/shipments',
      icon: Package
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
      roles: ['staff', 'admin']
    },
    {
      id: 'tracking',
      label: 'Tracking',
      href: '/dashboard/tracking',
      icon: MapPin
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ],
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3
    },
    {
      id: 'shipments',
      label: 'Shipments',
      href: '/dashboard/shipments',
      icon: Package
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/dashboard/customers',
      icon: Users
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      desktopOnly: true
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]
};