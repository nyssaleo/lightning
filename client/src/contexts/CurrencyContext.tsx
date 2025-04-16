import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  SupportedCurrency, 
  formatSatsToFiat as formatSatsToFiatUtil, 
  satsToFiat as satsToFiatUtil 
} from '@/lib/currencyConverter';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  formatSatsToFiat: (sats: number) => string;
  convertSatsToFiat: (sats: number) => number;
}

// Create context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatSatsToFiat: () => '',
  convertSatsToFiat: () => 0,
});

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Default to USD
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  
  // Format sats to fiat with the current currency
  const formatSatsToFiat = (sats: number) => {
    return formatSatsToFiatUtil(sats, currency);
  };
  
  // Convert sats to fiat number with the current currency
  const convertSatsToFiat = (sats: number) => {
    return satsToFiatUtil(sats, currency);
  };
  
  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatSatsToFiat, 
        convertSatsToFiat 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook for using the currency context
export const useCurrency = () => useContext(CurrencyContext);