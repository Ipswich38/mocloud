'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase';

function AuthCallbackContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/dashboard';

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setError(error.message);
          } else {
            setSuccess(true);
            // Small delay to show success message
            setTimeout(() => {
              router.push(next);
            }, 2000);
          }
        } else {
          setError('No authorization code found');
        }
      } catch (err) {
        setError('An unexpected error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MOCARDS</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {loading ? 'Confirming your account...' : 'Account Confirmation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Please wait...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>
                  Your account has been confirmed successfully! Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}