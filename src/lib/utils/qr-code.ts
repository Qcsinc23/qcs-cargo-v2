import QRCode from 'qrcode';
import { env } from '$env/dynamic/private';

export interface QRCodeOptions {
  // QR code size in pixels
  size?: number;
  // Margin around QR code
  margin?: number;
  // Error correction level: 'L' | 'M' | 'Q' | 'H'
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  // Color of QR code
  color?: {
    dark?: string; // Hex color for dark modules
    light?: string; // Hex color for light modules
  };
  // Include logo in center
  logo?: {
    src: string; // Path or URL to logo
    size: number; // Logo size in pixels
    margin: number; // Margin around logo
  };
}

export interface TrackingQRData {
  trackingNumber: string;
  carrier?: string;
  serviceType?: string;
  weight?: number;
  destination?: string;
  recipientName?: string;
  recipientPhone?: string;
  specialInstructions?: string;
  generatedAt: string;
}

export class QRCodeGenerator {
  private baseUrl: string;

  constructor() {
    // Base URL for tracking links
    this.baseUrl = env.PUBLIC_APP_URL || 'https://qcs-cargo.com';
  }

  /**
   * Generate QR code for package tracking
   */
  async generatePackageQR(
    trackingNumber: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      size: 256,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create tracking URL
    const trackingUrl = `${this.baseUrl}/track/${trackingNumber}`;

    // Generate QR code as base64 data URL
    try {
      const qrDataUrl = await QRCode.toDataURL(trackingUrl, finalOptions);

      // Add logo if specified
      if (finalOptions.logo) {
        return this.addLogoToQR(qrDataUrl, finalOptions.logo);
      }

      return qrDataUrl;
    } catch (err) {
      throw new Error(`Failed to generate QR code: ${err}`);
    }
  }

  /**
   * Generate QR code with package details (for internal scanning)
   */
  async generateDetailedQR(
    trackingData: TrackingQRData,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      size: 512,
      margin: 3,
      errorCorrectionLevel: 'H', // High error correction for more data
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create JSON payload with tracking details
    const payload = {
      tn: trackingData.trackingNumber,
      c: trackingData.carrier || 'QCS',
      s: trackingData.serviceType,
      w: trackingData.weight,
      d: trackingData.destination,
      r: trackingData.recipientName,
      p: trackingData.recipientPhone,
      si: trackingData.specialInstructions,
      g: trackingData.generatedAt,
      v: '1.0' // Version for future compatibility
    };

    try {
      // Generate QR code with JSON data
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), finalOptions);

      // Add logo if specified
      if (finalOptions.logo) {
        return this.addLogoToQR(qrDataUrl, finalOptions.logo);
      }

