// UI Component Exports - Named exports to avoid conflicts

// Button
export { Button, buttonVariants, type ButtonProps, type ButtonEvents } from './button';

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './card';

// Input
export { Input, type InputEvents, type FormInputEvent } from './input';

// Numeric Input (formatted)
export { NumericInput } from './numeric-input';

// Label
export { Label } from './label';

// Badge
export { Badge, badgeVariants, type Variant as BadgeVariant } from './badge';

// Alert
export {
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants,
  type Variant as AlertVariant
} from './alert';

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal
} from './dialog';

// Select
export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup
} from './select';

// Textarea
export { Textarea, type TextareaEvents, type FormTextareaEvent } from './textarea';

// Separator
export { Separator } from './separator';

// Skeleton
export { Skeleton } from './skeleton';

// Breadcrumbs
export { Breadcrumbs, type BreadcrumbPath, type BreadcrumbSeparator } from './breadcrumbs';

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSubTrigger,
  DropdownMenuRadioItem,
  DropdownMenuGroup
} from './dropdown-menu';

// Switch
export { Switch } from './switch';

// Form Field
export { FormInput } from './form-field';
