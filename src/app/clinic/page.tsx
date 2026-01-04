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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {profile?.clinic_name || profile?.display_name}! Here's your overview for today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats.totalCards}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {stats.activeCards} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats.todayAppointments}
              </div>
              <p className="text-xs text-green-600 mt-1">
                {stats.pendingAppointments} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {stats.pendingAppointments}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Requires action
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Perks Redeemed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {stats.perksRedeemed}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Card Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage patient dental cards, view card details, and generate new cards.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <a href="/clinic/cards">View All Cards</a>
                </Button>
                <Button asChild className="w-full">
                  <a href="/clinic/cards/generate">Generate New Cards</a>
                </Button>
              </div>
            </CardContent>
          </Card>

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