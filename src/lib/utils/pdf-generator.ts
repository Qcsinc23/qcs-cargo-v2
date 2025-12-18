// @ts-nocheck - pdfmake types have compatibility issues
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize fonts
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

interface InvoiceData {
  invoice_number: string;
  created: string;
  due_date?: string;
  paid_at?: string;
  status: string;
  amount: number;
  currency: string;
  notes?: string;
  line_items?: Array<{
    description: string;
    quantity?: number;
    amount?: number;
  }>;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  booking?: {
    tracking_number?: string;
    destination?: string;
    scheduled_date?: string;
  };
}

/**
 * Generate invoice PDF document definition
 */
export function generateInvoicePDF(invoice: InvoiceData): any {
  const lineItems = invoice.line_items || [];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Status badge color
  const statusColor = {
    paid: '#10b981',
    pending: '#f59e0b',
    overdue: '#ef4444',
    draft: '#6b7280',
    canceled: '#6b7280',
    refunded: '#a855f7'
    }[invoice.status] || '#6b7280';

  const docDefinition: any = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],
    
    header: {
      margin: [40, 20, 40, 0],
      columns: [
        {
          width: '*',
          text: 'QCS CARGO',
          style: 'companyName',
          bold: true
        },
        {
          width: 'auto',
          text: [
            { text: 'INVOICE\n', fontSize: 20, bold: true, color: '#2563eb' },
            { text: invoice.invoice_number, fontSize: 12, color: '#6b7280' }
          ],
          alignment: 'right'
        }
      ]
    },

    content: [
      // Company Info
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'QCS Cargo', style: 'sectionHeader' },
              { text: '35 Obrien St, E12', style: 'companyInfo' },
              { text: 'Kearny, NJ 07032', style: 'companyInfo' },
              { text: 'Phone: 201-249-0929', style: 'companyInfo' },
              { text: 'Email: sales@qcs-cargo.com', style: 'companyInfo' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Bill To:', style: 'sectionHeader' },
              { text: invoice.user.name, style: 'customerInfo', bold: true },
              { text: invoice.user.email, style: 'customerInfo' },
              ...(invoice.user.phone ? [{ text: invoice.user.phone, style: 'customerInfo' }] : [])
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Invoice Details
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                columns: [
                  { text: 'Invoice Date:', style: 'label', width: 100 },
                  { text: formatDate(invoice.created), style: 'value', width: '*' }
                ]
              },
              ...(invoice.due_date ? [{
                columns: [
                  { text: 'Due Date:', style: 'label', width: 100 },
                  { text: formatDate(invoice.due_date), style: 'value', width: '*' }
                ]
              }] : []),
              ...(invoice.paid_at ? [{
                columns: [
                  { text: 'Paid Date:', style: 'label', width: 100 },
                  { text: formatDate(invoice.paid_at), style: 'value', width: '*' }
                ]
              }] : [])
            ]
          },
          {
            width: '50%',
            stack: [
              {
                columns: [
                  { text: 'Status:', style: 'label', width: 60 },
                  { 
                    text: invoice.status.toUpperCase(), 
                    style: 'status',
                    color: statusColor,
                    bold: true
                  }
                ]
              },
              ...(invoice.booking?.tracking_number ? [{
                columns: [
                  { text: 'Tracking:', style: 'label', width: 60 },
                  { text: invoice.booking.tracking_number, style: 'value', width: '*' }
                ]
              }] : []),
              ...(invoice.booking?.destination ? [{
                columns: [
                  { text: 'Destination:', style: 'label', width: 60 },
                  { text: invoice.booking.destination, style: 'value', width: '*' }
                ]
              }] : [])
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Line Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Quantity', style: 'tableHeader', alignment: 'center' },
              { text: 'Amount', style: 'tableHeader', alignment: 'right' }
            ],
            ...lineItems.map(item => [
              { text: item.description, style: 'tableCell' },
              { text: item.quantity?.toString() || '—', style: 'tableCell', alignment: 'center' },
              { text: item.amount !== undefined ? formatCurrency(item.amount) : '—', style: 'tableCell', alignment: 'right' }
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 20]
      },

      // Total
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            stack: [
              {
                columns: [
                  { text: 'TOTAL:', style: 'totalLabel', width: '*' },
                  { text: formatCurrency(invoice.amount), style: 'totalAmount', width: 'auto' }
                ]
              }
            ]
          }
        ]
      },

      // Notes
      ...(invoice.notes ? [
        { text: 'Notes:', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        { text: invoice.notes, style: 'notes' }
      ] : []),

      // Footer Text
      {
        text: 'Thank you for your business!',
        style: 'thankYou',
        alignment: 'center',
        margin: [0, 40, 0, 0]
      },
      {
        text: 'For questions about this invoice, please contact us at sales@qcs-cargo.com or call 201-249-0929',
        style: 'footerText',
        alignment: 'center',
        margin: [0, 10, 0, 0]
      }
    ],

    footer: (currentPage: number, pageCount: number) => {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        style: 'pageNumber'
      };
    },

    styles: {
      companyName: {
        fontSize: 24,
        color: '#2563eb'
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#1f2937',
        margin: [0, 0, 0, 8]
      },
      companyInfo: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 2, 0, 0]
      },
      customerInfo: {
        fontSize: 10,
        color: '#1f2937',
        margin: [0, 2, 0, 0]
      },
      label: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 3, 0, 0]
      },
      value: {
        fontSize: 10,
        color: '#1f2937',
        margin: [0, 3, 0, 0]
      },
      status: {
        fontSize: 10,
        margin: [0, 3, 0, 0]
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#1f2937',
        fillColor: '#f3f4f6'
      },
      tableCell: {
        fontSize: 10,
        color: '#374151'
      },
      totalLabel: {
        fontSize: 14,
        bold: true,
        color: '#1f2937'
      },
      totalAmount: {
        fontSize: 16,
        bold: true,
        color: '#2563eb'
      },
      notes: {
        fontSize: 9,
        color: '#6b7280',
        italics: true
      },
      thankYou: {
        fontSize: 12,
        bold: true,
        color: '#2563eb'
      },
      footerText: {
        fontSize: 8,
        color: '#6b7280'
      },
      pageNumber: {
        fontSize: 8,
        color: '#9ca3af'
      }
    },

    defaultStyle: {
      font: 'Roboto'
    }
  };

  return docDefinition;
}

/**
 * Generate and download invoice PDF (client-side)
 */
export function downloadInvoicePDF(invoice: InvoiceData): void {
  const docDefinition = generateInvoicePDF(invoice);
  const filename = `Invoice-${invoice.invoice_number}.pdf`;
  
  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Generate and open invoice PDF in new tab (client-side)
 */
export function openInvoicePDF(invoice: InvoiceData): void {
  const docDefinition = generateInvoicePDF(invoice);
  
  pdfMake.createPdf(docDefinition).open();
}

/**
 * Generate invoice PDF as Blob (for server-side or upload)
 */
export function generateInvoicePDFBlob(invoice: InvoiceData): Promise<Blob> {
  const docDefinition = generateInvoicePDF(invoice);
  
  return new Promise((resolve, reject) => {
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.getBlob((blob: Blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate PDF blob'));
      }
    });
  });
}

