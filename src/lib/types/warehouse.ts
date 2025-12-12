export interface WarehousePackage {
  id: string;
  trackingNumber: string;
  qrCode: string;
  bookingId: string;
  recipientId?: string;
  status: WarehousePackageStatus;
  location?: {
    bay: string;
    shelf?: string;
    zone: string;
  };
  weight: {
    actual: number;
    verified: boolean;
    unit: 'kg' | 'lb';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
    verified: boolean;
  };
  photos: PackagePhoto[];
  condition: PackageCondition;
  exceptions: PackageException[];
  serviceType: string;
  destination: string;
  receivedAt: string;
  receivedBy: string;
  scheduledPickup?: string;
  carrier?: string;
  manifestId?: string;
  createdAt: string;
  updatedAt: string;
}

export type WarehousePackageStatus =
  | 'incoming'
  | 'received'
  | 'verified'
  | 'staged'
  | 'picked'
  | 'manifested'
  | 'shipped'
  | 'exception';

export type PackageCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'damaged'
  | 'wet'
  | 'open'
  | 'repacked';

export interface PackagePhoto {
  id: string;
  url: string;
  type: 'arrival' | 'damage' | 'dimension' | 'label' | 'exception';
  caption?: string;
  takenAt: string;
  takenBy: string;
}

export interface PackageException {
  id: string;
  type: 'damage' | 'weight_mismatch' | 'dimension_mismatch' | 'prohibited' | 'missing_docs' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photo?: PackagePhoto;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface WarehouseBay {
  id: string;
  code: string;
  zone: string;
  type: 'receiving' | 'staging' | 'outbound' | 'exception' | 'hold';
  capacity: number;
  currentCount: number;
  dimensions?: {
    width: number;
    depth: number;
    height: number;
    unit: 'cm' | 'in';
  };
  restrictions?: {
    maxWeight: number;
    serviceTypes?: string[];
    destinations?: string[];
  };
  status: 'active' | 'inactive' | 'maintenance';
}

export interface StagingArea {
  id: string;
  name: string;
  zone: string;
  bays: WarehouseBay[];
  filters: {
    serviceTypes: string[];
    destinations: string[];
    carriers: string[];
    pickupDates: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShippingManifest {
  id: string;
  manifestNumber: string;
  carrier: string;
  serviceType: string;
  destination: string;
  packages: WarehousePackage[];
  totalWeight: number;
  totalPackages: number;
  status: 'draft' | 'generated' | 'printed' | 'picked' | 'shipped';
  documents: ManifestDocument[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ManifestDocument {
  id: string;
  type: 'packing_slip' | 'carrier_label' | 'customs_form' | 'certificate' | 'invoice';
  url: string;
  generatedAt: string;
  generatedBy: string;
}

export interface ScanSession {
  id: string;
  userId: string;
  type: 'receiving' | 'picking' | 'inventory';
  startTime: string;
  endTime?: string;
  packagesScanned: string[];
  exceptions: string[];
  status: 'active' | 'completed' | 'paused';
}

export interface WarehouseStats {
  today: {
    received: number;
    verified: number;
    staged: number;
    shipped: number;
    exceptions: number;
  };
  week: {
    received: number;
    verified: number;
    staged: number;
    shipped: number;
    exceptions: number;
  };
  month: {
    received: number;
    verified: number;
    staged: number;
    shipped: number;
    exceptions: number;
  };
  pending: {
    toVerify: number;
    toStage: number;
    toShip: number;
    exceptions: number;
  };
}

export interface BatchOperation {
  id: string;
  type: 'move' | 'stage' | 'manifest' | 'print_labels' | 'update_status';
  packageIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface QRScanResult {
  trackingNumber: string;
  packageId: string;
  exists: boolean;
  status?: WarehousePackageStatus;
  location?: string;
  exception?: boolean;
}

// Re-export commonly used types for convenience
export type {
  WarehousePackage,
  WarehousePackageStatus,
  PackageCondition,
  PackagePhoto,
  PackageException,
  WarehouseBay,
  StagingArea,
  ShippingManifest,
  ManifestDocument,
  ScanSession,
  WarehouseStats,
  BatchOperation
};