      return qrDataUrl;
    } catch (err) {
      throw new Error(`Failed to generate detailed QR code: ${err}`);
    }
  }

  /**
   * Generate QR code as buffer for file storage
   */
  async generateQRAsBuffer(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    const defaultOptions: QRCodeOptions = {
      size: 256,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      return await QRCode.toBuffer(data, finalOptions);
    } catch (err) {
      throw new Error(`Failed to generate QR code buffer: ${err}`);
    }
  }

  /**
   * Generate batch QR codes for multiple packages
   */
  async generateBatchQR(
    trackingNumbers: string[],
    options: QRCodeOptions = {}
  ): Promise<Array<{ trackingNumber: string; qrCode: string | null }>> {
    const results: Array<{ trackingNumber: string; qrCode: string | null }> = [];

    for (const trackingNumber of trackingNumbers) {
      try {
        const qrCode = await this.generatePackageQR(trackingNumber, options);
        results.push({ trackingNumber, qrCode });
      } catch (err) {
        console.error(`Failed to generate QR for ${trackingNumber}:`, err);
        results.push({
          trackingNumber,
          qrCode: null
        });
      }
    }

    return results;
  }

  /**
   * Add logo to QR code (simplified implementation)
   * In production, you might want to use a proper image processing library
   */
  private async addLogoToQR(
    qrDataUrl: string,
    logoOptions: NonNullable<QRCodeOptions['logo']>
  ): Promise<string> {
    // This is a simplified placeholder
    // In production, you would use libraries like 'jimp' or 'canvas'
    // to properly overlay the logo on the QR code

    // For now, just return the original QR code
    // TODO: Implement proper logo overlay
    return qrDataUrl;
  }

  /**
   * Validate QR code data
   */
  validateTrackingQRData(data: any): TrackingQRData | null {
    try {
      // Try to parse as JSON (for detailed QR codes)
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);

        if (parsed.tn && typeof parsed.tn === 'string') {
          return {
            trackingNumber: parsed.tn,
            carrier: parsed.c,
            serviceType: parsed.s,
            weight: parsed.w,
            destination: parsed.d,
            recipientName: parsed.r,
            recipientPhone: parsed.p,
            specialInstructions: parsed.si,
            generatedAt: parsed.g
          };
        }
      }

      // If it's a simple tracking URL, extract tracking number
      if (typeof data === 'string') {
        const match = data.match(/\/track\/([^/?#]+)/);
        if (match && match[1]) {
          return {
            trackingNumber: match[1],
            generatedAt: new Date().toISOString()
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate printable shipping label with QR code
   */
  async generateShippingLabel(
    trackingData: TrackingQRData,
    options: QRCodeOptions & {
      labelSize?: '4x6' | '4x8';
      includeBarcode?: boolean;
    } = {}
  ): Promise<string> {
    const {
      labelSize = '4x6',
      includeBarcode = true,
      ...qrOptions
    } = options;

    // Generate QR code
    const qrCode = await this.generateDetailedQR(trackingData, {
      ...qrOptions,
      size: 128,
      errorCorrectionLevel: 'H'
    });

    // In a real implementation, you would generate a PDF or HTML label
    // This is a placeholder that returns a data URL for the label image
    const labelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: ${labelSize === '4x6' ? '4in 6in' : '4in 8in'}; margin: 0.25in; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .tracking { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .recipient { margin: 20px 0; }
          .recipient p { margin: 5px 0; }
          .qr-container { text-align: center; margin: 20px 0; }
          .footer { position: absolute; bottom: 20px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">QCS CARGO</div>
          <div class="tracking">${trackingData.trackingNumber}</div>
        </div>

        <div class="recipient">
          <p><strong>To:</strong> ${trackingData.recipientName || 'N/A'}</p>
          <p>${trackingData.destination || 'N/A'}</p>
          ${trackingData.recipientPhone ? `<p>Phone: ${trackingData.recipientPhone}</p>` : ''}
        </div>

        <div class="qr-container">
          <img src="${qrCode}" alt="Tracking QR Code" />
        </div>

        ${trackingData.specialInstructions ?
          `<div class="instructions">
            <p><strong>Special Instructions:</strong></p>
            <p>${trackingData.specialInstructions}</p>
          </div>` : ''
        }

        <div class="footer">
          Generated: ${new Date(trackingData.generatedAt).toLocaleString()}
        </div>
      </body>
      </html>
    `;

    // Convert HTML to image data URL (placeholder)
    // In production, you would use a library like puppeteer or html-to-image
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(labelHtml);
  }
}

// Singleton instance
export const qrCodeGenerator = new QRCodeGenerator();

// Helper functions for common use cases
export const generateTrackingQR = (trackingNumber: string, options?: QRCodeOptions) =>
  qrCodeGenerator.generatePackageQR(trackingNumber, options);

export const generatePackageQRCode = async (
  trackingNumber: string,
  trackingData: Partial<TrackingQRData>
) => {
  const fullTrackingData: TrackingQRData = {
    trackingNumber,
    carrier: 'QCS',
    generatedAt: new Date().toISOString(),
    ...trackingData
  };

  return qrCodeGenerator.generateDetailedQR(fullTrackingData);
};
