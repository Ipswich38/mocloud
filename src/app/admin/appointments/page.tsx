'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Calendar, Clock, MapPin, User, Filter, Search } from 'lucide-react';

interface Appointment {
  id: string;
  cardCode: string;
  patientName: string;
  clinic: {
    id: string;
    name: string;
    region: string;
  };
  requestedDate: string;
  requestedTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
}

export default function AppointmentsPage() {
  const { profile, loading } = useRequireAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Mock appointment data
  const mockAppointments: Appointment[] = [
    {
      id: 'apt-001',
      cardCode: 'CVT202401234',
      patientName: 'Maria Santos',
      clinic: { id: 'clinic-1', name: 'SmileCare Dental Cavite', region: 'CVT' },
      requestedDate: '2026-01-15',
      requestedTime: '10:00',
      purpose: 'Regular dental checkup and cleaning',
      status: 'pending',
      createdAt: '2026-01-03T08:30:00.000Z'
    },
    {
      id: 'apt-002',
      cardCode: 'BTG202401567',
      patientName: 'Jose Cruz',
      clinic: { id: 'clinic-2', name: 'Bright Dental Batangas', region: 'BTG' },
      requestedDate: '2026-01-16',
      requestedTime: '14:30',
      purpose: 'Tooth extraction consultation',
      status: 'confirmed',
      notes: 'Patient confirmed availability',
      createdAt: '2026-01-02T14:15:00.000Z'
    },
    {
      id: 'apt-003',
      cardCode: 'LGN202401890',
      patientName: 'Ana Reyes',
      clinic: { id: 'clinic-3', name: 'Pearl White Laguna', region: 'LGN' },
      requestedDate: '2026-01-14',
      requestedTime: '09:00',
      purpose: 'Dental filling and oral examination',
      status: 'completed',
      notes: 'Treatment completed successfully',
      createdAt: '2026-01-01T16:45:00.000Z'
    },
    {
      id: 'apt-004',
      cardCode: 'MIM202401123',
      patientName: 'Pedro Morales',
      clinic: { id: 'clinic-4', name: 'Healthy Smiles MIMAROPA', region: 'MIM' },
      requestedDate: '2026-01-20',
      requestedTime: '11:15',
      purpose: 'Emergency dental care - severe toothache',
      status: 'pending',
      createdAt: '2026-01-03T10:20:00.000Z'
    },
    {
      id: 'apt-005',
      cardCode: 'CVT202401456',
      patientName: 'Carmen Flores',
      clinic: { id: 'clinic-1', name: 'SmileCare Dental Cavite', region: 'CVT' },
      requestedDate: '2026-01-12',
      requestedTime: '13:00',
      purpose: 'Orthodontic consultation',
      status: 'rejected',
      notes: 'Patient requested rescheduling',
      createdAt: '2025-12-28T11:30:00.000Z'
    },
    {
      id: 'apt-006',
      cardCode: 'LGN202401789',
      patientName: 'Luis Garcia',
      clinic: { id: 'clinic-3', name: 'Pearl White Laguna', region: 'LGN' },
      requestedDate: '2026-01-18',
      requestedTime: '15:45',
      purpose: 'Root canal treatment follow-up',
      status: 'confirmed',
      notes: 'Second session scheduled',
      createdAt: '2026-01-02T09:10:00.000Z'
    }
  ];

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = searchTerm === '' ||
      appointment.cardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.clinic.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || appointment.clinic.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="mt-2 text-gray-600">Monitor and manage appointment requests from cardholders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAppointments.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockAppointments.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockAppointments.filter(a => a.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockAppointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
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
                    placeholder="Search card code, patient, or clinic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {appointment.cardCode}
                      </Badge>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{appointment.clinic.region}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{appointment.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.clinic.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(appointment.requestedDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{appointment.requestedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Purpose:</div>
                      <div className="text-sm text-gray-600">{appointment.purpose}</div>
                    </div>

                    {appointment.notes && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Notes:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{appointment.notes}</div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Requested on {new Date(appointment.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="w-full sm:w-auto lg:w-full"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                        className="w-full sm:w-auto lg:w-full"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAppointments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">No appointments found</div>
                <div className="text-gray-600">Try adjusting your filters or search terms</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}