import React, { useState } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Zap, 
  Send, 
  AlertTriangle, 
  Info, 
  QrCode, 
  X 
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
import { QRScanner } from '@/components/ui/qr-scanner';
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { toast } from '@/hooks/use-toast';

const SendPayment: React.FC = () => {
  const { webln, isConnected, connect } = useWebLN();
  const { addTransaction } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  // Input state
  const [invoice, setInvoice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Extract and format invoice details
  const invoiceDetails = React.useMemo(() => {
    // Don't try to parse if it's obviously not a valid invoice
    if (!invoice || invoice.length < 20) return null;
    
    try {
      // Check if it's a lightning invoice that starts with "lnbc"
      if (invoice.toLowerCase().startsWith('lnbc')) {
        // Parse basic info from the invoice - in a real app, you'd use a decoder library
        // For this demo, we'll just extract amount if it exists in the invoice
        
        // The 'n' character represents the start of amount info in the BOLT-11 format
        // This is a simplified approximation
        const amountStartIndex = invoice.toLowerCase().indexOf('n');
        if (amountStartIndex > 0) {
          // Try to extract a number after the 'n' 
          const amountStr = invoice.substring(amountStartIndex + 1, amountStartIndex + 10);
          const amountMatch = amountStr.match(/\d+/);
          if (amountMatch) {
            const amount = parseInt(amountMatch[0]);
            return { amount };
          }
        }
        
        // If we couldn't extract the amount, just return a generic object
        return { isInvoice: true };
      }
      return null;
    } catch (error) {
      console.error('Error parsing invoice:', error);
      return null;
    }
  }, [invoice]);
  
  // Clear the form
  const handleClear = () => {
    setInvoice('');
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
  
  // Validate invoice and handle payment
  const handleSendPayment = async () => {
    if (!invoice) {
      toast({
        title: "Missing Invoice",
        description: "Please enter a Lightning invoice",
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
    
    // Clean up the invoice (remove lightning: prefix if present)
    const cleanInvoice = invoice.startsWith('lightning:') 
      ? invoice.substring(10) 
      : invoice;
    
    setIsProcessing(true);
    
    try {
      // Send payment using WebLN
      const response = await webln.sendPayment(cleanInvoice);
      
      // Add to transaction history
      addTransaction({
        type: 'payment',
        amount: invoiceDetails?.amount || 0, // Use extracted amount or default to 0
        description: 'Payment sent via Lightning invoice',
        status: 'success',
        preimage: response.preimage,
        paymentRequest: cleanInvoice,
      });
      
      // Show success notification
      toast({
        title: "Payment Sent",
        description: "Lightning payment was successful",
      });
      
      // Clear form
      handleClear();
    } catch (error) {
      console.error('Payment error:', error);
      
      // Add failed transaction to history
      addTransaction({
        type: 'payment',
        amount: invoiceDetails?.amount || 0,
        description: 'Failed Lightning payment',
        status: 'failed',
        paymentRequest: cleanInvoice,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Show error notification
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to send payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle QR scan success
  const handleQrScanSuccess = (decodedText: string) => {
    // Check if it's a lightning invoice with a lightning: prefix
    if (decodedText.startsWith('lightning:')) {
      setInvoice(decodedText);
    } else if (decodedText.toLowerCase().startsWith('lnbc')) {
      // It's a bare Lightning invoice
      setInvoice(decodedText);
    } else {
      // Unknown format
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code doesn't contain a valid Lightning invoice",
        variant: "destructive",
      });
    }
    setShowQrScanner(false);
  };
  
  // Close QR scanner
  const handleCloseQrScanner = () => {
    setShowQrScanner(false);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Send className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Send Payment
        </CardTitle>
        <CardDescription>
          Pay a Lightning invoice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR scanner (conditionally shown) */}
        {showQrScanner && (
          <div className="relative">
            <QRScanner
              onScan={handleQrScanSuccess}
              onClose={handleCloseQrScanner}
              isOpen={showQrScanner}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-black/90"
              onClick={handleCloseQrScanner}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Invoice input */}
        {!showQrScanner && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="lightning-invoice" className="flex items-center gap-1">
                <span>Lightning Invoice</span>
                <LightningTooltip
                  content="A Lightning invoice starts with 'lnbc' and contains the payment details"
                >
                  <span className="text-xs text-muted-foreground">(BOLT-11)</span>
                </LightningTooltip>
              </Label>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowQrScanner(true)}
                className="h-7 text-xs"
              >
                <QrCode className="h-3.5 w-3.5 mr-1" />
                Scan QR
              </Button>
            </div>
            
            <Textarea
              id="lightning-invoice"
              placeholder="lnbc..."
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              className="resize-none font-mono text-sm h-24"
            />
            
            {invoice && !invoiceDetails && (
              <div className="text-red-500 flex items-start gap-1.5 text-sm mt-1.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Invalid invoice format. Please check and try again.</span>
              </div>
            )}
            
            {invoice && invoiceDetails && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <div className="flex items-center gap-1.5 text-sm">
                  <Zap className="h-4 w-4 text-bitcoin-orange" />
                  <span className="font-medium">Valid Lightning Invoice</span>
                </div>
                
                {invoiceDetails.amount && (
                  <div className="mt-1.5 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <div>
                      <span className="font-medium">{invoiceDetails.amount} sats</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({formatSatsToFiat(invoiceDetails.amount)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
            onClick={handleSendPayment}
            disabled={!invoice || isProcessing || !invoiceDetails}
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
          Lightning payments are instant and have near-zero fees
        </div>
      </CardFooter>
    </Card>
  );
};

export default SendPayment;