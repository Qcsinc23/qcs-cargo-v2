import Breadcrumbs from './breadcrumbs.svelte';
import type { ComponentType } from 'svelte';
import type { BreadcrumbPath } from './types';

export { Breadcrumbs };
export type { BreadcrumbPath };

// Export convenience types for consumers
export type BreadcrumbSeparator = ComponentType;

// Default export for easier imports
export default Breadcrumbs;