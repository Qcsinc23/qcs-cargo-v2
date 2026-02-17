import type { PageServerLoad } from './$types';
import { listCustomerShipmentSummaries } from '$lib/server/customer-shipments';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { shipments: [] };
  }

  const shipments = await listCustomerShipmentSummaries(locals, locals.user.id);
  return { shipments };
};
