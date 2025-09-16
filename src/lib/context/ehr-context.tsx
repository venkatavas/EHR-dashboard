'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FHIRClient } from '@/lib/api/fhir-client';
import { MockFHIRClient } from '@/lib/api/mock-fhir-client';
import { EHRConfig } from '@/lib/types/fhir';

interface EHRContextType {
  client: FHIRClient | MockFHIRClient | null;
  config: EHRConfig | null;
  isConnected: boolean;
  connectionError: string | null;
  isDemo: boolean;
  connect: (config: EHRConfig) => Promise<boolean>;
  disconnect: () => void;
  testConnection: () => Promise<boolean>;
  switchToDemo: () => void;
}

const EHRContext = createContext<EHRContextType | undefined>(undefined);

export function EHRProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<FHIRClient | MockFHIRClient | null>(null);
  const [config, setConfig] = useState<EHRConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const connect = useCallback(async (newConfig: EHRConfig): Promise<boolean> => {
    try {
      setConnectionError(null);
      setIsDemo(false);

      const newClient = new FHIRClient(newConfig);

      // Test the connection by making a simple request
      const testResult = await newClient.searchPatients({ _count: 1 });

      if (testResult.error) {
        setConnectionError(testResult.error);
        return false;
      }

      setClient(newClient);
      setConfig(newConfig);
      setIsConnected(true);

      // Store config in localStorage for persistence
      localStorage.setItem('ehrConfig', JSON.stringify(newConfig));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      setConnectionError(errorMessage);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setClient(null);
    setConfig(null);
    setIsConnected(false);
    setConnectionError(null);
    setIsDemo(false);
    localStorage.removeItem('ehrConfig');
  }, []);

  const switchToDemo = useCallback(() => {
    const demoConfig: EHRConfig = {
      baseUrl: 'https://demo.ehr-system.com/fhir/r4',
      clientId: 'demo-client',
      clientSecret: 'demo-secret'
    };

    const mockClient = new MockFHIRClient(demoConfig);
    setClient(mockClient);
    setConfig(demoConfig);
    setIsConnected(true);
    setIsDemo(true);
    setConnectionError(null);
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!client) {
      setConnectionError('No client connected');
      return false;
    }

    try {
      const result = await client.searchPatients({ _count: 1 });
      if (result.error) {
        setConnectionError(result.error);
        setIsConnected(false);
        return false;
      }

      setConnectionError(null);
      setIsConnected(true);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setConnectionError(errorMessage);
      setIsConnected(false);
      return false;
    }
  }, [client]);

  const value: EHRContextType = {
    client,
    config,
    isConnected,
    connectionError,
    isDemo,
    connect,
    disconnect,
    testConnection,
    switchToDemo,
  };

  return (
    <EHRContext.Provider value={value}>
      {children}
    </EHRContext.Provider>
  );
}

export function useEHR() {
  const context = useContext(EHRContext);
  if (context === undefined) {
    throw new Error('useEHR must be used within an EHRProvider');
  }
  return context;
}