'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ApiKeys = { [key: string]: string };

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  setApiKey: (serviceId: string, key: string) => void;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});

  const setApiKey = (serviceId: string, key: string) => {
    setApiKeys((prev) => ({ ...prev, [serviceId]: key }));
  };

  return (
    <ApiKeysContext.Provider value={{ apiKeys, setApiKey }}>
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
