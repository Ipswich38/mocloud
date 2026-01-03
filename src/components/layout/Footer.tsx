import { CreditCard } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MOCARDS</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Digital dental benefits management system. Simple, fast, secure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Links
            </h3>
            <div className="mt-4 space-y-2">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Card Lookup
              </Link>
              <Link
                href="/clinic"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Clinic Portal
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Legal
            </h3>
            <div className="mt-4 space-y-2">
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            &copy; 2026 MOCARDS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}