import type { ComponentType } from 'svelte';

export interface BreadcrumbPath {
  label: string;
  href?: string;
  icon?: ComponentType;
  disabled?: boolean;
}



