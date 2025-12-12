import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { WarehousePackage, WarehousePackageStatus } from '$lib/types/warehouse';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') || '20', 10);
  const status = url.searchParams.get('status') as WarehousePackageStatus | 'all' | null;
  const zone = url.searchParams.get('zone');
  const bay = url.searchParams.get('bay');
  const serviceType = url.searchParams.get('serviceType');
  const destination = url.searchParams.get('destination');
  const search = url.searchParams.get('search');

  try {
    // Build filter
    let filter = '1 = 1';

    if (status && status !== 'all') {
      filter += ` && status = "${status}"`;
    }

    if (zone) {
      filter += ` && location_zone = "${zone}"`;
    }

    if (bay) {
      filter += ` && location_bay = "${bay}"`;
    }

    if (serviceType) {
      filter += ` && service_type = "${serviceType}"`;
    }

    if (destination) {
      filter += ` && destination = "${destination}"`;
    }

    if (search) {
      filter += ` && (tracking_number ~ "${search}" || id ~ "${search}")`;
    }

    const result = await locals.pb.collection('warehouse_packages').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'booking,recipient'
    });

    return json({
      status: 'success',
      data: {
        items: result.items,
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    console.error('[warehouse_packages_get] Error', err);
    throw error(500, { message: 'Failed to fetch warehouse packages' });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const {
      trackingNumber,
      condition,
      actualWeight,
      actualDimensions,
      photos,
      notes,
      bayLocation
    } = body;

    console.log('[warehouse_receive_package]', {
      correlationId,
      trackingNumber,
      condition,
      receivedBy: locals.user.id
    });

    // Find the package
    const packages = await locals.pb.collection('packages').getFirstListItem(
      `tracking_number = "${trackingNumber}"`,
      { expand: 'booking' }
    );

    if (!packages) {
      throw error(404, { message: 'Package not found' });
    }

    // Check if already received
    const existingWarehousePackage = await locals.pb.collection('warehouse_packages').getFirstListItem(
      `tracking_number = "${trackingNumber}"`
    ).catch(() => null);

    if (existingWarehousePackage) {
      throw error(409, { message: 'Package already received' });
    }

    // Create warehouse package record
    const warehousePackage = await locals.pb.collection('warehouse_packages').create({
      tracking_number: trackingNumber,
      qr_code: packages.qr_code,
      booking: packages.id,
      recipient: packages.expand?.booking?.recipient || null,
      status: 'received',
      location_bay: bayLocation?.bay || '',
      location_shelf: bayLocation?.shelf || '',
      location_zone: bayLocation?.zone || 'receiving',
      weight_actual: actualWeight || packages.weight,
      weight_verified: actualWeight ? true : false,
      weight_unit: 'kg',
      length: actualDimensions?.length || packages.length,
      width: actualDimensions?.width || packages.width,
      height: actualDimensions?.height || packages.height,
      dimensions_verified: actualDimensions ? true : false,
      dimensions_unit: 'cm',
      condition,
      photos: photos || [],
      service_type: packages.expand?.booking?.service_type || '',
      destination: packages.expand?.booking?.destination || '',
      received_at: new Date().toISOString(),
      received_by: locals.user.id,
      notes: notes || ''
    });

    // Update package status
    await locals.pb.collection('packages').update(packages.id, {
      status: 'received'
    });

    console.log('[warehouse_receive_package] Package received', {
      correlationId,
      warehousePackageId: warehousePackage.id
    });

    return json({
      status: 'success',
      data: {
        warehousePackageId: warehousePackage.id,
        trackingNumber,
        status: 'received'
      }
    });
  } catch (err) {
    console.error('[warehouse_receive_package] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to receive package' });
  }
};