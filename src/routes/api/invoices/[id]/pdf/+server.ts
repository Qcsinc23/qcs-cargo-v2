import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';

function formatMoney(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function parseLineItems(value: unknown): Array<{ description: string; amount?: number; quantity?: number }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => v && typeof v === 'object')
    .map((v: any) => ({
      description: typeof v.description === 'string' ? v.description : 'Line item',
      amount: typeof v.amount === 'number' ? v.amount : undefined,
      quantity: typeof v.quantity === 'number' ? v.quantity : undefined
    }));
}

async function renderInvoicePdfBuffer(invoice: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const invoiceNumber = String(invoice.invoice_number || invoice.id);
  const status = String(invoice.status || 'unknown');
  const currency = String(invoice.currency || 'USD');
  const amount = Number(invoice.amount || 0);
  const created = invoice.created ? new Date(invoice.created) : null;
  const due = invoice.due_date ? new Date(invoice.due_date) : null;
  const paid = invoice.paid_at ? new Date(invoice.paid_at) : null;
  const notes = typeof invoice.notes === 'string' ? invoice.notes : '';
  const lineItems = parseLineItems(invoice.line_items);

  // Header
  doc.fontSize(20).text('QCS Cargo', { align: 'left' });
  doc.fontSize(10).fillColor('#6b7280').text('Invoice', { align: 'left' });
  doc.moveDown(1);
  doc.fillColor('#111827');

  // Invoice summary
  doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`);
  doc.text(`Status: ${status.toUpperCase()}`);
  if (created) doc.text(`Created: ${created.toLocaleDateString('en-US')}`);
  if (due) doc.text(`Due: ${due.toLocaleDateString('en-US')}`);
  if (paid) doc.text(`Paid: ${paid.toLocaleDateString('en-US')}`);
  doc.moveDown(1);

  // Total
  doc.fontSize(14).text(`Total: ${formatMoney(amount, currency)}`, { align: 'right' });
  doc.moveDown(1);

  // Line items
  if (lineItems.length > 0) {
    doc.fontSize(12).text('Line Items', { underline: true });
    doc.moveDown(0.5);

    for (const item of lineItems) {
      const qty = item.quantity ? ` (Qty: ${item.quantity})` : '';
      doc.fontSize(11).text(`${item.description}${qty}`, { continued: item.amount !== undefined });
      if (item.amount !== undefined) {
        doc.text(`  ${formatMoney(item.amount, currency)}`, { align: 'right' });
      } else {
        doc.text('');
      }
    }

    doc.moveDown(1);
  }

  // Notes
  if (notes.trim()) {
    doc.fontSize(12).text('Notes', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(notes, { width: 500 });
  }

  doc.end();
  return done;
}

export const GET: RequestHandler = async ({ locals, params }) => {
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

  if (!isPrivileged && invoice.user !== locals.user.id) {
    throw error(403, { message: 'You do not have permission to download this invoice' });
  }

  const pdf = await renderInvoicePdfBuffer(invoice);
  const invoiceNumber = String(invoice.invoice_number || invoice.id);
  const filename = `invoice-${invoiceNumber}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store'
    }
  });
};


