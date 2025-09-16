'use client';

import { useEHR } from '@/lib/context/ehr-context';
import { ConnectionSetup } from '@/components/ui/connection-setup';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  const { isConnected } = useEHR();

  return (
    <div className="min-h-screen bg-gray-50">
      {!isConnected ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <ConnectionSetup />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
