import React from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useWebLN } from '@/contexts/WebLNContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionHistory from '@/components/TransactionHistory';
import WalletInfo from '@/components/WalletInfo';
import SendPayment from '@/components/SendPayment';
import KeysendPayment from '@/components/KeysendPayment';
import MakeInvoice from '@/components/MakeInvoice';
import LightningAddress from '@/components/LightningAddress';
import PayPerScroll from '@/components/PayPerScroll';
import WebLNStatus from '@/components/WebLNStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, Zap, History, Wallet } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { transactions } = useTransactions();
  const { isConnected } = useWebLN();
  
  const successfulTransactions = transactions.filter(tx => tx.status === 'success');
  const totalAmount = successfulTransactions.reduce((total, tx) => total + tx.amount, 0);
  
  // Calculate total by transaction type
  const totalByType: Record<string, number> = {};
  successfulTransactions.forEach(tx => {
    if (!totalByType[tx.type]) {
      totalByType[tx.type] = 0;
    }
    totalByType[tx.type] += tx.amount;
  });
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-bitcoin-orange">⚡</span> Lightning Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Explore WebLN capabilities with this interactive dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WebLNStatus showLabel={true} iconSize={20} />
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <History className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {successfulTransactions.length} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Sats</CardTitle>
            <Bitcoin className="h-4 w-4 text-bitcoin-orange" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalAmount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              across all transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {isConnected ? 
                <span className="text-green-500">Connected</span> : 
                <span className="text-gray-400">Disconnected</span>
              }
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              WebLN provider status
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Lightning Activity</CardTitle>
            <Zap className="h-4 w-4 text-bitcoin-orange" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{Object.keys(totalByType).length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              payment types used
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest Lightning transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory limit={5} showClear={true} />
        </CardContent>
      </Card>
      
      {/* Lightning Features Tabs */}
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto">
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="keysend">Keysend</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="ln-address">Lightning Address</TabsTrigger>
          <TabsTrigger value="pay-scroll">Pay-per-scroll</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Info</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="send">
            <SendPayment />
          </TabsContent>
          
          <TabsContent value="keysend">
            <KeysendPayment />
          </TabsContent>
          
          <TabsContent value="receive">
            <MakeInvoice />
          </TabsContent>
          
          <TabsContent value="ln-address">
            <LightningAddress />
          </TabsContent>
          
          <TabsContent value="pay-scroll">
            <PayPerScroll />
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletInfo />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;