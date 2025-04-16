/**
 * Utility functions for working with WebLN
 */

/**
 * Check if WebLN is available in the browser
 */
export const isWebLNAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.webln;
};

/**
 * Get the WebLN provider if available
 */
export const getWebLNProvider = (): any | null => {
  if (isWebLNAvailable()) {
    return window.webln;
  }
  return null;
};

/**
 * Enable the WebLN provider
 */
export const enableWebLN = async (): Promise<any> => {
  const provider = getWebLNProvider();
  if (!provider) {
    throw new Error('WebLN provider not available');
  }
  
  try {
    await provider.enable();
    return provider;
  } catch (error) {
    console.error('Failed to enable WebLN provider:', error);
    throw error;
  }
};

/**
 * Format satoshi amount for display
 */
export const formatSats = (sats: number): string => {
  if (sats >= 1_000_000) {
    return `${(sats / 1_000_000).toFixed(2)}M sats`;
  } else if (sats >= 1_000) {
    return `${(sats / 1_000).toFixed(2)}k sats`;
  } else {
    return `${sats} sats`;
  }
};

/**
 * Convert millisats to sats
 */
export const msatToSat = (msat: number): number => {
  return Math.floor(msat / 1000);
};

/**
 * Format Lightning node pubkey for display
 */
export const formatPubkey = (pubkey: string, length = 12): string => {
  if (!pubkey || pubkey.length < length * 2) {
    return pubkey || '';
  }
  
  const start = pubkey.substring(0, length);
  const end = pubkey.substring(pubkey.length - length);
  return `${start}...${end}`;
};