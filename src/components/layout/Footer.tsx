import { CreditCard, Mail, Phone } from 'lucide-react';
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
              Streamlined dental benefits card management system for clinics and patients
              across the Philippines. Making dental care more accessible and organized.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@mocards.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+63 (2) 8123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Quick Links
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
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Support
            </h3>
            <div className="mt-4 space-y-2">
              <Link
                href="/help"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 text-sm block"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              <p>&copy; 2024 MOCARDS. All rights reserved.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-600">
                Serving dental clinics across Cavite, Batangas, Laguna, and MIMAROPA
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}