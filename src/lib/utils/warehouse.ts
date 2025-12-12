import type { WarehousePackageStatus, PackageCondition, WarehousePackage } from '$lib/types/warehouse';

export function getStatusColor(status: WarehousePackageStatus): string {
  const statusColors: Record<WarehousePackageStatus, string> = {
    'incoming': 'gray',
    'received': 'blue',
    'verified': 'green',
    'staged': 'yellow',
    'picked': 'purple',
    'manifested': 'indigo',
    'shipped': 'emerald',
    'exception': 'red'
  };

  return statusColors[status] || 'gray';
}

export function getStatusLabel(status: WarehousePackageStatus): string {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getConditionColor(condition: PackageCondition): string {
  const conditionColors: Record<PackageCondition, string> = {
    'excellent': 'green',
    'good': 'blue',
    'fair': 'yellow',
    'damaged': 'red',
    'wet': 'blue',
    'open': 'orange',
    'repacked': 'purple'
  };

  return conditionColors[condition] || 'gray';
}

export function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCS-${dateStr}-${random}`;
}

export function generateBayNumber(zone: string, index: number): string {
  const zonePrefix = zone.substring(0, 3).toUpperCase();
  const paddedIndex = String(index + 1).padStart(2, '0');
  return `${zonePrefix}-${paddedIndex}`;
}

export function generateManifestNumber(): string {
  const prefix = 'MAN';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateVolume(
  length: number,
  width: number,
  height: number,
  unit: 'cm' | 'in' = 'cm'
): number {
  const volume = length * width * height;

  // Convert to cubic feet if in inches
  if (unit === 'in') {
    return volume / 1728;
  }

  // Convert to cubic meters if in centimeters
  return volume / 1000000;
}

export function calculateDimWeight(
  length: number,
  width: number,
  height: number,
  divisor: number = 5000,
  unit: 'cm' | 'in' = 'cm'
): number {
  const volume = length * width * height;

  // DIM weight calculation varies by carrier
  // Most carriers use 5000 for cm (divisor of 139 for inches)
  if (unit === 'in') {
    return (length * width * height) / 166;
  }

  return volume / divisor;
}

export function getBillableWeight(
  actualWeight: number,
  dimWeight?: number
): number {
  if (!dimWeight) return actualWeight;
  return Math.max(actualWeight, dimWeight);
}

export function formatWeight(
  weight: number,
  unit: 'kg' | 'lb' = 'kg',
  decimals: number = 2
): string {
  if (unit === 'lb') {
    const lb = weight * 2.20462;
    return `${lb.toFixed(decimals)} lb`;
  }
  return `${weight.toFixed(decimals)} kg`;
}

export function formatDimensions(
  length: number,
  width: number,
  height: number,
  unit: 'cm' | 'in' = 'cm'
): string {
  return `${length} × ${width} × ${height} ${unit}`;
}

export function validatePackage(pkg: Partial<WarehousePackage>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pkg.trackingNumber) {
    errors.push('Tracking number is required');
  }

  if (!pkg.weight?.actual || pkg.weight.actual <= 0) {
    errors.push('Valid weight is required');
  }

  if (!pkg.serviceType) {
    errors.push('Service type is required');
  }

  if (!pkg.destination) {
    errors.push('Destination is required');
  }

  if (pkg.dimensions) {
    const { length, width, height } = pkg.dimensions;
    if (!length || !width || !height || length <= 0 || width <= 0 || height <= 0) {
      errors.push('Valid dimensions are required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function canUpdateStatus(
  currentStatus: WarehousePackageStatus,
  newStatus: WarehousePackageStatus
): boolean {
  const statusFlow: Record<WarehousePackageStatus, WarehousePackageStatus[]> = {
    'incoming': ['received'],
    'received': ['verified', 'exception'],
    'verified': ['staged'],
    'staged': ['picked', 'exception'],
    'picked': ['manifested'],
    'manifested': ['shipped'],
    'shipped': [],
    'exception': ['received', 'verified', 'staged']
  };

  return statusFlow[currentStatus]?.includes(newStatus) || false;
}

export function getStatusTransitionMessage(
  fromStatus: WarehousePackageStatus,
  toStatus: WarehousePackageStatus
): string {
  const messages: Record<string, string> = {
    'received->verified': 'Package verified and ready for staging',
    'verified->staged': 'Package staged in bay',
    'staged->picked': 'Package picked for shipment',
    'picked->manifested': 'Package added to shipping manifest',
    'manifested->shipped': 'Package shipped successfully',
    'exception->received': 'Exception resolved, package received',
    'exception->verified': 'Exception resolved, package verified',
    'exception->staged': 'Exception resolved, package staged'
  };

  const key = `${fromStatus}->${toStatus}`;
  return messages[key] || `Status updated from ${fromStatus} to ${toStatus}`;
}

export function getServiceTypePriority(serviceType: string): number {
  const priorities: Record<string, number> = {
    'express': 1,
    'standard': 2,
    'economy': 3,
    'freight': 4
  };

  return priorities[serviceType] || 999;
}

export function sortPackagesByPriority(
  packages: WarehousePackage[]
): WarehousePackage[] {
  return [...packages].sort((a, b) => {
    // First sort by service type priority
    const priorityDiff = getServiceTypePriority(a.serviceType) - getServiceTypePriority(b.serviceType);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by destination
    const destDiff = a.destination.localeCompare(b.destination);
    if (destDiff !== 0) return destDiff;

    // Finally by received date (newest first)
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
}

export function groupPackagesBy(
  packages: WarehousePackage[],
  key: keyof WarehousePackage | 'location'
): Record<string, WarehousePackage[]> {
  return packages.reduce((groups, pkg) => {
    let groupKey: string;

    if (key === 'location') {
      groupKey = pkg.location ? `${pkg.location.zone}-${pkg.location.bay}` : 'unassigned';
    } else {
      const value = pkg[key];
      groupKey = Array.isArray(value) ? value.join(',') : String(value || 'unknown');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(pkg);
    return groups;
  }, {} as Record<string, WarehousePackage[]>);
}

export function getWarehouseStatsSummary(
  stats: {
    today: { [key: string]: number };
    week: { [key: string]: number };
    month: { [key: string]: number };
  }
) {
  const totalToday = Object.values(stats.today).reduce((a, b) => a + b, 0);
  const totalWeek = Object.values(stats.week).reduce((a, b) => a + b, 0);
  const totalMonth = Object.values(stats.month).reduce((a, b) => a + b, 0);

  return {
    dailyAverage: totalWeek / 7,
    monthlyTotal: totalMonth,
    dailyProgress: (totalToday / (totalWeek / 7)) * 100,
    efficiency: {
      verification: (stats.week.verified / Math.max(stats.week.received, 1)) * 100,
      staging: (stats.week.staged / Math.max(stats.week.verified, 1)) * 100,
      shipping: (stats.week.shipped / Math.max(stats.week.staged, 1)) * 100
    }
  };
}

// Barcode/QR code utilities
export function generateBarcodeData(trackingNumber: string): string {
  // In a real implementation, this would generate proper barcode data
  return trackingNumber;
}

export function validateTrackingNumber(trackingNumber: string): boolean {
  // QCS tracking number format: QCS-YYYYMMDD-XXXX
  const pattern = /^QCS-\d{8}-[A-Z0-9]{4}$/;
  return pattern.test(trackingNumber);
}

// Time utilities
export function getEstimatedProcessingTime(
  serviceType: string,
  currentQueue: number
): number {
  // Base processing time in minutes per package
  const baseTimes: Record<string, number> = {
    'express': 2,
    'standard': 3,
    'economy': 5,
    'freight': 10
  };

  const baseTime = baseTimes[serviceType] || 5;
  return baseTime * currentQueue;
}

export function getEstimatedShipDate(
  serviceType: string,
  processingTime?: number
): Date {
  const serviceDays: Record<string, number> = {
    'express': 1,
    'standard': 2,
    'economy': 3,
    'freight': 5
  };

  const now = new Date();
  const totalDays = (processingTime || 0) / (8 * 60) + (serviceDays[serviceType] || 2); // 8 hours per day

  const shipDate = new Date(now);
  shipDate.setDate(shipDate.getDate() + Math.ceil(totalDays));

  // Skip weekends
  while (shipDate.getDay() === 0 || shipDate.getDay() === 6) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  return shipDate;
}