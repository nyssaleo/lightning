import React, { useState, useEffect } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw, Users, Wallet, Network, Info } from 'lucide-react';
import { formatPubkey } from '@/lib/webln';
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { toast } from '@/hooks/use-toast';

const WalletInfo: React.FC = () => {
  const { webln, isConnected, connect, isLoading, nodeInfo, refetchNodeInfo } = useWebLN();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh node info every 60 seconds if connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refetchNodeInfo().catch(console.error);
    }, 60000);

    return () => clearInterval(interval);
  }, [isConnected, refetchNodeInfo]);

  // Handle manual refresh of node info
  const handleRefresh = async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    try {
      await refetchNodeInfo();
      toast({
        title: "Updated",
        description: "Wallet information refreshed"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to refresh wallet info",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Connected",
        description: "Successfully connected to Lightning wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Wallet Info
        </CardTitle>
        <CardDescription>
          Details about your connected Lightning wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Zap className="h-8 w-8 text-bitcoin-orange animate-pulse mb-4" />
                <p className="text-center text-gray-500 dark:text-gray-400">Loading wallet information...</p>
              </div>
            ) : nodeInfo ? (
              <div className="space-y-3">
                {/* Wallet alias */}
                {nodeInfo.alias && (
                  <div className="flex justify-between items-start pb-2 border-b dark:border-gray-800">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 text-bitcoin-orange mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Alias</span>
                    </div>
                    <span className="font-medium text-sm">{nodeInfo.alias}</span>
                  </div>
                )}
                
                {/* Node public key */}
                {nodeInfo.pubkey && (
                  <div className="flex justify-between items-start pb-2 border-b dark:border-gray-800">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-bitcoin-orange mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Public Key</span>
                    </div>
                    <LightningTooltip content={nodeInfo.pubkey} side="left">
                      <span className="font-mono text-sm">{formatPubkey(nodeInfo.pubkey)}</span>
                    </LightningTooltip>
                  </div>
                )}
                
                {/* Network */}
                {nodeInfo.network && (
                  <div className="flex justify-between items-start pb-2 border-b dark:border-gray-800">
                    <div className="flex items-center">
                      <Network className="h-4 w-4 text-bitcoin-orange mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
                    </div>
                    <span className="font-medium text-sm">{nodeInfo.network}</span>
                  </div>
                )}
                
                {/* Connected peers */}
                {nodeInfo.numPeers !== undefined && (
                  <div className="flex justify-between items-start pb-2 border-b dark:border-gray-800">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-bitcoin-orange mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Connected Peers</span>
                    </div>
                    <span className="font-medium text-sm">{nodeInfo.numPeers}</span>
                  </div>
                )}
                
                {/* Block height */}
                {nodeInfo.blockHeight !== undefined && (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-bitcoin-orange mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Block Height</span>
                    </div>
                    <span className="font-medium text-sm">{nodeInfo.blockHeight.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Info'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No wallet information available
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Info'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Zap className="h-8 w-8 text-bitcoin-orange mb-4" />
            <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
              Connect your wallet to view node information
            </p>
            <Button
              onClick={handleConnect}
              className="bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletInfo;