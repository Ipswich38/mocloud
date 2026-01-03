'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Building2, MapPin, Search, Filter, Plus } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  clinicCode: string;
  region: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  adminUsername: string;
  stats: {
    totalCards: number;
    totalAppointments: number;
    pendingAppointments: number;
  };
  createdAt: string;
}

export default function ClinicsManagementPage() {
  const { profile, loading } = useRequireAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock clinic data
  const mockClinics: Clinic[] = [
    {
      id: 'clinic-1',
      name: 'SmileCare Dental Cavite',
      clinicCode: 'CVT12345',
      region: 'CVT',
      address: '123 Aguinaldo Highway, Dasmarinas City, Cavite',
      contactPerson: 'Dr. Juan Santos',
      contactEmail: 'admin@smilecare-cavite.com',
      contactPhone: '+63 912 345 6789',
      isActive: true,
      adminUsername: 'smilecare001',
      stats: {
        totalCards: 245,
        totalAppointments: 89,
        pendingAppointments: 12
      },
      createdAt: '2025-12-15T10:30:00.000Z'
    },
    {
      id: 'clinic-2',
      name: 'Bright Dental Batangas',
      clinicCode: 'BTG67890',
      region: 'BTG',
      address: '456 P. Burgos Street, Lipa City, Batangas',
      contactPerson: 'Dr. Ana Reyes',
      contactEmail: 'contact@brightdental-batangas.com',
      contactPhone: '+63 923 456 7890',
      isActive: true,
      adminUsername: 'brightdental002',
      stats: {
        totalCards: 189,
        totalAppointments: 67,
        pendingAppointments: 8
      },
      createdAt: '2025-12-10T14:15:00.000Z'
    },
    {
      id: 'clinic-3',
      name: 'Pearl White Laguna',
      clinicCode: 'LGN11223',
      region: 'LGN',
      address: '789 Jose Rizal Avenue, Santa Rosa City, Laguna',
      contactPerson: 'Dr. Pedro Morales',
      contactEmail: 'info@pearlwhite-laguna.com',
      contactPhone: '+63 934 567 8901',
      isActive: true,
      adminUsername: 'pearlwhite003',
      stats: {
        totalCards: 312,
        totalAppointments: 145,
        pendingAppointments: 23
      },
      createdAt: '2025-11-28T09:45:00.000Z'
    }
  ];

  const filteredClinics = mockClinics.filter(clinic => {
    const matchesSearch = searchTerm === '' ||
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.clinicCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = regionFilter === 'all' || clinic.region === regionFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && clinic.isActive) ||
      (statusFilter === 'inactive' && !clinic.isActive);

    return matchesSearch && matchesRegion && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Management</h1>
            <p className="mt-2 text-gray-600">Manage all multi-tenant clinic accounts</p>
          </div>
          <Button asChild>
            <a href="/admin/clinics/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Clinic
            </a>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockClinics.length}</div>
              <div className="text-sm text-gray-600">Total Clinics</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockClinics.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Clinics</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockClinics.reduce((sum, c) => sum + c.stats.totalCards, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clinic name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="CVT">Cavite</SelectItem>
                  <SelectItem value="BTG">Batangas</SelectItem>
                  <SelectItem value="LGN">Laguna</SelectItem>
                  <SelectItem value="MIM">MIMAROPA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clinics List */}
        <div className="space-y-4">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {clinic.clinicCode}
                      </Badge>
                      <Badge className={clinic.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {clinic.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{clinic.region}</Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">Admin: {clinic.adminUsername}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{clinic.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{clinic.address}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Email:</span> {clinic.contactEmail}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Phone:</span> {clinic.contactPhone}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{clinic.stats.totalCards}</div>
                        <div className="text-xs text-gray-600">Cards</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{clinic.stats.totalAppointments}</div>
                        <div className="text-xs text-gray-600">Appointments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{clinic.stats.pendingAppointments}</div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button size="sm" variant="outline" className="w-full">
                      View Dashboard
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}