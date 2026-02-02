'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Check, RefreshCw } from 'lucide-react';

interface GmailConnectProps {
  isConnected: boolean;
  connectedEmail: string | null;
}

export function GmailConnect({ isConnected, connectedEmail }: GmailConnectProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const handleConnect = () => {
    window.location.href = '/api/google/auth';
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/google/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();
      setSyncResult({
        imported: result.imported,
        skipped: result.skipped,
      });

      toast.success(`Imported ${result.imported} contacts`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync contacts');
    } finally {
      setSyncing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Connect your Google account to import contacts from Google Contacts.
        </p>
        <Button onClick={handleConnect}>
          Connect Gmail
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-green-700">Connected as {connectedEmail}</span>
      </div>

      {syncResult && (
        <div className="p-3 bg-gray-50 rounded-md text-sm">
          <p>
            <strong>{syncResult.imported}</strong> contacts imported
          </p>
          {syncResult.skipped > 0 && (
            <p className="text-gray-500">
              {syncResult.skipped} duplicates skipped
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
    </div>
  );
}
