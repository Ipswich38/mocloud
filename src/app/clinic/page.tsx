'use client';

import { useState, useEffect } from 'react';
import { useRequireClinic } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { ClinicLayout } from '@/components/clinic/ClinicLayout';

interface ClinicStats {
  totalCards: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface ClinicInfo {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  clinic_codes: {
    code: string;
    regions: {
      name: string;
      code: string;
    };
  };
}

export default function ClinicDashboard() {
  const { profile, loading } = useRequireClinic();
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.clinic_id) return;

      try {
        const [
          { data: clinicData },
          { count: totalCards },
          { count: totalAppointments },
          { count: pendingAppointments },
          { count: completedAppointments }
        ] = await Promise.all([
          supabase
            .from('clinics')
            .select(`
              *,
              clinic_codes (
                code,
                regions (
                  name,
                  code
                )
              )
            `)
            .eq('id', profile.clinic_id)
            .single(),
          supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', profile.clinic_id),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', profile.clinic_id),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', profile.clinic_id)
            .eq('status', 'pending'),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', profile.clinic_id)
            .eq('status', 'completed')
        ]);

        setClinicInfo(clinicData);
        setStats({
          totalCards: totalCards || 0,
          totalAppointments: totalAppointments || 0,
          pendingAppointments: pendingAppointments || 0,
          completedAppointments: completedAppointments || 0
        });
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile, supabase]);

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

  return (
    <ClinicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {clinicInfo ? `Welcome, ${clinicInfo.name}` : 'Clinic Dashboard'}
          </h1>
          {clinicInfo && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-600">
                Clinic Code: <Badge variant="outline">{clinicInfo.clinic_codes.code}</Badge>
              </p>
              <p className="text-sm text-gray-500">
                Region: {clinicInfo.clinic_codes.regions.name}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingData ? '...' : stats?.totalCards}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingData ? '...' : stats?.totalAppointments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loadingData ? '...' : stats?.pendingAppointments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loadingData ? '...' : stats?.completedAppointments}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate and manage dental benefit cards for your patients.
              </p>
              <a
                href="/clinic/cards"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage Cards
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review and manage appointment requests from patients.
              </p>
              <div className="flex items-center justify-between">
                <a
                  href="/clinic/appointments"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Appointments
                </a>
                {stats && stats.pendingAppointments > 0 && (
                  <Badge variant="destructive">
                    {stats.pendingAppointments} pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Look up patient cards and verify benefits.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Search Cards
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Clinic Information */}
        {clinicInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Contact Person:</strong> {clinicInfo.contact_person}</p>
                    <p><strong>Email:</strong> {clinicInfo.contact_email}</p>
                    <p><strong>Phone:</strong> {clinicInfo.contact_phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <p className="text-sm">{clinicInfo.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ClinicLayout>
  );
}