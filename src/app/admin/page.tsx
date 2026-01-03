'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface DashboardStats {
  totalClinics: number;
  totalCards: number;
  totalAppointments: number;
  pendingAppointments: number;
  availableClinicCodes: number;
}

export default function AdminDashboard() {
  const { profile, loading } = useRequireAdmin();

  // Mock stats for immediate admin access
  const stats: DashboardStats = {
    totalClinics: 25,
    totalCards: 3847,
    totalAppointments: 1263,
    pendingAppointments: 47,
    availableClinicCodes: 39
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalClinics}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCards}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAppointments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingAppointments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.availableClinicCodes}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">🚀 MOC Card Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Generate up to 10,000 cards with customizable control numbers (MOC-TIMESTAMP-SEQUENCE-RANDOM)
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="text-gray-600">• Batch tracking</div>
                <div className="text-gray-600">• CSV export</div>
                <div className="text-gray-600">• Real-time progress</div>
                <div className="text-gray-600">• Custom prefixes</div>
              </div>
              <Button asChild className="w-full">
                <a href="/admin/cards/generate">Generate Cards</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Setup multi-tenant clinic accounts</p>
              <Button asChild className="w-full">
                <a href="/admin/clinics/create">Create Clinic</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Monitor cardholder appointments</p>
              <div className="flex items-center justify-between">
                <Button asChild variant="outline">
                  <a href="/admin/appointments">View All</a>
                </Button>
                {stats.pendingAppointments > 0 && (
                  <Badge variant="destructive">
                    {stats.pendingAppointments}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perk Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Monitor benefit redemptions</p>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/perks">View Redemptions</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinic Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage all clinic accounts</p>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/clinics">Manage Clinics</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Configure system settings</p>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/settings">Settings</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}