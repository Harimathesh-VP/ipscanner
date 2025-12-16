'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ApiKeys = { [key: string]: string };

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  setApiKey: (serviceId: string, key: string) => void;
  lookupCount: number;
  incrementLookupCount: () => void;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [lookupCount, setLookupCount] = useState(0);

  const setApiKey = (serviceId: string, key: string) => {
    setApiKeys((prev) => ({ ...prev, [serviceId]: key }));
  };

  const incrementLookupCount = useCallback(() => {
    setLookupCount((prev) => prev + 1);
  }, []);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, setApiKey, lookupCount, incrementLookupCount }}>
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
