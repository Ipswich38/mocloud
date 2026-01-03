'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { cardLookupSchema, type CardLookupForm } from '@/lib/validation/schemas';
import { CardService } from '@/lib/database/CardService';
import { CardDetails } from './CardDetails';
import type { CardWithRelations } from '@/types';

export function CardLookupForm() {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<CardWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CardLookupForm>({
    resolver: zodResolver(cardLookupSchema)
  });

  const onSubmit = async (data: CardLookupForm) => {
    setLoading(true);
    setError(null);
    setCardData(null);

    try {
      const cardService = new CardService();
      const result = await cardService.lookupCard(data.card_code);

      if (result.status === 'error') {
        setError(result.error || 'An error occurred while looking up the card');
        return;
      }

      if (!result.data) {
        setError('Card not found. Please check your card code and try again.');
        return;
      }

      setCardData(result.data);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Card lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setCardData(null);
    setError(null);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Look Up Your Dental Benefits Card
          </h2>
          <p className="text-gray-600">
            Enter your 12-character card code to access your benefits and appointment history
          </p>
        </div>

        {!cardData ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="card_code" className="text-sm font-medium">
                Card Code
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="card_code"
                  {...register('card_code')}
                  placeholder="MC1234567890"
                  className="pr-10 text-center text-lg tracking-wider font-mono uppercase"
                  maxLength={12}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.card_code && (
                <p className="mt-1 text-sm text-red-600">{errors.card_code.message}</p>
              )}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Looking up card...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Look Up Card
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <CardDetails card={cardData} />
            <Button
              onClick={handleNewSearch}
              variant="outline"
              className="w-full"
            >
              Look Up Another Card
            </Button>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-blue-800">
            If you can't find your card code or need assistance, please contact your
            dental clinic or call our support line at{' '}
            <span className="font-medium">+63 (2) 8123-4567</span>.
          </p>
        </div>
      </div>
    </div>
  );
}