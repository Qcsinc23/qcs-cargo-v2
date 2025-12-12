import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { QRScanResult } from '$lib/types/warehouse';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const { trackingNumber } = params;

  try {
    // Check if package exists in system
    const pkg = await locals.pb.collection('packages').getFirstListItem(
      `tracking_number = "${trackingNumber}"`,
      { expand: 'booking' }
    ).catch(() => null);

    if (!pkg) {
      return json({
        status: 'success',
        data: {
          trackingNumber,
          packageId: '',
          exists: false
        } as QRScanResult
      });
    }

    // Check if already in warehouse
    const warehousePkg = await locals.pb.collection('warehouse_packages').getFirstListItem(
      `tracking_number = "${trackingNumber}"`
    ).catch(() => null);

    const scanResult: QRScanResult = {
      trackingNumber,
      packageId: pkg.id,
      exists: true,
      status: warehousePkg?.status as any || 'incoming',
      location: warehousePkg?.location_bay ? `${warehousePkg.location_zone}-${warehousePkg.location_bay}` : undefined,
      exception: warehousePkg?.status === 'exception'
    };

    return json({
      status: 'success',
      data: scanResult
    });
  } catch (err) {
    console.error('[warehouse_scan] Error', { trackingNumber, error: err });
    throw error(500, { message: 'Failed to scan package' });
  }
};