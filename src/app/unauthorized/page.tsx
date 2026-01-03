'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MOCARDS</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>

            {user ? (
              <p className="text-sm text-gray-500">
                Signed in as: {user.email}
              </p>
            ) : null}

            <div className="space-y-2">
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>

              {user && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}