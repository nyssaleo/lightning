/**
 * This module provides currency conversion utilities for satoshi to fiat
 * For a production app, these would connect to a real exchange rate API
 */

export type SupportedCurrency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CAD' | 'AUD';

// Constants
const SATS_PER_BTC = 100_000_000;
const BTC_PRICE_USD = 65000; // Mock BTC price in USD

// Exchange rates relative to USD
const fiatRates = {
  USD: 1.0,
  EUR: 0.93,
  JPY: 155.42,
  GBP: 0.8,
  CAD: 1.36,
  AUD: 1.52
};

/**
 * Convert satoshis to BTC
 */
export const satsToBtc = (sats: number): number => {
  return sats / SATS_PER_BTC;
};

/**
 * Currency symbols for formatting
 */
export const currencySymbols: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$'
};

/**
 * Convert satoshis to fiat currency
 * @param sats Amount in satoshis
 * @param currency Target fiat currency
 * @returns Converted amount in specified fiat currency
 */
export const satsToFiat = (sats: number, currency: SupportedCurrency = 'USD'): number => {
  const btcAmount = satsToBtc(sats);
  const usdAmount = btcAmount * BTC_PRICE_USD;
  const exchangeRate = fiatRates[currency] || 1;
  
  return usdAmount * exchangeRate;
};

/**
 * Format satoshi amount to fiat with proper currency symbol and decimals
 * @param sats Amount in satoshis
 * @param currency Target fiat currency
 * @param decimals Number of decimal places
 * @returns Formatted string with currency symbol
 */
export const formatSatsToFiat = (
  sats: number, 
  currency: SupportedCurrency = 'USD', 
  decimals = 2
): string => {
  const fiatAmount = satsToFiat(sats, currency);
  const symbol = currencySymbols[currency];
  
  // Handle special case for JPY (no decimals)
  if (currency === 'JPY') {
    return `${symbol}${Math.round(fiatAmount)}`;
  }
  
  return `${symbol}${fiatAmount.toFixed(decimals)}`;
};

/**
 * Format satoshis to a human-readable string
 * @param sats Amount in satoshis
 * @returns Formatted string
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