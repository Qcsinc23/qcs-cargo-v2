import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import Content from './dropdown-menu-content.svelte';
import Item from './dropdown-menu-item.svelte';
import Label from './dropdown-menu-label.svelte';
import Separator from './dropdown-menu-separator.svelte';
import Shortcut from './dropdown-menu-shortcut.svelte';
import SubContent from './dropdown-menu-sub-content.svelte';
import SubTrigger from './dropdown-menu-sub-trigger.svelte';
import CheckboxItem from './dropdown-menu-checkbox-item.svelte';
import RadioItem from './dropdown-menu-radio-item.svelte';
import Group from './dropdown-menu-group.svelte';

const Sub = DropdownMenuPrimitive.Sub;
const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuPrimitive.Trigger;
const RadioGroup = DropdownMenuPrimitive.RadioGroup;

export {
  Sub,
  Root,
  Item,
  Label,
  Group,
  Trigger,
  Content,
  Separator,
  Shortcut,
  RadioItem,
  SubContent,
  SubTrigger,
  RadioGroup,
  CheckboxItem,
  Root as DropdownMenu,
  Sub as DropdownMenuSub,
  Item as DropdownMenuItem,
  Label as DropdownMenuLabel,
  Group as DropdownMenuGroup,
  Content as DropdownMenuContent,
  Trigger as DropdownMenuTrigger,
  Shortcut as DropdownMenuShortcut,
  Separator as DropdownMenuSeparator,
  RadioItem as DropdownMenuRadioItem,
  SubContent as DropdownMenuSubContent,
  SubTrigger as DropdownMenuSubTrigger,
  RadioGroup as DropdownMenuRadioGroup,
  CheckboxItem as DropdownMenuCheckboxItem
};

