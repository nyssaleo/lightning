import React, { useState, useEffect, useRef } from 'react';
import { useWebLN } from '@/contexts/WebLNContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Zap, 
  Scroll, 
  LockIcon, 
  UnlockIcon, 
  BarChart3, 
  Info,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Define the ScrollPayment type for storing payment history
type ScrollPayment = {
  section: number;
  amount: number;
  timestamp: number;
};

const PayPerScroll: React.FC = () => {
  const { webln, isConnected, connect } = useWebLN();
  const { addTransaction } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  // Component state
  const [isPaying, setIsPaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [scrolledSections, setScrolledSections] = useState<number[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [sectionScrollPercent, setSectionScrollPercent] = useState(0);
  const [scrollPayments, setScrollPayments] = useState<ScrollPayment[]>([]);
  
  // References
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const SECTION_COUNT = 5;
  const SATS_PER_SECTION = 1;
  
  // Set up the scrollable content when component mounts
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [contentRef]);
  
  // Handle scroll events
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleScroll = () => {
      if (!container || !contentRef.current) return;
      
      const { scrollTop, clientHeight } = container;
      const scrollHeight = contentRef.current.scrollHeight;
      
      // Calculate progress for UI
      const scrollPercent = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
      setSectionScrollPercent(scrollPercent);
      
      // Calculate which section the user has scrolled to
      const sectionHeight = scrollHeight / SECTION_COUNT;
      const currentSection = Math.floor((scrollTop + clientHeight) / sectionHeight);
      
      // If user scrolled to a new section that hasn't been paid for yet, process payment
      if (
        currentSection > 0 && 
        currentSection <= SECTION_COUNT && 
        !scrolledSections.includes(currentSection)
      ) {
        processPayment(currentSection);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isActive, scrolledSections]);
  
  // Process micropayment for a section
  const processPayment = async (section: number) => {
    if (isPaying || !webln || !isConnected) return;
    
    setIsPaying(true);
    
    try {
      // Use keysend to make a direct payment
      const response = await webln.keysend({
        destination: '023d70f2f76d283c6c4e58109ee3ad2031b727fdd507a8d6059ef8c779c5d357aa', // Demo node pubkey
        amount: SATS_PER_SECTION,
        customRecords: {
          '696969': `Paid for section ${section} of the pay-per-scroll demo`
        }
      });
      
      // Record the payment
      const newPayment: ScrollPayment = {
        section,
        amount: SATS_PER_SECTION,
        timestamp: Date.now()
      };
      
      // Update state with new payment
      setScrolledSections(prev => [...prev, section]);
      setScrollPayments(prev => [...prev, newPayment]);
      setTotalPaid(prev => prev + SATS_PER_SECTION);
      
      // Add to global transaction history
      addTransaction({
        type: 'pay-per-scroll',
        amount: SATS_PER_SECTION,
        description: `Paid ${SATS_PER_SECTION} sats for content section ${section}`,
        status: 'success',
        preimage: response.preimage
      });
      
      // Show success notification
      toast({
        title: 'Section Unlocked',
        description: `Paid ${SATS_PER_SECTION} sats to unlock section ${section}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Payment error:', error);
      
      // Add failed transaction to history
      addTransaction({
        type: 'pay-per-scroll',
        amount: SATS_PER_SECTION,
        description: `Failed payment for content section ${section}`,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Show error notification
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to make payment',
        variant: 'destructive'
      });
    } finally {
      setIsPaying(false);
    }
  };
  
  // Toggle the scroll payment feature
  const toggleScrollPayment = async () => {
    if (!isConnected) {
      try {
        await connect();
        toast({
          title: 'Connected',
          description: 'Successfully connected to Lightning wallet',
        });
        setIsActive(true);
      } catch (error) {
        toast({
          title: 'Connection Failed',
          description: error instanceof Error ? error.message : 'Failed to connect to wallet',
          variant: 'destructive',
        });
      }
    } else {
      setIsActive(!isActive);
      
      if (!isActive) {
        toast({
          title: 'Pay-per-scroll Activated',
          description: `You'll pay ${SATS_PER_SECTION} sat each time you reveal new content`,
        });
      }
    }
  };
  
  // Reset the demo
  const resetDemo = () => {
    setIsActive(false);
    setScrolledSections([]);
    setTotalPaid(0);
    setScrollPayments([]);
    setSectionScrollPercent(0);
    
    // Reset scroll position
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    
    toast({
      title: 'Demo Reset',
      description: 'The pay-per-scroll demo has been reset',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Scroll className="mr-2 h-5 w-5 text-bitcoin-orange" />
          Pay-per-scroll
        </CardTitle>
        <CardDescription>
          Micropayments as you read content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pay as you scroll</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {SATS_PER_SECTION} sat per section, {SECTION_COUNT} sections total
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
                Inactive
              </Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleScrollPayment}
              disabled={!webln && !isConnected}
              className={isActive ? "border-red-200 text-red-700" : "border-green-200 text-green-700"}
            >
              {isActive ? (
                <>
                  <LockIcon className="h-3 w-3 mr-1.5" />
                  Disable
                </>
              ) : (
                <>
                  <UnlockIcon className="h-3 w-3 mr-1.5" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-light" 
            style={{ 
              width: `${sectionScrollPercent}%`,
              transition: 'width 0.3s ease-out'
            }}
          ></div>
        </div>
        
        {/* Payment Stats */}
        <div className="flex justify-between py-2 px-1">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unlocked Sections</p>
            <p className="font-medium">{scrolledSections.length} / {SECTION_COUNT}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
            <div className="font-medium flex items-center">
              <span>{totalPaid} sats</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({formatSatsToFiat(totalPaid)})
              </span>
            </div>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className={`relative h-56 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4 ${
            isActive ? 'scrollbar-thin' : 'overflow-hidden'
          }`}
        >
          {!isActive && (
            <div className="absolute inset-0 backdrop-blur-sm bg-gray-100/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10">
              <LockIcon className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-center text-gray-700 dark:text-gray-300 font-medium mb-1">
                Content Locked
              </p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-xs">
                Enable pay-per-scroll to read content and pay tiny amounts as you go
              </p>
              <ArrowDown className="h-5 w-5 text-bitcoin-orange animate-bounce" />
            </div>
          )}
          
          <div ref={contentRef} className="space-y-4">
            <h3 className="font-bold text-lg">Bitcoin: A Peer-to-Peer Electronic Cash System</h3>
            <p className="text-sm">
              Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments. While the system works well enough for most transactions, it still suffers from the inherent weaknesses of the trust based model.
            </p>
            <p className="text-sm">
              Completely non-reversible transactions are not really possible, since financial institutions cannot avoid mediating disputes. The cost of mediation increases transaction costs, limiting the minimum practical transaction size and cutting off the possibility for small casual transactions.
            </p>
            <p className="text-sm">
              With the possibility of reversal, the need for trust spreads. Merchants must be wary of their customers, hassling them for more information than they would otherwise need. A certain percentage of fraud is accepted as unavoidable.
            </p>
            <p className="text-sm">
              These costs and payment uncertainties can be avoided in person by using physical currency, but no mechanism exists to make payments over a communications channel without a trusted party.
            </p>
            <p className="text-sm">
              What is needed is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party.
            </p>
            <p className="text-sm">
              Transactions that are computationally impractical to reverse would protect sellers from fraud, and routine escrow mechanisms could easily be implemented to protect buyers.
            </p>
            <p className="text-sm">
              In this paper, we propose a solution to the double-spending problem using a peer-to-peer distributed timestamp server to generate computational proof of the chronological order of transactions.
            </p>
            <p className="text-sm">
              The system is secure as long as honest nodes collectively control more CPU power than any cooperating group of attacker nodes.
            </p>
          </div>
        </div>
        
        {/* Scroll Payments Log */}
        {scrollPayments.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <BarChart3 className="h-3 w-3 text-bitcoin-orange mr-1" />
                Payment History
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetDemo}
                className="h-6 text-xs"
              >
                Reset Demo
              </Button>
            </div>
            <div className="max-h-28 overflow-y-auto text-xs space-y-1 scrollbar-thin">
              {scrollPayments.map((payment, index) => (
                <div key={index} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400">Section {payment.section}</span>
                  <div className="flex items-center">
                    <span className="font-medium">{payment.amount} sats</span>
                    <span className="text-gray-400 dark:text-gray-500 ml-1">
                      ({new Date(payment.timestamp).toLocaleTimeString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 w-full flex items-center justify-center">
          <Info className="h-3 w-3 mr-1.5" />
          Pay-per-scroll enables micropayments for content consumption
        </p>
      </CardFooter>
    </Card>
  );
};

export default PayPerScroll;