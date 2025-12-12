import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  let invoice: any;
  try {
    invoice = await locals.pb.collection('invoices').getOne(params.id);
  } catch {
    throw error(404, { message: 'Invoice not found' });
  }

  const role = (locals.user as any)?.role;
  const isPrivileged = role === 'admin' || role === 'staff';

  if (!isPrivileged && (invoice as any).user !== locals.user.id) {
    throw error(403, { message: 'You do not have permission to view this invoice' });
  }

  return { invoice };
};


