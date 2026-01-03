'use client';

import { useState } from 'react';
import {
  CreditCard,
  User,
  Calendar,
  MapPin,
  Phone,
  Building2,
  Gift,
  Clock,
  Check,
  X,
  Plus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { formatDate, formatPhoneNumber } from '@/lib/utils/index';
import type { CardWithRelations } from '@/types';
import { AppointmentRequestForm } from './AppointmentRequestForm';

interface CardDetailsProps {
  card: CardWithRelations;
}

export function CardDetails({ card }: CardDetailsProps) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const activePerks = card.perks?.filter(perk => !perk.is_redeemed) || [];
  const redeemedPerks = card.perks?.filter(perk => perk.is_redeemed) || [];

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="h-8 w-8" />
          <div>
            <h2 className="text-xl font-bold">MOCARDS Dental Benefits</h2>
            <p className="text-blue-100">Card Code: {card.card_code}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{card.patient_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>DOB: {formatDate(card.patient_birthdate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>{formatPhoneNumber(card.patient_phone)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Active since {formatDate(card.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Patient Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{card.patient_address}</p>
        </CardContent>
      </Card>

      {/* Clinic Information */}
      {card.clinic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Associated Clinic</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{card.clinic.name}</h3>
              <p className="text-gray-600">{card.clinic.address}</p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600">
                <span>📧 {card.clinic.contact_email}</span>
                <span>📞 {formatPhoneNumber(card.clinic.contact_phone)}</span>
              </div>
              <p className="text-sm text-gray-600">
                Contact Person: {card.clinic.contact_person}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Perks */}
      {activePerks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <span>Available Benefits ({activePerks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {activePerks.map((perk) => (
                <div key={perk.id} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Gift className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{perk.perk_name}</h4>
                      <Badge variant="secondary">{perk.perk_category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{perk.perk_description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redeemed Perks */}
      {redeemedPerks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-gray-500" />
              <span>Redeemed Benefits ({redeemedPerks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {redeemedPerks.map((perk) => (
                <div key={perk.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg opacity-75">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-700">{perk.perk_name}</h4>
                      <Badge variant="outline">{perk.perk_category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{perk.perk_description}</p>
                    {perk.redeemed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Redeemed on {formatDate(perk.redeemed_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Perks Message */}
      {!card.perks || card.perks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No benefits have been assigned to this card yet.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Appointment Section */}
      <div>
        {!showAppointmentForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Book an Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Schedule an appointment with your clinic to use your dental benefits.
              </p>
              <Button
                onClick={() => setShowAppointmentForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request Appointment</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAppointmentForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AppointmentRequestForm
              cardCode={card.card_code}
              onSuccess={() => {
                setShowAppointmentForm(false);
                // Could add success message here
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}