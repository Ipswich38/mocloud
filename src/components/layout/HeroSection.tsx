import { CreditCard, Shield, Clock, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            <span className="block">MOCARDS</span>
            <span className="block text-blue-600">Dental Benefits Made Simple</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Digital dental benefits management. Look up cards, book appointments.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Card Lookup</h3>
            <p className="mt-2 text-sm text-gray-600">Access your benefits instantly</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure</h3>
            <p className="mt-2 text-sm text-gray-600">Protected data and privacy</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Appointments</h3>
            <p className="mt-2 text-sm text-gray-600">Book with clinics directly</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Wide Coverage</h3>
            <p className="mt-2 text-sm text-gray-600">Multiple regions supported</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Enter your card code below
          </p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <span>Format:</span>
            <span className="bg-gray-100 px-2 py-1 rounded font-mono">MC1234567890</span>
          </div>
        </div>
      </div>
    </div>
  );
}