import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCustomerShipmentDetail } from '$lib/server/customer-shipments';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const shipment = await getCustomerShipmentDetail(locals, locals.user.id, params.id || '');

  return {
    shipment,
    shipmentId: params.id
  };
};
