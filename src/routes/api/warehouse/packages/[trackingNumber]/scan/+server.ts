import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { QRScanResult, WarehousePackageStatus } from '$lib/types/warehouse';
import { isAdminOrStaff } from '$lib/server/authz';
import { escapePbFilterValue, sanitizeTrackingNumber } from '$lib/server/pb-filter';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }
  if (!isAdminOrStaff(locals.user)) {
    throw error(403, { message: 'Admin or staff role required' });
  }

  const { trackingNumber } = params;
  const safeTrackingNumber = sanitizeTrackingNumber(trackingNumber || '');
  if (!safeTrackingNumber) {
    throw error(400, { message: 'Invalid tracking number format' });
  }

  try {
    // Check if package exists in system
    const pkg = await locals.pb.collection('packages').getFirstListItem(
      `tracking_number = "${escapePbFilterValue(safeTrackingNumber)}"`,
      { expand: 'booking' }
    ).catch(() => null);

    if (!pkg) {
      return json({
        status: 'success',
        data: {
          trackingNumber: safeTrackingNumber,
          packageId: '',
          exists: false
        } as QRScanResult
      });
    }

    // Check if already in warehouse
    const warehousePkg = await locals.pb.collection('warehouse_packages').getFirstListItem(
      `tracking_number = "${escapePbFilterValue(safeTrackingNumber)}"`
    ).catch(() => null);

    const scanResult: QRScanResult = {
      trackingNumber: safeTrackingNumber,
      packageId: pkg.id,
      exists: true,
      status: (warehousePkg?.status as WarehousePackageStatus) || 'incoming',
      location: warehousePkg?.location_bay ? `${warehousePkg.location_zone}-${warehousePkg.location_bay}` : undefined,
      exception: warehousePkg?.status === 'exception'
    };

    return json({
      status: 'success',
      data: scanResult
    });
  } catch (err) {
    console.error('[warehouse_scan] Error', { trackingNumber: safeTrackingNumber, error: err });
    throw error(500, { message: 'Failed to scan package' });
  }
};
