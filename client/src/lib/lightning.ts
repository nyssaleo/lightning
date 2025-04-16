import QRCode from 'qrcode';

/**
 * Interface for LNURL response data returned when requesting payment info from a Lightning address
 */
interface LnurlResponseData {
  tag: string;
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata: string;
}

/**
 * Interface for invoice response data returned when requesting a specific invoice
 */
interface InvoiceResponseData {
  pr: string;
}

/**
 * Parse a Lightning Address and request an invoice
 * @param lightningAddress The lightning address (e.g. user@domain.com)
 * @param amountSats Amount in satoshis to request
 * @returns Payment request string
 */
export async function requestInvoice(lightningAddress: string, amountSats: number): Promise<string> {
  try {
    // Parse the Lightning Address into username and domain
    const [username, domain] = lightningAddress.split('@');
    
    if (!username || !domain) {
      throw new Error('Invalid lightning address format');
    }
    
    // Step 1: Fetch the LNURL data from the Lightning Address
    const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;
    const lnurlResponse = await fetch(lnurlEndpoint);
    
    if (!lnurlResponse.ok) {
      throw new Error(`Failed to resolve Lightning Address: ${lnurlResponse.statusText}`);
    }
    
    const lnurlData: LnurlResponseData = await lnurlResponse.json();
    
    // Verify this is a payment LNURL
    if (lnurlData.tag !== 'payRequest') {
      throw new Error('Lightning Address does not support payments');
    }
    
    // Validate amount is within allowed range
    if (amountSats * 1000 < lnurlData.minSendable) {
      throw new Error(`Amount too small. Minimum is ${lnurlData.minSendable / 1000} sats`);
    }
    
    if (amountSats * 1000 > lnurlData.maxSendable) {
      throw new Error(`Amount too large. Maximum is ${lnurlData.maxSendable / 1000} sats`);
    }
    
    // Step 2: Request an invoice with the specified amount
    const callbackUrl = new URL(lnurlData.callback);
    callbackUrl.searchParams.append('amount', (amountSats * 1000).toString());
    
    // You can optionally add a comment if the endpoint supports it
    if (callbackUrl.searchParams.has('comment')) {
      callbackUrl.searchParams.append('comment', `Payment to ${lightningAddress}`);
    }
    
    const invoiceResponse = await fetch(callbackUrl.toString());
    
    if (!invoiceResponse.ok) {
      throw new Error(`Failed to get invoice: ${invoiceResponse.statusText}`);
    }
    
    const invoiceData: InvoiceResponseData = await invoiceResponse.json();
    
    if (!invoiceData.pr) {
      throw new Error('No payment request returned');
    }
    
    return invoiceData.pr;
  } catch (error) {
    console.error('Error requesting invoice:', error);
    throw error;
  }
}

/**
 * Generate a QR code from data
 * @param data Data to encode in QR code
 * @returns Base64 encoded image string
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}