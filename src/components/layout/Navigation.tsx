'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Building2,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Card Lookup', href: '/', icon: CreditCard, public: true },
    { name: 'Clinic Portal', href: '/clinic', icon: Building2, role: ['clinic', 'admin'] },
    { name: 'Admin Portal', href: '/admin', icon: Settings, role: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true;
    if (!user || !profile) return false;
    return item.role?.includes(profile.role);
  });

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MOCARDS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user.email}
                    {profile?.role && (
                      <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        {profile.role}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t pt-4 pb-4">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t mt-4 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    {profile?.role && (
                      <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/signin" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}