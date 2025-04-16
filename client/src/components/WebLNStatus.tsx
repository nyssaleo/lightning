import React from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { formatPubkey } from '@/lib/webln';

interface WebLNStatusProps {
  showLabel?: boolean;
  iconOnly?: boolean;
  iconSize?: number;
  textSize?: string;
  className?: string;
}

const WebLNStatus: React.FC<WebLNStatusProps> = ({
  showLabel = true,
  iconOnly = false,
  iconSize = 16,
  textSize = 'text-sm',
  className = '',
}) => {
  const { isAvailable, isConnected, isLoading, nodeInfo, connect } = useWebLN();
  
  // If WebLN is not available, suggest installing
  if (!isAvailable) {
    return (
      <div className={`flex items-center ${className}`}>
        <XCircle
          className="text-red-500"
          size={iconSize}
        />
        {!iconOnly && (
          <LightningTooltip
            content={
              <div className="space-y-2">
                <p>WebLN not available.</p>
                <p className="text-xs">Please install a Lightning browser extension like Alby.</p>
                <a 
                  href="https://getalby.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-xs mt-1 text-bitcoin-orange underline"
                >
                  Get Alby Extension
                </a>
              </div>
            }
          >
            <span className={`ml-2 ${textSize}`}>WebLN Not Available</span>
          </LightningTooltip>
        )}
      </div>
    );
  }
  
  // If WebLN is loading
  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Loader2
          className="text-bitcoin-orange animate-spin"
          size={iconSize}
        />
        {!iconOnly && (
          <span className={`ml-2 ${textSize}`}>Connecting...</span>
        )}
      </div>
    );
  }
  
  // If WebLN is connected
  if (isConnected) {
    return (
      <div className={`flex items-center ${className}`}>
        <CheckCircle
          className="text-green-500"
          size={iconSize}
        />
        {!iconOnly && (
          <LightningTooltip
            content={
              <div className="space-y-1">
                <p>Connected to {nodeInfo?.alias || 'Lightning wallet'}</p>
                {nodeInfo?.pubkey && (
                  <p className="text-xs font-mono">{formatPubkey(nodeInfo.pubkey, 20)}</p>
                )}
                {nodeInfo?.network && (
                  <p className="text-xs">Network: {nodeInfo.network}</p>
                )}
              </div>
            }
          >
            <span className={`ml-2 ${textSize}`}>
              {showLabel ? 'Connected to ' : ''}
              {nodeInfo?.alias || 'Lightning Wallet'}
            </span>
          </LightningTooltip>
        )}
      </div>
    );
  }
  
  // If WebLN is available but not connected
  return (
    <div 
      className={`flex items-center ${className} cursor-pointer`}
      onClick={() => connect()}
    >
      <Zap
        className="text-bitcoin-orange"
        size={iconSize}
      />
      {!iconOnly && (
        <LightningTooltip
          content="Click to connect to your Lightning wallet"
        >
          <span className={`ml-2 ${textSize}`}>Connect Lightning Wallet</span>
        </LightningTooltip>
      )}
    </div>
  );
};

export default WebLNStatus;