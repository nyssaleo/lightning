import React, { useState } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Zap, 
  Share2, 
  AlertTriangle, 
  Info, 
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { formatPubkey } from '@/lib/webln';
import { toast } from '@/hooks/use-toast';

const KeysendPayment: React.FC = () => {
  const { webln, isConnected, connect } = useWebLN();
  const { addTransaction } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  // Form state
  const [nodeId, setNodeId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle amount input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };
  
  // Clear the form
  const handleClear = () => {
    setNodeId('');
    setAmount('');
    setMessage('');
  };
  
  // Connect wallet
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
  
  // Validate node ID
  const isValidNodeId = (pubkey: string): boolean => {
    // Check if it's a 66-character string starting with 0
    return /^0[0-9a-f]{65}$/i.test(pubkey);
  };
  
  // Send keysend payment
  const handleKeysendPayment = async () => {
    // Validate inputs
    if (!nodeId) {
      toast({
        title: "Missing Node ID",
        description: "Please enter a Lightning node pubkey",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidNodeId(nodeId)) {
      toast({
        title: "Invalid Node ID",
        description: "Please enter a valid 66-character Lightning node pubkey",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!isConnected || !webln) {
      toast({
        title: "Not Connected",
        description: "Please connect your Lightning wallet first",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare custom records if message is present
      const customRecords: Record<string, string> = {};
      if (message) {
        customRecords['696969'] = message;
      }
      
      // Send keysend payment using WebLN
      const response = await webln.keysend({
        destination: nodeId,
        amount: parseInt(amount),
        customRecords
      });
      
      // Add to transaction history
      addTransaction({
        type: 'keysend',
        amount: parseInt(amount),
        description: message || `Keysend to ${formatPubkey(nodeId)}`,
        status: 'success',
        preimage: response.preimage,
        destination: nodeId,
      });
      
      // Show success notification
      toast({
        title: "Payment Sent",
        description: `Successfully sent ${amount} sats via Keysend`,
      });
      
      // Clear form
      handleClear();
    } catch (error) {
      console.error('Keysend payment error:', error);
      
      // Add failed transaction to history
      addTransaction({
        type: 'keysend',
        amount: parseInt(amount),
        description: message || `Failed keysend to ${formatPubkey(nodeId)}`,
        status: 'failed',
        destination: nodeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Show error notification
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to send keysend payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Share2 className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Keysend Payment
        </CardTitle>
        <CardDescription>
          Direct payment to a Lightning node
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Node ID input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="node-pubkey" className="flex items-center gap-1">
              <span>Node ID</span>
              <LightningTooltip
                content="The public key of the Lightning node you want to send sats to directly"
              >
                <span className="text-xs text-muted-foreground">(Pubkey)</span>
              </LightningTooltip>
            </Label>
          </div>
          
          <Textarea
            id="node-pubkey"
            placeholder="0248fe..."
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value.trim())}
            className="resize-none font-mono text-sm h-20"
          />
          
          {nodeId && !isValidNodeId(nodeId) && (
            <div className="text-red-500 flex items-start gap-1.5 text-sm mt-1.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Invalid node pubkey format. Please enter a valid 66-character pubkey.</span>
            </div>
          )}
        </div>
        
        {/* Amount input */}
        <div className="space-y-2">
          <Label htmlFor="keysend-amount">Amount (sats)</Label>
          <div className="relative">
            <Input
              id="keysend-amount"
              placeholder="100"
              value={amount}
              onChange={handleAmountChange}
              type="text"
              inputMode="numeric"
            />
            
            {amount && parseInt(amount) > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                {formatSatsToFiat(parseInt(amount))}
              </div>
            )}
          </div>
        </div>
        
        {/* Message input (optional) */}
        <div className="space-y-2">
          <Label htmlFor="keysend-message" className="flex items-center">
            <span>Message</span>
            <span className="text-xs text-muted-foreground ml-1">(optional)</span>
          </Label>
          <Input
            id="keysend-message"
            placeholder="Add an optional message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <div className="flex gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Keysend Info</p>
              <p className="text-xs mt-1">
                Keysend allows direct payments to nodes without requesting an invoice first. The recipient node must support keysend.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {!isConnected ? (
          <Button 
            onClick={handleConnect} 
            className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white"
          >
            <Zap className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        ) : (
          <Button 
            onClick={handleKeysendPayment}
            disabled={!nodeId || !amount || isProcessing || !isValidNodeId(nodeId)}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-pulse">⚡</span>
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Keysend
              </>
            )}
          </Button>
        )}
        
        <div className="text-center w-full text-xs text-muted-foreground flex items-center justify-center">
          <Info className="h-3 w-3 mr-1.5" />
          Keysend works without requiring an invoice from the recipient
        </div>
      </CardFooter>
    </Card>
  );
};

export default KeysendPayment;