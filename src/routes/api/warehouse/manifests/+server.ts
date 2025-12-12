import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ShippingManifest } from '$lib/types/warehouse';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
  const status = url.searchParams.get('status');
  const carrier = url.searchParams.get('carrier');

  try {
    let filter = '1 = 1';

    if (status && status !== 'all') {
      filter += ` && status = "${status}"`;
    }

    if (carrier) {
      filter += ` && carrier = "${carrier}"`;
    }

    const result = await locals.pb.collection('shipping_manifests').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'packages'
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
    console.error('[warehouse_manifests_get] Error', err);
    throw error(500, { message: 'Failed to fetch manifests' });
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
      carrier,
      serviceType,
      destination,
      packageIds
    } = body;

    console.log('[warehouse_create_manifest]', {
      correlationId,
      carrier,
      serviceType,
      destination,
      packageCount: packageIds?.length || 0
    });

    if (!carrier || !packageIds?.length) {
      throw error(400, { message: 'Missing carrier or package IDs' });
    }

    // Get packages for manifest
    const packages = await locals.pb.collection('warehouse_packages').getFullList({
      filter: `id in ("${packageIds.join('","')}")`,
      expand: 'booking'
    });

    if (packages.length === 0) {
      throw error(404, { message: 'No valid packages found' });
    }

    // Generate manifest number
    const manifestNumber = `MAN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate total weight
    const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight_actual || 0), 0);

    // Create manifest
    const manifest = await locals.pb.collection('shipping_manifests').create({
      manifest_number: manifestNumber,
      carrier,
      service_type: serviceType || packages[0].service_type,
      destination: destination || packages[0].destination,
      packages: packageIds,
      total_weight: totalWeight,
      total_packages: packages.length,
      status: 'draft',
      created_by: locals.user.id
    });

    console.log('[warehouse_create_manifest] Manifest created', {
      correlationId,
      manifestId: manifest.id,
      manifestNumber
    });

    // Generate documents
    const documents = await generateManifestDocuments(manifest.id, packages, carrier);

    // Update manifest with documents
    await locals.pb.collection('shipping_manifests').update(manifest.id, {
      documents
    });

    return json({
      status: 'success',
      data: {
        manifestId: manifest.id,
        manifestNumber,
        packageCount: packages.length,
        totalWeight,
        status: 'generated'
      } as ShippingManifest
    });
  } catch (err) {
    console.error('[warehouse_create_manifest] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to create manifest' });
  }
};

async function generateManifestDocuments(
  manifestId: string,
  packages: any[],
  carrier: string
): Promise<any[]> {
  const documents = [];

  // Generate packing slip
  documents.push({
    id: crypto.randomUUID(),
    type: 'packing_slip',
    url: `/api/warehouse/manifests/${manifestId}/documents/packing-slip`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'system'
  });

  // Generate carrier labels
  documents.push({
    id: crypto.randomUUID(),
    type: 'carrier_label',
    url: `/api/warehouse/manifests/${manifestId}/documents/labels`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'system'
  });

  // Generate customs form for international shipments
  const hasInternational = packages.some(pkg => pkg.destination !== 'JM');
  if (hasInternational) {
    documents.push({
      id: crypto.randomUUID(),
      type: 'customs_form',
      url: `/api/warehouse/manifests/${manifestId}/documents/customs`,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system'
    });
  }

  return documents;
}