import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { WarehouseBay } from '$lib/types/warehouse';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const zone = url.searchParams.get('zone');
  const type = url.searchParams.get('type');

  try {
    let filter = 'status = "active"';

    if (zone) {
      filter += ` && zone = "${zone}"`;
    }

    if (type) {
      filter += ` && type = "${type}"`;
    }

    const bays = await locals.pb.collection('warehouse_bays').getFullList({
      filter,
      sort: 'zone, code'
    });

    // Get package counts for each bay
    const baysWithCounts = await Promise.all(
      bays.map(async (bay) => {
        const count = await locals.pb.collection('warehouse_packages').getFirstListItem(
          `location_bay = "${bay.code}" && status != "shipped"`,
          { fields: 'id' }
        ).then(() => locals.pb.collection('warehouse_packages').getList(1, 1, {
          filter: `location_bay = "${bay.code}" && status != "shipped"`,
          fields: 'id'
        })).then(res => res.totalItems).catch(() => 0);

        return {
          ...bay,
          currentCount: count
        } as unknown as WarehouseBay;
      })
    );

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

  try {
    const body = await request.json();
    const { packageIds, targetBayId } = body;

    if (!packageIds?.length || !targetBayId) {
      throw error(400, { message: 'Missing package IDs or target bay' });
    }

    // Verify bay exists
    const bay = await locals.pb.collection('warehouse_bays').getOne(targetBayId);
    if (!bay) {
      throw error(404, { message: 'Target bay not found' });
    }

    // Move packages to new bay
    const updates = packageIds.map((pkgId: string) =>
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
        movedCount: packageIds.length,
        targetBay: bay.code
      }
    });
  } catch (err) {
    console.error('[warehouse_move_packages] Error', err);
    throw error(500, { message: 'Failed to move packages' });
  }
};