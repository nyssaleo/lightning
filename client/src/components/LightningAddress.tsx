import React, { useState } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Zap, 
  AlertTriangle, 
  Info, 
  Send, 
  AtSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/hooks/use-toast';
import { requestInvoice } from '@/lib/lightning';

const LightningAddress: React.FC = () => {
  const { webln, isConnected, connect } = useWebLN();
  const { addTransaction } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  // Form state
  const [lightningAddress, setLightningAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle amount input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };
  
  // Clear the form
  const handleClear = () => {
    setLightningAddress('');
    setAmount('');
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
  
  // Validate Lightning address format
  const isValidLightningAddress = (address: string): boolean => {
    // Basic email-like validation with @ symbol
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address);
  };
  
  // Send payment to Lightning address
  const handlePayToLightningAddress = async () => {
    // Validate inputs
    if (!lightningAddress) {
      toast({
        title: "Missing Lightning Address",
        description: "Please enter a Lightning address",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidLightningAddress(lightningAddress)) {
      toast({
        title: "Invalid Lightning Address",
        description: "Please enter a valid Lightning address (user@domain.com)",
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
      // First, request an invoice from the Lightning address
      const amountSats = parseInt(amount);
      const paymentRequest = await requestInvoice(lightningAddress, amountSats);
      
      // Then pay the invoice using WebLN
      const response = await webln.sendPayment(paymentRequest);
      
      // Add to transaction history
      addTransaction({
        type: 'lightning-address',
        amount: amountSats,
        description: `Payment to ${lightningAddress}`,
        status: 'success',
        preimage: response.preimage,
        paymentRequest,
      });
      
      // Show success notification
      toast({
        title: "Payment Sent",
        description: `Successfully paid ${amountSats} sats to ${lightningAddress}`,
      });
      
      // Clear form
      handleClear();
    } catch (error) {
      console.error('Lightning address payment error:', error);
      
      // Add failed transaction to history
      addTransaction({
        type: 'lightning-address',
        amount: parseInt(amount),
        description: `Failed payment to ${lightningAddress}`,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Show error notification
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process Lightning address payment",
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
          <AtSign className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Lightning Address
        </CardTitle>
        <CardDescription>
          Send payment to a Lightning address
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lightning Address input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="ln-address" className="flex items-center gap-1">
              <span>Lightning Address</span>
              <LightningTooltip
                content="A user-friendly Lightning address format (e.g., user@domain.com)"
              >
                <span className="text-xs text-muted-foreground">(user@domain.com)</span>
              </LightningTooltip>
            </Label>
          </div>
          
          <Input
            id="ln-address"
            placeholder="satoshi@domain.com"
            value={lightningAddress}
            onChange={(e) => setLightningAddress(e.target.value.trim())}
          />
          
          {lightningAddress && !isValidLightningAddress(lightningAddress) && (
            <div className="text-red-500 flex items-start gap-1.5 text-sm mt-1.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Invalid Lightning address format. Please enter a valid format like user@domain.com</span>
            </div>
          )}
        </div>
        
        {/* Amount input */}
        <div className="space-y-2">
          <Label htmlFor="ln-address-amount">Amount (sats)</Label>
          <div className="relative">
            <Input
              id="ln-address-amount"
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
        
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
          <div className="flex gap-2 text-indigo-800 dark:text-indigo-200">
            <Info className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Lightning Address Info</p>
              <p className="text-xs mt-1">
                Lightning addresses provide a simple username@domain format for payments, similar to email addresses, making it easier to pay compared to traditional invoices.
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
            onClick={handlePayToLightningAddress}
            disabled={!lightningAddress || !amount || isProcessing || !isValidLightningAddress(lightningAddress)}
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
                Send Payment
              </>
            )}
          </Button>
        )}
        
        <div className="text-center w-full text-xs text-muted-foreground flex items-center justify-center">
          <Info className="h-3 w-3 mr-1.5" />
          Lightning addresses work like email addresses for Bitcoin payments
        </div>
      </CardFooter>
    </Card>
  );
};

export default LightningAddress;