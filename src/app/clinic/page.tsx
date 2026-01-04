'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicLayout } from '@/components/clinic/ClinicLayout';
import {
  Users,
  CreditCard,
  Calendar,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ClinicStats {
  totalCards: number;
  activeCards: number;
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  perksRedeemed: number;
  monthlyStats: {
    cardsGenerated: number;
    appointmentsBooked: number;
  };
}

export default function ClinicDashboard() {
  const { user, profile, loading } = useAuth();

  // Redirect non-clinic users
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'clinic')) {
      window.location.href = '/auth/signin';
    }
  }, [user, profile, loading]);

  // Mock stats for clinic dashboard
  const [stats] = useState<ClinicStats>({
    totalCards: 284,
    activeCards: 267,
    totalAppointments: 156,
    pendingAppointments: 12,
    todayAppointments: 5,
    perksRedeemed: 89,
    monthlyStats: {
      cardsGenerated: 45,
      appointmentsBooked: 28
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clinic dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'clinic') {
    return null; // Will redirect
  }

  return (
    <ClinicLayout>
      <div className="space-y-8">
        {/* Apple-style welcome header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">Clinic Dashboard</h1>
          <p className="text-lg text-gray-500 font-medium">
            Welcome back, {profile?.clinic_name || profile?.display_name}
          </p>
          <p className="text-base text-gray-400 mt-1">Here's your overview for today</p>
        </div>

        {/* Apple-style metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="apple-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-3 mx-auto">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-blue-600 mb-1">
              {stats.totalCards}
            </div>
            <div className="text-sm font-medium text-gray-500 mb-1">Total Cards</div>
            <div className="text-xs text-gray-400">
              {stats.activeCards} active
            </div>
          </div>

          <div className="apple-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-3 mx-auto">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-green-600 mb-1">
              {stats.todayAppointments}
            </div>
            <div className="text-sm font-medium text-gray-500 mb-1">Today's Appointments</div>
            <div className="text-xs text-gray-400">
              {stats.pendingAppointments} pending approval
            </div>
          </div>

          <div className="apple-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-3 mx-auto">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-orange-500 mb-1">
              {stats.pendingAppointments}
            </div>
            <div className="text-sm font-medium text-gray-500 mb-1">Pending Requests</div>
            <div className="text-xs text-gray-400">
              Requires action
            </div>
          </div>

          <div className="apple-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-3 mx-auto">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-semibold text-purple-600 mb-1">
              {stats.perksRedeemed}
            </div>
            <div className="text-sm font-medium text-gray-500 mb-1">Perks Redeemed</div>
            <div className="text-xs text-gray-400">
              This month
            </div>
          </div>
        </div>

        {/* Apple-style action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="apple-card group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Card Management</h3>
            <p className="text-gray-600 text-base mb-6">
              Manage patient dental cards, view card details, and generate new cards.
            </p>
            <div className="space-y-3">
              <a href="/clinic/cards" className="apple-button block text-center py-3">
                View All Cards
              </a>
              <a href="/clinic/cards/generate" className="apple-button block text-center py-3 bg-blue-600 hover:bg-blue-700">
                Generate New Cards
              </a>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Appointment Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review and manage patient appointment requests from cardholders.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <a href="/clinic/appointments">View All Requests</a>
                </Button>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <Badge variant="secondary">{stats.pendingAppointments}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Patient Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage perk redemptions and track patient benefit usage.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <a href="/clinic/perks">View Redemptions</a>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <a href="/clinic/perks/redeem">Process Redemption</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View clinic performance metrics and generate reports.
              </p>
              <Button asChild className="w-full" variant="outline">
                <a href="/clinic/reports">View Reports</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Clinic Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Update clinic information, change password, and manage preferences.
              </p>
              <Button asChild className="w-full" variant="outline">
                <a href="/clinic/settings">Clinic Settings</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get help with the system or contact technical support.
              </p>
              <Button asChild className="w-full" variant="outline">
                <a href="/clinic/support">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.monthlyStats.cardsGenerated}
                </div>
                <div className="text-sm text-gray-600">Cards Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.monthlyStats.appointmentsBooked}
                </div>
                <div className="text-sm text-gray-600">Appointments Booked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.perksRedeemed}
                </div>
                <div className="text-sm text-gray-600">Benefits Redeemed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClinicLayout>
  );
}