'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Calendar, Clock, MapPin, User, Filter, Search, Plus, X } from 'lucide-react';

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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating appointment requests
  const [newRequest, setNewRequest] = useState({
    cardCode: '',
    patientName: '',
    clinicId: '',
    requestedDate: '',
    requestedTime: '',
    purpose: '',
    notes: ''
  });

  // Mock clinics data
  const mockClinics = [
    { id: 'clinic-1', name: 'SmileCare Dental Cavite', region: 'CVT' },
    { id: 'clinic-2', name: 'Bright Dental Batangas', region: 'BTG' },
    { id: 'clinic-3', name: 'Pearl White Laguna', region: 'LGN' },
    { id: 'clinic-4', name: 'Healthy Smiles MIMAROPA', region: 'MIM' }
  ];

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

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call to create the appointment request
    console.log('Creating appointment request:', newRequest);

    // Reset form and close modal
    setNewRequest({
      cardCode: '',
      patientName: '',
      clinicId: '',
      requestedDate: '',
      requestedTime: '',
      purpose: '',
      notes: ''
    });
    setShowCreateModal(false);
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
      <div className="space-y-8">
        {/* Apple-style header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">Appointment Requests</h1>
          <p className="text-lg text-gray-500 font-medium">Create appointment requests for patients and assign to clinics</p>
        </div>

        {/* Create New Request Button */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            className="apple-button px-8 py-4 text-lg font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Create New Appointment Request
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-gray-900 mb-1">{mockAppointments.length}</div>
            <div className="text-sm font-medium text-gray-500">Total Requests Sent</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-yellow-600 mb-1">
              {mockAppointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Awaiting Clinic Response</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-blue-600 mb-1">
              {mockAppointments.filter(a => a.status === 'confirmed').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Accepted by Clinics</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-green-600 mb-1">
              {mockAppointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Completed</div>
          </div>
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
                      Request sent on {new Date(appointment.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <div className="text-xs text-gray-500 text-center">
                      Assigned to:
                    </div>
                    <div className="text-sm font-medium text-gray-700 text-center">
                      {appointment.clinic.name}
                    </div>
                    {appointment.status === 'pending' && (
                      <div className="text-xs text-orange-600 text-center font-medium">
                        Awaiting clinic response
                      </div>
                    )}
                    {appointment.status === 'confirmed' && (
                      <div className="text-xs text-blue-600 text-center font-medium">
                        Accepted by clinic
                      </div>
                    )}
                    {appointment.status === 'rejected' && (
                      <div className="text-xs text-red-600 text-center font-medium">
                        Declined by clinic
                      </div>
                    )}
                    {appointment.status === 'completed' && (
                      <div className="text-xs text-green-600 text-center font-medium">
                        Treatment completed
                      </div>
                    )}
                  </div>
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

        {/* Create Appointment Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="apple-card max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Create Appointment Request</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <Label htmlFor="cardCode" className="text-sm font-medium text-gray-700">
                    Card Code
                  </Label>
                  <Input
                    id="cardCode"
                    value={newRequest.cardCode}
                    onChange={(e) => setNewRequest({...newRequest, cardCode: e.target.value})}
                    placeholder="e.g., CVT202401234"
                    required
                    className="apple-input mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">
                    Patient Name
                  </Label>
                  <Input
                    id="patientName"
                    value={newRequest.patientName}
                    onChange={(e) => setNewRequest({...newRequest, patientName: e.target.value})}
                    placeholder="Enter patient full name"
                    required
                    className="apple-input mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="clinic" className="text-sm font-medium text-gray-700">
                    Assign to Clinic
                  </Label>
                  <Select
                    value={newRequest.clinicId}
                    onValueChange={(value) => setNewRequest({...newRequest, clinicId: value})}
                  >
                    <SelectTrigger className="apple-input mt-1">
                      <SelectValue placeholder="Select clinic to assign request" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name} ({clinic.region})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestedDate" className="text-sm font-medium text-gray-700">
                      Requested Date
                    </Label>
                    <Input
                      id="requestedDate"
                      type="date"
                      value={newRequest.requestedDate}
                      onChange={(e) => setNewRequest({...newRequest, requestedDate: e.target.value})}
                      required
                      className="apple-input mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requestedTime" className="text-sm font-medium text-gray-700">
                      Requested Time
                    </Label>
                    <Input
                      id="requestedTime"
                      type="time"
                      value={newRequest.requestedTime}
                      onChange={(e) => setNewRequest({...newRequest, requestedTime: e.target.value})}
                      required
                      className="apple-input mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                    Purpose of Visit
                  </Label>
                  <Textarea
                    id="purpose"
                    value={newRequest.purpose}
                    onChange={(e) => setNewRequest({...newRequest, purpose: e.target.value})}
                    placeholder="Describe the treatment or service needed"
                    required
                    className="apple-input mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                    placeholder="Any special instructions or patient information"
                    className="apple-input mt-1 min-h-[60px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="apple-button flex-1 py-3"
                  >
                    Send Request to Clinic
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}