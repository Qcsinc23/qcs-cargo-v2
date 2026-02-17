import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { WarehouseBay } from '$lib/types/warehouse';
import { isAdminOrStaff } from '$lib/server/authz';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

const WAREHOUSE_PAGE_SIZE = 200;

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }
  if (!isAdminOrStaff(locals.user)) {
    throw error(403, { message: 'Admin or staff role required' });
  }

  const zone = url.searchParams.get('zone');
  const type = url.searchParams.get('type');

  try {
    let filter = 'status = "active"';

    if (zone) {
      filter += ` && zone = "${escapePbFilterValue(zone)}"`;
    }

    if (type) {
      filter += ` && type = "${escapePbFilterValue(type)}"`;
    }

    const bays: any[] = [];
    let bayPage = 1;
    let bayTotalPages = 1;
    while (bayPage <= bayTotalPages) {
      const pageResult = await locals.pb.collection('warehouse_bays').getList(bayPage, WAREHOUSE_PAGE_SIZE, {
        filter,
        sort: 'zone, code'
      });
      bays.push(...pageResult.items);
      bayTotalPages = pageResult.totalPages;
      bayPage += 1;
    }

    const countsByBay = new Map<string, number>();
    let packagePage = 1;
    let packageTotalPages = 1;
    while (packagePage <= packageTotalPages) {
      const pageResult = await locals.pb.collection('warehouse_packages').getList(
        packagePage,
        WAREHOUSE_PAGE_SIZE,
        {
          filter: 'status != "shipped"',
          fields: 'location_bay'
        }
      );

      for (const pkg of pageResult.items) {
        const bayCode = String(pkg.location_bay || '');
        if (!bayCode) continue;
        countsByBay.set(bayCode, (countsByBay.get(bayCode) || 0) + 1);
      }

      packageTotalPages = pageResult.totalPages;
      packagePage += 1;
    }

    const baysWithCounts = bays.map((bay) => ({
      ...bay,
      currentCount: countsByBay.get(String(bay.code)) || 0
    })) as unknown as WarehouseBay[];

    return json({
      status: 'success',
      data: baysWithCounts
    });
  } catch (err) {
    console.error('[warehouse_bays_get] Error', err);
    throw error(500, { message: 'Failed to fetch warehouse bays' });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }
  if (!isAdminOrStaff(locals.user)) {
    throw error(403, { message: 'Admin or staff role required' });
  }

  try {
    const body = await request.json();
    const { packageIds, targetBayId } = body;

    if (!packageIds?.length || !targetBayId) {
      throw error(400, { message: 'Missing package IDs or target bay' });
    }

    const normalizedTargetBayId = sanitizePocketBaseId(String(targetBayId || ''));
    if (!normalizedTargetBayId) {
      throw error(400, { message: 'Invalid target bay ID' });
    }

    // Verify bay exists
    const bay = await locals.pb.collection('warehouse_bays').getOne(normalizedTargetBayId);
    if (!bay) {
      throw error(404, { message: 'Target bay not found' });
    }

    const normalizedPackageIds = Array.isArray(packageIds)
      ? packageIds.map((id: string) => sanitizePocketBaseId(String(id))).filter((id): id is string => !!id)
      : [];
    if (normalizedPackageIds.length === 0) {
      throw error(400, { message: 'No valid package IDs provided' });
    }

    // Move packages to new bay
    const updates = normalizedPackageIds.map((pkgId: string) =>
      locals.pb.collection('warehouse_packages').update(pkgId, {
        location_bay: bay.code,
        location_zone: bay.zone,
        status: 'staged'
      })
    );

    await Promise.all(updates);

    return json({
      status: 'success',
      data: {
        movedCount: normalizedPackageIds.length,
        targetBay: bay.code
      }
    });
  } catch (err) {
    console.error('[warehouse_move_packages] Error', err);
    throw error(500, { message: 'Failed to move packages' });
  }
};
