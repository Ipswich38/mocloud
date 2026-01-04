'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClinicLayout } from '@/components/clinic/ClinicLayout';
import { Calendar, Clock, MapPin, User, Filter, Search, CheckCircle, X, Phone, AlertTriangle } from 'lucide-react';

interface AppointmentRequest {
  id: string;
  cardCode: string;
  patientName: string;
  requestedDate: string;
  requestedTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'rescheduled';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  clinicResponse?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
}

export default function ClinicAppointmentsPage() {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Redirect non-clinic users
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'clinic')) {
      window.location.href = '/auth/signin';
    }
  }, [user, profile, loading]);

  // Mock appointment requests sent to this clinic
  const mockRequests: AppointmentRequest[] = [
    {
      id: 'req-001',
      cardCode: 'CVT202401234',
      patientName: 'Maria Santos',
      requestedDate: '2026-01-15',
      requestedTime: '10:00',
      purpose: 'Regular dental checkup and cleaning',
      status: 'pending',
      adminNotes: 'Patient prefers morning appointments',
      createdAt: '2026-01-03T08:30:00.000Z'
    },
    {
      id: 'req-002',
      cardCode: 'CVT202401567',
      patientName: 'Jose Cruz',
      requestedDate: '2026-01-16',
      requestedTime: '14:30',
      purpose: 'Tooth extraction consultation',
      status: 'confirmed',
      clinicResponse: 'Appointment confirmed. Please arrive 15 minutes early.',
      createdAt: '2026-01-02T14:15:00.000Z'
    },
    {
      id: 'req-003',
      cardCode: 'CVT202401890',
      patientName: 'Ana Reyes',
      requestedDate: '2026-01-14',
      requestedTime: '09:00',
      purpose: 'Dental filling and oral examination',
      status: 'completed',
      clinicResponse: 'Treatment completed successfully',
      createdAt: '2026-01-01T16:45:00.000Z'
    },
    {
      id: 'req-004',
      cardCode: 'CVT202401123',
      patientName: 'Pedro Morales',
      requestedDate: '2026-01-20',
      requestedTime: '11:15',
      purpose: 'Emergency dental care - severe toothache',
      status: 'rescheduled',
      rescheduledDate: '2026-01-18',
      rescheduledTime: '09:30',
      clinicResponse: 'Rescheduled to earlier date due to emergency nature',
      createdAt: '2026-01-03T10:20:00.000Z'
    },
    {
      id: 'req-005',
      cardCode: 'CVT202401456',
      patientName: 'Carmen Flores',
      requestedDate: '2026-01-12',
      requestedTime: '13:00',
      purpose: 'Orthodontic consultation',
      status: 'rejected',
      clinicResponse: 'Unable to accommodate - no orthodontist available on requested date',
      createdAt: '2025-12-28T11:30:00.000Z'
    }
  ];

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = searchTerm === '' ||
      request.cardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    console.log(`Accepting request ${requestId} with notes:`, responseNotes);
    setSelectedRequest(null);
    setResponseNotes('');
  };

  const handleRejectRequest = (requestId: string) => {
    console.log(`Rejecting request ${requestId} with notes:`, responseNotes);
    setSelectedRequest(null);
    setResponseNotes('');
  };

  const handleRescheduleRequest = (requestId: string) => {
    console.log(`Rescheduling request ${requestId} to ${rescheduleDate} ${rescheduleTime} with notes:`, responseNotes);
    setSelectedRequest(null);
    setResponseNotes('');
    setRescheduleDate('');
    setRescheduleTime('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'clinic') {
    return null;
  }

  return (
    <ClinicLayout>
      <div className="space-y-8">
        {/* Apple-style header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">Appointment Requests</h1>
          <p className="text-lg text-gray-500 font-medium">Manage requests sent by admin for your clinic</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-yellow-600 mb-1">
              {mockRequests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Pending Review</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-blue-600 mb-1">
              {mockRequests.filter(r => r.status === 'confirmed').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Confirmed</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-green-600 mb-1">
              {mockRequests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm font-medium text-gray-500">Completed</div>
          </div>

          <div className="apple-card text-center">
            <div className="text-3xl font-semibold text-gray-900 mb-1">{mockRequests.length}</div>
            <div className="text-sm font-medium text-gray-500">Total Requests</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by card code, patient, or purpose..."
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
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {request.cardCode}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{request.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(request.requestedDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{request.requestedTime}</span>
                        </div>
                        {(request.rescheduledDate || request.rescheduledTime) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-600">
                              Rescheduled: {request.rescheduledDate} {request.rescheduledTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Purpose:</div>
                      <div className="text-sm text-gray-600">{request.purpose}</div>
                    </div>

                    {request.adminNotes && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{request.adminNotes}</div>
                      </div>
                    )}

                    {request.clinicResponse && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Your Response:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.clinicResponse}</div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Request received on {new Date(request.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        className="apple-button w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                        className="w-full"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="min-w-[160px] text-center">
                      <div className="text-sm font-medium text-gray-700">
                        {request.status === 'confirmed' && '✅ Accepted'}
                        {request.status === 'rejected' && '❌ Rejected'}
                        {request.status === 'completed' && '✅ Completed'}
                        {request.status === 'rescheduled' && '📅 Rescheduled'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">No appointment requests found</div>
                <div className="text-gray-600">Try adjusting your filters or search terms</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Response Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="apple-card max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Respond to {selectedRequest.patientName}'s Request
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(null);
                    setResponseNotes('');
                    setRescheduleDate('');
                    setRescheduleTime('');
                  }}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Request Details:</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Patient: {selectedRequest.patientName}</div>
                    <div>Date: {new Date(selectedRequest.requestedDate).toLocaleDateString('en-PH')}</div>
                    <div>Time: {selectedRequest.requestedTime}</div>
                    <div>Purpose: {selectedRequest.purpose}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rescheduleDate" className="text-sm font-medium text-gray-700">
                    Response Message
                  </Label>
                  <Textarea
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Add your response message to the patient..."
                    className="apple-input mt-1 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rescheduleDate" className="text-sm font-medium text-gray-700">
                      Alternative Date (Optional)
                    </Label>
                    <Input
                      id="rescheduleDate"
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="apple-input mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rescheduleTime" className="text-sm font-medium text-gray-700">
                      Alternative Time (Optional)
                    </Label>
                    <Input
                      id="rescheduleTime"
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="apple-input mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleAcceptRequest(selectedRequest.id)}
                  className="apple-button flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                {(rescheduleDate || rescheduleTime) && (
                  <Button
                    onClick={() => handleRescheduleRequest(selectedRequest.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Reschedule
                  </Button>
                )}
                <Button
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}