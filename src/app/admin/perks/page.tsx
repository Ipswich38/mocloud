'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Gift, User, MapPin, Calendar, Search, Filter, TrendingUp } from 'lucide-react';

interface PerkRedemption {
  id: string;
  cardCode: string;
  patientName: string;
  clinic: {
    id: string;
    name: string;
    region: string;
  };
  perk: {
    id: string;
    name: string;
    description: string;
    category: 'preventive' | 'treatment' | 'cosmetic' | 'emergency';
    value: number;
  };
  redeemedAt: string;
  redeemedBy: string; // clinic staff
  notes?: string;
}

export default function PerkRedemptionsPage() {
  const { profile, loading } = useRequireAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Mock perk redemption data
  const mockRedemptions: PerkRedemption[] = [
    {
      id: 'redem-001',
      cardCode: 'CVT202401234',
      patientName: 'Maria Santos',
      clinic: { id: 'clinic-1', name: 'SmileCare Dental Cavite', region: 'CVT' },
      perk: {
        id: 'perk-1',
        name: 'Free Dental Cleaning',
        description: 'Complete oral prophylaxis and polishing',
        category: 'preventive',
        value: 1500
      },
      redeemedAt: '2026-01-02T14:30:00.000Z',
      redeemedBy: 'Dr. Juan Santos',
      notes: 'Patient showed good oral hygiene'
    },
    {
      id: 'redem-002',
      cardCode: 'BTG202401567',
      patientName: 'Jose Cruz',
      clinic: { id: 'clinic-2', name: 'Bright Dental Batangas', region: 'BTG' },
      perk: {
        id: 'perk-2',
        name: 'Tooth Extraction Discount',
        description: '50% off on tooth extraction procedures',
        category: 'treatment',
        value: 2000
      },
      redeemedAt: '2026-01-01T10:15:00.000Z',
      redeemedBy: 'Dr. Ana Reyes',
      notes: 'Wisdom tooth extraction completed'
    },
    {
      id: 'redem-003',
      cardCode: 'LGN202401890',
      patientName: 'Ana Reyes',
      clinic: { id: 'clinic-3', name: 'Pearl White Laguna', region: 'LGN' },
      perk: {
        id: 'perk-3',
        name: 'Free Fluoride Treatment',
        description: 'Fluoride application for cavity prevention',
        category: 'preventive',
        value: 800
      },
      redeemedAt: '2025-12-30T16:45:00.000Z',
      redeemedBy: 'Dr. Pedro Morales',
      notes: 'Applied fluoride varnish'
    },
    {
      id: 'redem-004',
      cardCode: 'MIM202401123',
      patientName: 'Pedro Morales',
      clinic: { id: 'clinic-4', name: 'Healthy Smiles MIMAROPA', region: 'MIM' },
      perk: {
        id: 'perk-4',
        name: 'Emergency Consultation',
        description: 'Free emergency dental consultation',
        category: 'emergency',
        value: 1000
      },
      redeemedAt: '2026-01-03T09:20:00.000Z',
      redeemedBy: 'Dr. Carmen Flores',
      notes: 'Emergency pain relief treatment'
    },
    {
      id: 'redem-005',
      cardCode: 'CVT202401456',
      patientName: 'Carmen Flores',
      clinic: { id: 'clinic-1', name: 'SmileCare Dental Cavite', region: 'CVT' },
      perk: {
        id: 'perk-5',
        name: 'Teeth Whitening Discount',
        description: '30% off on professional teeth whitening',
        category: 'cosmetic',
        value: 3000
      },
      redeemedAt: '2025-12-28T13:10:00.000Z',
      redeemedBy: 'Dr. Luis Garcia',
      notes: 'One-hour whitening session completed'
    }
  ];

  const filteredRedemptions = mockRedemptions.filter(redemption => {
    const matchesSearch = searchTerm === '' ||
      redemption.cardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.perk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.clinic.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || redemption.perk.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || redemption.clinic.region === regionFilter;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'preventive': return 'bg-green-100 text-green-800';
      case 'treatment': return 'bg-blue-100 text-blue-800';
      case 'cosmetic': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = filteredRedemptions.reduce((sum, r) => sum + r.perk.value, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Perk Redemptions</h1>
          <p className="mt-2 text-gray-600">Monitor dental benefit redemptions across all clinics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockRedemptions.length}</div>
              <div className="text-sm text-gray-600">Total Redemptions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockRedemptions.filter(r => r.perk.category === 'preventive').length}
              </div>
              <div className="text-sm text-gray-600">Preventive Care</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockRedemptions.filter(r => r.perk.category === 'treatment').length}
              </div>
              <div className="text-sm text-gray-600">Treatments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₱{totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Redemption Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['preventive', 'treatment', 'cosmetic', 'emergency'].map(category => {
                const count = mockRedemptions.filter(r => r.perk.category === category).length;
                const percentage = ((count / mockRedemptions.length) * 100).toFixed(1);

                return (
                  <div key={category} className="text-center">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{category}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                    placeholder="Search card, patient, perk, or clinic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="preventive">Preventive Care</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="cosmetic">Cosmetic</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
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

        {/* Redemptions List */}
        <div className="space-y-4">
          {filteredRedemptions.map((redemption) => (
            <Card key={redemption.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {redemption.cardCode}
                      </Badge>
                      <Badge className={getCategoryColor(redemption.perk.category)}>
                        {redemption.perk.category.charAt(0).toUpperCase() + redemption.perk.category.slice(1)}
                      </Badge>
                      <Badge variant="outline">{redemption.clinic.region}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        ₱{redemption.perk.value.toLocaleString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{redemption.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{redemption.clinic.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{redemption.perk.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(redemption.redeemedAt).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Description:</div>
                      <div className="text-sm text-gray-600">{redemption.perk.description}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Redeemed by:</div>
                      <div className="text-sm text-gray-600">{redemption.redeemedBy}</div>
                    </div>

                    {redemption.notes && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Notes:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{redemption.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-right lg:text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₱{redemption.perk.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Benefit Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRedemptions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">No redemptions found</div>
                <div className="text-gray-600">Try adjusting your filters or search terms</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}