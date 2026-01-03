'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Loader2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { appointmentRequestSchema, type AppointmentRequestForm } from '@/lib/validation/schemas';
import { AppointmentService } from '@/lib/database/AppointmentService';
import { APPOINTMENT_TIME_SLOTS } from '@/constants';

interface AppointmentRequestFormProps {
  cardCode: string;
  onSuccess?: () => void;
}

export function AppointmentRequestForm({ cardCode, onSuccess }: AppointmentRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AppointmentRequestForm>({
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: {
      card_code: cardCode
    }
  });

  const onSubmit = async (data: AppointmentRequestForm) => {
    setLoading(true);
    setError(null);

    try {
      const appointmentService = new AppointmentService();
      const result = await appointmentService.createAppointmentRequest(data);

      if (result.status === 'error') {
        setError(result.error || 'Failed to create appointment request');
        return;
      }

      setSuccess(true);
      reset();

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Appointment request error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Appointment Request Submitted!
            </h3>
            <p className="text-green-800">
              Your appointment request has been sent to the clinic. They will contact you
              to confirm the appointment details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden card code field */}
          <input type="hidden" {...register('card_code')} />

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requested_date" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Preferred Date</span>
              </Label>
              <Input
                id="requested_date"
                type="date"
                min={today}
                {...register('requested_date')}
                className="mt-1"
              />
              {errors.requested_date && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="requested_time" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Preferred Time</span>
              </Label>
              <select
                id="requested_time"
                {...register('requested_time')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a time</option>
                {APPOINTMENT_TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.requested_time && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_time.message}</p>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label htmlFor="purpose">
              Purpose of Visit <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purpose"
              {...register('purpose')}
              placeholder="e.g., Dental cleaning, Check-up, Tooth extraction"
              className="mt-1"
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Any additional information for the clinic..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Submit Appointment Request
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">What happens next?</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Your request will be sent to the clinic</li>
              <li>• The clinic will contact you to confirm the appointment</li>
              <li>• You'll receive confirmation with final details</li>
              <li>• Bring this card to your appointment</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}