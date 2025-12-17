'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { RequestLog } from '@/lib/types';

type ApiKeys = { [key: string]: string };

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  setApiKey: (serviceId: string, key: string) => void;
  removeApiKey: (serviceId: string) => void;
  lookupCount: number;
  incrementLookupCount: () => void;
  history: RequestLog[];
  addToHistory: (log: Omit<RequestLog, 'id' | 'date'> | RequestLog) => void;
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
  
  const removeApiKey = (serviceId: string) => {
    setApiKeys((prev) => {
        const newKeys = {...prev};
        delete newKeys[serviceId];
        return newKeys;
    });
  }

  const incrementLookupCount = useCallback(() => {
    setLookupCount((prev) => prev + 1);
  }, []);

  const addToHistory = useCallback((log: Omit<RequestLog, 'id' | 'date'> | RequestLog) => {
    // If the log already has an ID, it's being imported.
    if ('id' in log) {
      setHistory((prev) => [log as RequestLog, ...prev]);
      return;
    }
    
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
    <ApiKeysContext.Provider value={{ apiKeys, setApiKey, removeApiKey, lookupCount, incrementLookupCount, history, addToHistory, clearHistory }}>
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
