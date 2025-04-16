import React, { useState } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Zap, 
  AlertTriangle, 
  Info, 
  Receipt, 
  Copy, 
  CheckCheck, 
  QrCode
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
import { generateQRCode } from '@/lib/lightning';

const MakeInvoice: React.FC = () => {
  const { webln, isConnected, connect } = useWebLN();
  const { addTransaction } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Handle amount input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };
  
  // Clear the form
  const handleClear = () => {
    setAmount('');
    setMemo('');
    setPaymentRequest('');
    setQrCodeData(null);
    setIsCopied(false);
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
  
  // Generate invoice
  const handleGenerateInvoice = async () => {
    // Validate inputs
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
    
    setIsGenerating(true);
    
    try {
      // Generate invoice using WebLN
      const response = await webln.makeInvoice({
        amount: parseInt(amount),
        defaultMemo: memo || 'Lightning Invoice'
      });
      
      // Set the payment request
      setPaymentRequest(response.paymentRequest);
      
      // Generate QR code
      try {
        const qrCode = await generateQRCode(`lightning:${response.paymentRequest}`);
        setQrCodeData(qrCode);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
      
      // Add to transaction history
      addTransaction({
        type: 'invoice',
        amount: parseInt(amount),
        description: memo || 'Created Lightning invoice',
        status: 'pending',
        paymentRequest: response.paymentRequest,
      });
      
      // Show success notification
      toast({
        title: "Invoice Created",
        description: `Created an invoice for ${amount} sats`,
      });
    } catch (error) {
      console.error('Invoice generation error:', error);
      
      // Show error notification
      toast({
        title: "Invoice Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Copy payment request to clipboard
  const handleCopyInvoice = () => {
    if (!paymentRequest) return;
    
    navigator.clipboard.writeText(paymentRequest).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "Invoice copied to clipboard",
      });
      
      // Reset copy status after 3 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    });
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Receipt className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Create Invoice
        </CardTitle>
        <CardDescription>
          Generate a Lightning invoice to receive payment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!paymentRequest ? (
          <>
            {/* Amount input */}
            <div className="space-y-2">
              <Label htmlFor="invoice-amount">Amount (sats)</Label>
              <div className="relative">
                <Input
                  id="invoice-amount"
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
            
            {/* Memo input (optional) */}
            <div className="space-y-2">
              <Label htmlFor="invoice-memo" className="flex items-center">
                <span>Memo</span>
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="invoice-memo"
                placeholder="What's this payment for?"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            {/* Display invoice and QR code */}
            <div className="space-y-4">
              {/* QR Code */}
              {qrCodeData && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    <img 
                      src={qrCodeData} 
                      alt="Lightning Invoice QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}
              
              {/* Payment Amount */}
              <div className="text-center">
                <div className="flex justify-center items-center gap-1 text-lg font-medium">
                  <Zap className="h-4 w-4 text-bitcoin-orange" />
                  <span>{amount} sats</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatSatsToFiat(parseInt(amount))}
                </div>
              </div>
              
              {/* Payment Request */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="payment-request">
                    Payment Request
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyInvoice}
                    className="h-6"
                  >
                    {isCopied ? (
                      <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <Input
                  id="payment-request"
                  value={paymentRequest}
                  readOnly
                  className="font-mono text-xs"
                />
              </div>
              
              {/* Reset button */}
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="w-full"
                >
                  Create New Invoice
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {!paymentRequest && (
          <>
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
                onClick={handleGenerateInvoice}
                disabled={!amount || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-pulse">⚡</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </>
                )}
              </Button>
            )}
          </>
        )}
        
        <div className="text-center w-full text-xs text-muted-foreground flex items-center justify-center">
          <Info className="h-3 w-3 mr-1.5" />
          {paymentRequest 
            ? "Share this invoice or QR code to receive payment" 
            : "Invoices allow you to receive Lightning payments"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MakeInvoice;