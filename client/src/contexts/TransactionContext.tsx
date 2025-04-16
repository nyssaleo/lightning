import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Define transaction types for all our operations
export type TransactionType = 
  | 'payment' 
  | 'keysend' 
  | 'invoice' 
  | 'lightning-address' 
  | 'pay-per-scroll';

export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: number;
  status: TransactionStatus;
  preimage?: string;
  destination?: string;
  paymentRequest?: string;
  error?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  clearHistory: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Local storage key
const TX_STORAGE_KEY = 'lightning-txs';

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize transactions from local storage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTxs = localStorage.getItem(TX_STORAGE_KEY);
      return storedTxs ? JSON.parse(storedTxs) : [];
    } catch (error) {
      console.error('Failed to parse transactions from localStorage:', error);
      return [];
    }
  });

  // Save transactions to local storage when updated
  useEffect(() => {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction
  const addTransaction = useCallback((
    newTx: Omit<Transaction, 'id' | 'timestamp'>
  ) => {
    const transaction: Transaction = {
      ...newTx,
      id: generateId(),
      timestamp: Date.now()
    };

    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Get transactions filtered by type
  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactions.filter(tx => tx.type === type);
  }, [transactions]);

  // Get recent transactions with optional limit
  const getRecentTransactions = useCallback((limit = 10) => {
    return transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [transactions]);

  // Clear transaction history
  const clearHistory = useCallback(() => {
    setTransactions([]);
  }, []);

  const value = {
    transactions,
    addTransaction,
    getTransactionsByType,
    getRecentTransactions,
    clearHistory
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  
  return context;
};