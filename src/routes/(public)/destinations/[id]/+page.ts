import { error } from '@sveltejs/kit';
import { getDestination } from '$lib/config/destinations';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const destination = getDestination(params.id);

  if (!destination) {
    throw error(404, 'Destination not found');
  }

  return {
    destination
  };
};

