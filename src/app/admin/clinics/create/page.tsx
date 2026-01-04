'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CheckCircle, Building2, UserPlus, Settings } from 'lucide-react';

interface CreatedClinic {
  id: string;
  name: string;
  clinicCode: string;
  region: string;
  adminUsername: string;
  adminPassword: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  createdAt: string;
}

export default function CreateClinicPage() {
  const { profile, loading } = useRequireAdmin();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdClinic, setCreatedClinic] = useState<CreatedClinic | null>(null);

  // Form data
  const [clinicName, setClinicName] = useState('');
  const [region, setRegion] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [description, setDescription] = useState('');

  const PHILIPPINES_REGIONS = [
    { code: '01', name: 'Ilocos Region (Region 1)' },
    { code: '02', name: 'Cagayan Valley (Region 2)' },
    { code: '03', name: 'Central Luzon (Region 3)' },
    { code: '4A', name: 'Calabarzon (Region 4A)' },
    { code: '4B', name: 'Mimaropa (Region 4B)' },
    { code: '05', name: 'Bicol Region (Region 5)' },
    { code: '06', name: 'Western Visayas (Region 6)' },
    { code: '07', name: 'Central Visayas (Region 7)' },
    { code: '08', name: 'Eastern Visayas (Region 8)' },
    { code: '09', name: 'Zamboanga Peninsula (Region 9)' },
    { code: '10', name: 'Northern Mindanao (Region 10)' },
    { code: '11', name: 'Davao Region (Region 11)' },
    { code: '12', name: 'Soccsksargen (Region 12)' },
    { code: '13', name: 'Caraga Region (Region 13)' },
    { code: '14', name: 'Bangsamoro (Region 14)' },
    { code: '15', name: 'Mimaropa Expansion (Region 15)' },
    { code: '16', name: 'Northern Luzon (Region 16)' },
    { code: 'NCR', name: 'National Capital Region (NCR)' },
    { code: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
    { code: 'CUSTOM', name: 'Custom Region' }
  ];

  const AREA_CODES = {
    // Central Valley Codes (CVT001 to CVT016)
    CVT: [
      'CVT001', 'CVT002', 'CVT003', 'CVT004', 'CVT005', 'CVT006', 'CVT007', 'CVT008',
      'CVT009', 'CVT010', 'CVT011', 'CVT012', 'CVT013', 'CVT014', 'CVT015', 'CVT016'
    ],
    // Laguna Codes (LGN001 to LGN016)
    LGN: [
      'LGN001', 'LGN002', 'LGN003', 'LGN004', 'LGN005', 'LGN006', 'LGN007', 'LGN008',
      'LGN009', 'LGN010', 'LGN011', 'LGN012', 'LGN013', 'LGN014', 'LGN015', 'LGN016'
    ],
    // Batangas Codes (BTG001 to BTG016)
    BTG: [
      'BTG001', 'BTG002', 'BTG003', 'BTG004', 'BTG005', 'BTG006', 'BTG007', 'BTG008',
      'BTG009', 'BTG010', 'BTG011', 'BTG012', 'BTG013', 'BTG014', 'BTG015', 'BTG016'
    ],
    // MIMAROPA Region 4B Codes (MIM001 to MIM016)
    MIM: [
      'MIM001', 'MIM002', 'MIM003', 'MIM004', 'MIM005', 'MIM006', 'MIM007', 'MIM008',
      'MIM009', 'MIM010', 'MIM011', 'MIM012', 'MIM013', 'MIM014', 'MIM015', 'MIM016'
    ]
  };

  const ALL_AREA_CODES = [
    ...AREA_CODES.CVT,
    ...AREA_CODES.LGN,
    ...AREA_CODES.BTG,
    ...AREA_CODES.MIM,
    'CUSTOM'
  ];

  const generateClinicCode = (regionCode: string): string => {
    const timestamp = Date.now().toString().slice(-3);
    const random = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    return `${regionCode}${timestamp}${random}`;
  };

  const generateCredentials = (clinicName: string): { username: string; password: string } => {
    const username = clinicName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) + Math.floor(Math.random() * 999);
    const password = Math.random().toString(36).slice(-8).toUpperCase();
    return { username, password };
  };

  const handleCreate = async () => {
    if (!clinicName || !region || !clinicCode || !address || !contactEmail || !contactPhone || !contactPerson) {
      return;
    }

    // Validate custom fields
    if (region === 'CUSTOM' && !customRegion) {
      return;
    }
    if (clinicCode === 'CUSTOM' && !customCode) {
      return;
    }

    setCreating(true);

    try {
      const { username, password } = generateCredentials(clinicName);

      // Use selected clinic code or custom code
      const finalClinicCode = clinicCode === 'CUSTOM' ? customCode : clinicCode;
      const finalRegion = region === 'CUSTOM' ? customRegion : region;

      // In a real implementation, this would make API calls to:
      // 1. Create clinic in database
      // 2. Create clinic credentials
      // For now, we simulate the creation

      await new Promise(resolve => setTimeout(resolve, 2000));

      const newClinic: CreatedClinic = {
        id: `clinic-${Date.now()}`,
        name: clinicName,
        clinicCode: finalClinicCode,
        region: finalRegion,
        adminUsername: username,
        adminPassword: password,
        address: address,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        contactPerson: contactPerson,
        createdAt: new Date().toISOString()
      };

      setCreatedClinic(newClinic);
      setCreated(true);
    } catch (error) {
      console.error('Failed to create clinic:', error);
      // Handle error - in real app, show error message
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setClinicName('');
    setRegion('');
    setClinicCode('');
    setCustomRegion('');
    setCustomCode('');
    setAddress('');
    setContactEmail('');
    setContactPhone('');
    setContactPerson('');
    setDescription('');
    setCreated(false);
    setCreatedClinic(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Create Clinic Account</h1>
          <p className="mt-2 text-gray-600">Setup a new multi-tenant clinic with dedicated admin access</p>
        </div>

        {!created ? (
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input
                    id="clinicName"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g., SmileCare Dental Center"
                  />
                </div>

                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Philippine region" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHILIPPINES_REGIONS.map(r => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Region Input */}
                {region === 'CUSTOM' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="customRegion">Custom Region Name *</Label>
                    <Input
                      id="customRegion"
                      value={customRegion}
                      onChange={(e) => setCustomRegion(e.target.value)}
                      placeholder="Enter custom region name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="clinicCode">Clinic Code *</Label>
                  <Select value={clinicCode} onValueChange={setClinicCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic code" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Central Valley Codes */}
                      {AREA_CODES.CVT.map(code => (
                        <SelectItem key={code} value={code}>
                          {code} - Central Valley
                        </SelectItem>
                      ))}
                      {/* Laguna Codes */}
                      {AREA_CODES.LGN.map(code => (
                        <SelectItem key={code} value={code}>
                          {code} - Laguna
                        </SelectItem>
                      ))}
                      {/* Batangas Codes */}
                      {AREA_CODES.BTG.map(code => (
                        <SelectItem key={code} value={code}>
                          {code} - Batangas
                        </SelectItem>
                      ))}
                      {/* MIMAROPA Codes */}
                      {AREA_CODES.MIM.map(code => (
                        <SelectItem key={code} value={code}>
                          {code} - MIMAROPA
                        </SelectItem>
                      ))}
                      <SelectItem value="CUSTOM">🔧 Custom Code</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    CVT001-016: Central Valley | LGN001-016: Laguna | BTG001-016: Batangas | MIM001-016: MIMAROPA
                  </p>
                </div>

                {/* Custom Code Input */}
                {clinicCode === 'CUSTOM' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="customCode">Custom Clinic Code *</Label>
                    <Input
                      id="customCode"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="Enter custom clinic code (e.g., ABC001)"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: 3 letters + 3 numbers (e.g., ABC001, XYZ999)
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <Label htmlFor="address">Clinic Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Complete clinic address including city and province"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Dr. Juan Dela Cruz"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="clinic@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief clinic description"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={
                  creating ||
                  !clinicName ||
                  !region ||
                  !clinicCode ||
                  !address ||
                  !contactEmail ||
                  !contactPhone ||
                  !contactPerson ||
                  (region === 'CUSTOM' && !customRegion) ||
                  (clinicCode === 'CUSTOM' && !customCode)
                }
                className="w-full"
              >
                {creating ? 'Creating Clinic Account...' : 'Create Multi-Tenant Clinic'}
              </Button>
            </CardContent>
          </Card>
        ) : createdClinic && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully created clinic "{createdClinic.name}" with dedicated admin access
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">{createdClinic.clinicCode}</div>
                  <div className="text-sm text-gray-600">Clinic Code</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">{createdClinic.adminUsername}</div>
                  <div className="text-sm text-gray-600">Admin Username</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">{createdClinic.adminPassword}</div>
                  <div className="text-sm text-gray-600">Admin Password</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Clinic Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Clinic Name</Label>
                    <div className="mt-1 text-gray-900">{createdClinic.name}</div>
                  </div>

                  <div>
                    <Label>Region</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{createdClinic.region}</Badge>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <div className="mt-1 text-gray-900">{createdClinic.address}</div>
                  </div>

                  <div>
                    <Label>Contact Person</Label>
                    <div className="mt-1 text-gray-900">{createdClinic.contactPerson}</div>
                  </div>

                  <div>
                    <Label>Contact Email</Label>
                    <div className="mt-1 text-gray-900">{createdClinic.contactEmail}</div>
                  </div>

                  <div>
                    <Label>Contact Phone</Label>
                    <div className="mt-1 text-gray-900">{createdClinic.contactPhone}</div>
                  </div>

                  <div>
                    <Label>Created At</Label>
                    <div className="mt-1 text-gray-900">
                      {new Date(createdClinic.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Access Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>The clinic admin can login at the same signin page using the generated credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Username: <code className="bg-gray-100 px-2 py-1 rounded">{createdClinic.adminUsername}</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Password: <code className="bg-gray-100 px-2 py-1 rounded">{createdClinic.adminPassword}</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>The clinic will have their own dedicated dashboard and can generate cards for their patients</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={resetForm} variant="outline">
                Create Another Clinic
              </Button>
              <Button asChild>
                <a href="/admin/clinics">View All Clinics</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}