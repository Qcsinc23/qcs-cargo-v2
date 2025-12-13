import type { ComponentType } from 'svelte';
import {
  AlertTriangle,
  Package,
  MapPin,
  Clock,
  HelpCircle,
  Ban,
  Scale,
  Truck,
  XCircle,
  CheckCircle
} from 'lucide-svelte';

export type ExceptionType = 
  | 'damaged' 
  | 'missing' 
  | 'misrouted' 
  | 'held_customs' 
  | 'held_payment'
  | 'weight_discrepancy'
  | 'address_issue'
  | 'refused'
  | 'other';

export type ExceptionStatus = 
  | 'open' 
  | 'investigating' 
  | 'resolved' 
  | 'escalated' 
  | 'closed';

export type ExceptionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ExceptionTypeConfig {
  id: ExceptionType;
  label: string;
  description: string;
  icon: ComponentType;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultPriority: ExceptionPriority;
  requiresCustomerNotification: boolean;
  resolutionOptions: string[];
}

export const EXCEPTION_TYPES: ExceptionTypeConfig[] = [
  {
    id: 'damaged',
    label: 'Damaged Package',
    description: 'Package has visible damage or contents are compromised',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    defaultPriority: 'high',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'File insurance claim',
      'Refund customer',
      'Replace items',
      'Partial refund',
      'Customer accepts as-is'
    ]
  },
  {
    id: 'missing',
    label: 'Missing Package',
    description: 'Package cannot be located in warehouse or transit',
    icon: Package,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    defaultPriority: 'critical',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Locate package',
      'File insurance claim',
      'Full refund',
      'Reship items',
      'Escalate to carrier'
    ]
  },
  {
    id: 'misrouted',
    label: 'Misrouted Shipment',
    description: 'Package sent to wrong destination or address',
    icon: MapPin,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultPriority: 'high',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Redirect to correct address',
      'Return to warehouse',
      'Contact recipient',
      'Partial refund for delay'
    ]
  },
  {
    id: 'held_customs',
    label: 'Held at Customs',
    description: 'Package held by customs for inspection or documentation',
    icon: Ban,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    defaultPriority: 'medium',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Provide documentation',
      'Pay duties/fees',
      'Customer to pay duties',
      'Return to sender',
      'Abandon shipment'
    ]
  },
  {
    id: 'held_payment',
    label: 'Held for Payment',
    description: 'Package held due to payment issues or additional charges',
    icon: Clock,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultPriority: 'medium',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Customer pays balance',
      'Adjust charges',
      'Apply discount',
      'Return to sender'
    ]
  },
  {
    id: 'weight_discrepancy',
    label: 'Weight Discrepancy',
    description: 'Actual weight differs significantly from declared weight',
    icon: Scale,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultPriority: 'low',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Customer pays difference',
      'Accept original weight',
      'Apply discount',
      'Reweigh package'
    ]
  },
  {
    id: 'address_issue',
    label: 'Address Issue',
    description: 'Delivery address incomplete, incorrect, or inaccessible',
    icon: MapPin,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultPriority: 'medium',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Contact recipient for address',
      'Hold for pickup',
      'Return to sender',
      'Attempt alternate delivery'
    ]
  },
  {
    id: 'refused',
    label: 'Delivery Refused',
    description: 'Recipient refused to accept the package',
    icon: XCircle,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    defaultPriority: 'low',
    requiresCustomerNotification: true,
    resolutionOptions: [
      'Return to sender',
      'Contact sender for instructions',
      'Attempt redelivery',
      'Hold for pickup'
    ]
  },
  {
    id: 'other',
    label: 'Other Issue',
    description: 'Other exception not covered by standard categories',
    icon: HelpCircle,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    defaultPriority: 'medium',
    requiresCustomerNotification: false,
    resolutionOptions: [
      'Investigate further',
      'Contact customer',
      'Escalate to supervisor',
      'Custom resolution'
    ]
  }
];

export const EXCEPTION_STATUS_CONFIG: Record<ExceptionStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: ComponentType;
}> = {
  open: {
    label: 'Open',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: AlertTriangle
  },
  investigating: {
    label: 'Investigating',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: Clock
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  escalated: {
    label: 'Escalated',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: AlertTriangle
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: XCircle
  }
};

export const EXCEPTION_PRIORITY_CONFIG: Record<ExceptionPriority, {
  label: string;
  color: string;
  bgColor: string;
  order: number;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    order: 1
  },
  high: {
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    order: 2
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    order: 3
  },
  low: {
    label: 'Low',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    order: 4
  }
};

export function getExceptionType(id: ExceptionType): ExceptionTypeConfig | undefined {
  return EXCEPTION_TYPES.find(t => t.id === id);
}

export function getExceptionStatusConfig(status: ExceptionStatus) {
  return EXCEPTION_STATUS_CONFIG[status];
}

export function getExceptionPriorityConfig(priority: ExceptionPriority) {
  return EXCEPTION_PRIORITY_CONFIG[priority];
}

