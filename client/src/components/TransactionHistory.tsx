import React, { useState } from 'react';
import { useTransactions, Transaction, TransactionType } from '@/contexts/TransactionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Receipt, 
  Send, 
  AtSign, 
  Scroll, 
  Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LightningTooltip } from '@/components/ui/lightning-tooltip';
import { toast } from '@/hooks/use-toast';

interface TransactionHistoryProps {
  limit?: number;
  showClear?: boolean;
  showFilters?: boolean;
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  limit, 
  showClear = false,
  showFilters = false,
  className = ''
}) => {
  const { transactions, clearHistory } = useTransactions();
  const { formatSatsToFiat } = useCurrency();
  
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  
  // Apply filters to transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesType && matchesStatus;
  });
  
  // Sort by timestamp, newest first
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Apply limit if provided
  const displayedTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  
  // Handle clearing transaction history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      clearHistory();
      toast({
        title: "History Cleared",
        description: "Transaction history has been cleared",
      });
    }
  };
  
  // Format timestamp to human readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get icon for transaction type
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'payment':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'keysend':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'invoice':
        return <Receipt className="h-4 w-4 text-green-500" />;
      case 'lightning-address':
        return <AtSign className="h-4 w-4 text-orange-500" />;
      case 'pay-per-scroll':
        return <Scroll className="h-4 w-4 text-pink-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get badge variant based on transaction status
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Success</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Get display name for transaction type
  const getTransactionTypeName = (type: TransactionType): string => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'keysend':
        return 'Keysend';
      case 'invoice':
        return 'Invoice';
      case 'lightning-address':
        return 'Lightning Address';
      case 'pay-per-scroll':
        return 'Pay-per-scroll';
      default:
        return type;
    }
  };
  
  return (
    <div className={className}>
      {showFilters && transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Filter by type</p>
            <Select 
              value={typeFilter} 
              onValueChange={(value) => setTypeFilter(value as TransactionType | 'all')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="keysend">Keysend</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="lightning-address">Lightning Address</SelectItem>
                <SelectItem value="pay-per-scroll">Pay-per-scroll</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Filter by status</p>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as 'all' | 'success' | 'failed' | 'pending')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showClear && (
            <div className="flex-none flex items-end">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:hover:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      )}
      
      {!showFilters && showClear && transactions.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:hover:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
            Clear History
          </Button>
        </div>
      )}
      
      {displayedTransactions.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {getTransactionIcon(tx.type)}
                      <LightningTooltip content={getTransactionTypeName(tx.type)}>
                        <span className="text-xs">{tx.type.substring(0, 3).toUpperCase()}</span>
                      </LightningTooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="truncate max-w-[180px] md:max-w-xs">
                      {tx.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">{tx.amount} sats</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatSatsToFiat(tx.amount)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(tx.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <LightningTooltip content={formatTimestamp(tx.timestamp)}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                    </LightningTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-md">
          {transactions.length > 0 ? (
            <div>
              <Filter className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No transactions match your filters</p>
            </div>
          ) : (
            <div>
              <Zap className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No transaction history yet</p>
            </div>
          )}
        </div>
      )}
      
      {limit && sortedTransactions.length > limit && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {displayedTransactions.length} of {sortedTransactions.length} transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;