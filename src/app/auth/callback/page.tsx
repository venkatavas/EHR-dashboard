'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useEHR } from '@/lib/context/ehr-context';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connect } = useEHR();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/auth/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange authorization code for token');
        }

        const tokenData = await tokenResponse.json();

        // Connect with the access token
        await connect({
          baseUrl: process.env.NEXT_PUBLIC_EHR_BASE_URL || '',
          clientId: '',
          clientSecret: '',
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
        });

        setStatus('success');
        setMessage('Successfully connected to EHR system!');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, connect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            EHR Authentication
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your authentication...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            {status === 'success' && (
              <p className="text-xs text-gray-500">
                Redirecting to dashboard in a moment...
              </p>
            )}
            {status === 'error' && (
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Return to connection setup
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}