'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/lib/auth/AuthProvider';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CardGenerationForm } from '@/components/cards/CardGenerationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Database, Settings, History } from 'lucide-react';
import Link from 'next/link';
import type { GenerationResult } from '@/lib/services/CardGenerationService';

interface Clinic {
  id: string;
  name: string;
  region: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
}

export default function GenerateCardsPage() {
  const { profile, loading } = useRequireAdmin();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [recentBatches, setRecentBatches] = useState<GenerationResult[]>([]);

  // Mock clinic data with new format - in production, fetch from Supabase
  useEffect(() => {
    const mockClinics: Clinic[] = [
      {
        id: 'clinic-1',
        name: 'SmileCare Dental Cavite',
        region: 'CVT',
        address: 'Dasmarinas, Cavite',
        contact_email: 'info@smilecare-cavite.com',
        contact_phone: '+639171234567'
      },
      {
        id: 'clinic-2',
        name: 'Bright Dental Batangas',
        region: 'BTG',
        address: 'Lipa City, Batangas',
        contact_email: 'contact@bright-batangas.com',
        contact_phone: '+639181234567'
      },
      {
        id: 'clinic-3',
        name: 'Pearl White Dental Laguna',
        region: 'LGN',
        address: 'Santa Rosa, Laguna',
        contact_email: 'hello@pearlwhite-laguna.com',
        contact_phone: '+639191234567'
      },
      {
        id: 'clinic-4',
        name: 'Quezon Dental Center',
        region: 'QZN',
        address: 'Lucena City, Quezon',
        contact_email: 'info@quezon-dental.com',
        contact_phone: '+639201234567'
      },
      {
        id: 'clinic-5',
        name: 'Rizal Oral Care',
        region: 'RIZ',
        address: 'Antipolo, Rizal',
        contact_email: 'care@rizal-oral.com',
        contact_phone: '+639211234567'
      },
      {
        id: 'clinic-6',
        name: 'Healthy Smiles MIMAROPA',
        region: 'MIM',
        address: 'Calapan, Oriental Mindoro',
        contact_email: 'info@healthysmiles-mimaropa.com',
        contact_phone: '+639221234567'
      }
    ];

    setClinics(mockClinics);
  }, []);

  const handleGenerationComplete = (result: GenerationResult) => {
    setRecentBatches(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 batches
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">MOC Card Generation</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Generate dental benefit cards with format MOC-NNNNN-RRR-CCCCCC (up to 10,000 per clinic)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{clinics.length}</div>
                  <div className="text-sm text-gray-600">Active Clinics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">10K</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">10,000</div>
                  <div className="text-sm text-gray-600">Max Batch Size</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Generation Form */}
        <CardGenerationForm
          clinics={clinics}
          onGenerationComplete={handleGenerationComplete}
        />

        {/* Recent Batches */}
        {recentBatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Generation Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBatches.map((batch, index) => (
                  <div key={batch.batch_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Batch #{batch.batch_id.slice(-8)}</div>
                      <div className="text-sm text-gray-600">
                        {batch.count.toLocaleString()} cards • Prefix: {batch.prefix}
                      </div>
                    </div>
                    <Badge variant={batch.success ? 'default' : 'destructive'}>
                      {batch.success ? 'Completed' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}