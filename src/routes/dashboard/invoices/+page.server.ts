import type { PageServerLoad } from './$types';

type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded';

interface InvoiceDto {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  created: string;
  due_date?: string;
  paid_at?: string;
  booking?: string;
  line_items?: unknown;
  notes?: string;
}

function isPocketBaseNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as any).status === 404;
}

function normalizeStatus(value: unknown): InvoiceStatus {
  switch (value) {
    case 'draft':
    case 'pending':
    case 'paid':
    case 'overdue':
    case 'canceled':
    case 'refunded':
      return value;
    default:
      return 'pending';
  }
}

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId) {
    // dashboard/+layout.server.ts already redirects, but keep this explicit for safety.
    return { invoices: [] satisfies InvoiceDto[], invoicesAvailable: false };
  }

  let result: any;
  try {
    result = await locals.pb.collection('invoices').getList(1, 200, {
      filter: `user = "${userId}"`,
      sort: '-created'
    });
  } catch (err: unknown) {
    // If the invoices collection doesn't exist yet (common on fresh PocketBase installs),
    // don’t crash the entire dashboard.
    if (isPocketBaseNotFound(err)) {
      return { invoices: [] satisfies InvoiceDto[], invoicesAvailable: false };
    }
    throw err;
  }

  const invoices: InvoiceDto[] = result.items.map((inv: any) => ({
    id: String(inv.id),
    invoice_number: String(inv.invoice_number || inv.id),
    amount: typeof inv.amount === 'number' ? inv.amount : Number(inv.amount || 0),
    currency: typeof inv.currency === 'string' && inv.currency ? inv.currency : 'USD',
    status: normalizeStatus(inv.status),
    created: String(inv.created),
    due_date: typeof inv.due_date === 'string' ? inv.due_date : undefined,
    paid_at: typeof inv.paid_at === 'string' ? inv.paid_at : undefined,
    booking: typeof inv.booking === 'string' ? inv.booking : undefined,
    line_items: inv.line_items,
    notes: typeof inv.notes === 'string' ? inv.notes : undefined
  }));

  return {
    invoices,
    invoicesAvailable: true
  };
};


