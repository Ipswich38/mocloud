'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase';
import { Plus, Edit, Building, MapPin, Phone, Mail, User } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  is_active: boolean;
  clinic_code_id: string;
  clinic_codes: {
    code: string;
    regions: {
      name: string;
      code: string;
    };
  };
  created_at: string;
}

interface Region {
  id: string;
  code: string;
  name: string;
}

interface ClinicCode {
  id: string;
  code: string;
  region_id: string;
  is_assigned: boolean;
}

export default function AdminClinicsPage() {
  const { profile, loading } = useRequireAdmin();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableCodes, setAvailableCodes] = useState<ClinicCode[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    contact_person: '',
    clinic_code_id: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoadingClinics(true);

      const [
        { data: clinicsData },
        { data: regionsData },
        { data: codesData }
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
          .order('created_at', { ascending: false }),
        supabase
          .from('regions')
          .select('*')
          .order('code'),
        supabase
          .from('clinic_codes')
          .select('*')
          .eq('is_assigned', false)
          .order('code')
      ]);

      setClinics(clinicsData || []);
      setRegions(regionsData || []);
      setAvailableCodes(codesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load clinics data');
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('clinics')
        .insert([formData]);

      if (insertError) throw insertError;

      // Mark clinic code as assigned
      await supabase
        .from('clinic_codes')
        .update({ is_assigned: true })
        .eq('id', formData.clinic_code_id);

      setSuccess('Clinic added successfully!');
      setShowAddDialog(false);
      setFormData({
        name: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        contact_person: '',
        clinic_code_id: ''
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to add clinic');
    }
  };

  const toggleClinicStatus = async (clinicId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: !currentStatus })
        .eq('id', clinicId);

      if (error) throw error;

      setSuccess(`Clinic ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to update clinic status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Management</h1>
            <p className="mt-2 text-gray-600">
              Manage dental clinics and assign clinic codes
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Clinic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Clinic</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddClinic} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Clinic Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic_code_id">Clinic Code</Label>
                    <Select
                      value={formData.clinic_code_id}
                      onValueChange={(value) => setFormData({ ...formData, clinic_code_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic code" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCodes.map((code) => (
                          <SelectItem key={code.id} value={code.id}>
                            {code.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Clinic</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinics.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clinics</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {clinics.filter(c => c.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Codes</CardTitle>
              <Badge variant="outline">{availableCodes.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {availableCodes.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Clinics Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clinics</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingClinics ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading clinics...</p>
              </div>
            ) : clinics.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No clinics found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {clinic.clinic_codes.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{clinic.name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {clinic.address.substring(0, 50)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {clinic.clinic_codes.regions.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {clinic.contact_person}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-3 w-3 mr-1" />
                              {clinic.contact_email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {clinic.contact_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={clinic.is_active ? "default" : "secondary"}>
                            {clinic.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleClinicStatus(clinic.id, clinic.is_active)}
                          >
                            {clinic.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}