import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebLNProvider as WebLNProviderType, GetInfoResponse } from '../types/webln';

interface WebLNContextType {
  webln: WebLNProviderType | null;
  isAvailable: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  nodeInfo: GetInfoResponse | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refetchNodeInfo: () => Promise<GetInfoResponse | null>;
}

const WebLNContext = createContext<WebLNContextType>({
  webln: null,
  isAvailable: false,
  isConnected: false,
  isLoading: true,
  error: null,
  nodeInfo: null,
  connect: async () => {},
  disconnect: () => {},
  refetchNodeInfo: async () => null,
});

export const useWebLN = () => useContext(WebLNContext);

interface WebLNProviderProps {
  children: ReactNode;
}

export const WebLNProvider: React.FC<WebLNProviderProps> = ({ children }) => {
  const [webln, setWebln] = useState<WebLNProviderType | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nodeInfo, setNodeInfo] = useState<GetInfoResponse | null>(null);

  useEffect(() => {
    checkWebLNAvailability();
  }, []);

  const checkWebLNAvailability = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if WebLN is available in the browser
      if (typeof window !== 'undefined' && 'webln' in window) {
        setIsAvailable(true);
        setWebln((window as any).webln);
        
        // Check if already enabled
        if ((window as any).webln.isEnabled) {
          setIsConnected(true);
          await fetchNodeInfo();
        }
      } else {
        setIsAvailable(false);
        setError('WebLN is not available. Please install a compatible wallet (like Alby).');
      }
    } catch (err) {
      setError(`Failed to initialize WebLN: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAvailable) {
        throw new Error('WebLN is not available');
      }
      
      await webln?.enable();
      setIsConnected(true);
      await fetchNodeInfo();
    } catch (err) {
      setError(`Failed to connect to WebLN provider: ${err instanceof Error ? err.message : String(err)}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setNodeInfo(null);
  };

  const fetchNodeInfo = async (): Promise<GetInfoResponse | null> => {
    try {
      if (!webln || !isConnected) return null;
      
      const info = await webln.getInfo();
      setNodeInfo(info);
      return info;
    } catch (err) {
      setError(`Failed to fetch node info: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  const refetchNodeInfo = async (): Promise<GetInfoResponse | null> => {
    return await fetchNodeInfo();
  };

  const value = {
    webln,
    isAvailable,
    isConnected,
    isLoading,
    error,
    nodeInfo,
    connect,
    disconnect,
    refetchNodeInfo
  };

  return (
    <WebLNContext.Provider value={value}>
      {children}
    </WebLNContext.Provider>
  );
};
