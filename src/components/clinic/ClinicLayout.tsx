'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Calendar,
  Home,
  Search,
  Menu,
  X,
  LogOut,
  Building
} from 'lucide-react';

interface ClinicLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/clinic', icon: Home },
  { name: 'Cards', href: '/clinic/cards', icon: CreditCard },
  { name: 'Appointments', href: '/clinic/appointments', icon: Calendar },
  { name: 'Card Lookup', href: '/', icon: Search },
];

export function ClinicLayout({ children }: ClinicLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-900">MOCARDS</h1>
                <p className="text-sm text-gray-600">Clinic Portal</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 px-4 py-4">
              <div className="text-sm text-gray-500 mb-2">
                Signed in as: {user?.email}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Role: Clinic Staff
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MOCARDS</h1>
                <p className="text-sm text-gray-600">Clinic Portal</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-500 mb-2">
              Signed in as: {user?.email}
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Role: Clinic Staff
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">MOCARDS</h1>
              <p className="text-sm text-gray-600">Clinic Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}