'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { RequestLog } from '@/lib/types';

type ApiKeys = { [key: string]: string };

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  setApiKey: (serviceId: string, key: string) => void;
  lookupCount: number;
  incrementLookupCount: () => void;
  history: RequestLog[];
  addToHistory: (log: Omit<RequestLog, 'id' | 'date'>) => void;
  clearHistory: () => void;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [lookupCount, setLookupCount] = useState(0);
  const [history, setHistory] = useState<RequestLog[]>([]);

  const setApiKey = (serviceId: string, key: string) => {
    setApiKeys((prev) => ({ ...prev, [serviceId]: key }));
  };

  const incrementLookupCount = useCallback(() => {
    setLookupCount((prev) => prev + 1);
  }, []);

  const addToHistory = useCallback((log: Omit<RequestLog, 'id' | 'date'>) => {
    const newLog: RequestLog = {
      ...log,
      id: new Date().getTime().toString(),
      date: new Date().toISOString(),
    };
    setHistory((prev) => [newLog, ...prev]);
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, setApiKey, lookupCount, incrementLookupCount, history, addToHistory, clearHistory }}>
      {children}
    </ApiKeysContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeysContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
}
