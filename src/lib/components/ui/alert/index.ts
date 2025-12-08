import { type VariantProps, tv } from 'tailwind-variants';

import Root from './alert.svelte';
import Description from './alert-description.svelte';
import Title from './alert-title.svelte';

export const alertVariants = tv({
  base: 'relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive:
        'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      success:
        'border-success-500/50 text-success-700 dark:border-success-500 [&>svg]:text-success-500',
      warning:
        'border-warning-500/50 text-warning-700 dark:border-warning-500 [&>svg]:text-warning-500'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export type Variant = VariantProps<typeof alertVariants>['variant'];

export {
  Root,
  Description,
  Title,
  Root as Alert,
  Description as AlertDescription,
  Title as AlertTitle
};

