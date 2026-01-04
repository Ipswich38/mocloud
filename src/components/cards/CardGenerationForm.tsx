'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Download, Zap, AlertCircle, Users, Clock } from 'lucide-react';
import {
  CardGenerationService,
  type CardGenerationRequest,
  type GenerationResult,
  type GenerationProgress
} from '@/lib/services/CardGenerationService';
import { toast } from 'sonner';

interface CardGenerationFormProps {
  clinics?: Array<{ id: string; name: string; region: string }>;
  onGenerationComplete?: (result: GenerationResult) => void;
}

export function CardGenerationForm({ clinics = [], onGenerationComplete }: CardGenerationFormProps) {
  const [cardService] = useState(() => new CardGenerationService());

  const [quantity, setQuantity] = useState<number>(1);
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('MOC');
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [clinicId, setClinicId] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const quickQuantities = cardService.getQuickQuantities();
  const defaultPrefixes = cardService.getDefaultPrefixes();

  const effectivePrefix = customPrefix.toUpperCase() || prefix;
  const effectiveQuantity = customQuantity ? parseInt(customQuantity) : quantity;

  const previewControlNumber = cardService.getControlNumberPreview(effectivePrefix);

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (effectiveQuantity < 1 || effectiveQuantity > 100000) {
      validationErrors.push('Quantity must be between 1 and 100,000');
    }

    if (effectivePrefix.length < 2 || effectivePrefix.length > 5) {
      validationErrors.push('Prefix must be 2-5 characters');
    }

    if (!/^[A-Z]+$/.test(effectivePrefix)) {
      validationErrors.push('Prefix must contain only letters');
    }

    if (!clinicId) {
      validationErrors.push('Please select a clinic');
    }

    return validationErrors;
  };

  const handleQuickQuantitySelect = (qty: number) => {
    setQuantity(qty);
    setCustomQuantity('');
  };

  const handleCustomQuantityChange = (value: string) => {
    setCustomQuantity(value);
    setQuantity(0); // Reset quick selection
  };

  const handlePrefixSelect = (selectedPrefix: string) => {
    setPrefix(selectedPrefix);
    setCustomPrefix('');
  };

  const handleCustomPrefixChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCustomPrefix(upperValue);
    setPrefix(''); // Reset default selection
  };

  const pollGenerationProgress = async (batchId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setGenerationProgress(null);
        return;
      }

      try {
        const progress = await cardService.trackGenerationProgress(batchId);
        if (progress) {
          setGenerationProgress(progress);

          if (progress.status === 'completed' || progress.status === 'failed') {
            setGenerationProgress(null);
            return;
          }
        }

        attempts++;
        setTimeout(poll, 5000); // Poll every 5 seconds
      } catch (error) {
        console.error('Failed to poll generation progress:', error);
        setGenerationProgress(null);
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsGenerating(true);
    setLastResult(null);
    setGenerationProgress(null);

    const batchId = `BATCH_${Date.now()}`;

    const request: CardGenerationRequest = {
      clinic_id: clinicId,
      count: effectiveQuantity,
      prefix: effectivePrefix,
      batch_id: batchId,
      template_data: {
        generated_by: 'admin',
        generation_source: 'admin_panel',
        clinic_name: clinics.find(c => c.id === clinicId)?.name
      }
    };

    try {
      pollGenerationProgress(batchId);

      const result = await cardService.generateCardBatch(request);

      setLastResult(result);

      if (result.success) {
        toast.success(
          `Successfully generated ${result.count} card${result.count > 1 ? 's' : ''} with prefix ${result.prefix}`
        );
        onGenerationComplete?.(result);
      } else {
        toast.error('Generation failed: ' + (result.errors?.[0] || 'Unknown error'));
        setErrors(result.errors || ['Generation failed']);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      toast.error(errorMessage);
      setErrors([errorMessage]);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const handleExportCSV = async () => {
    if (!lastResult?.batch_id) return;

    try {
      const blob = await cardService.exportBatchToCSV(lastResult.batch_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mocards_batch_${lastResult.batch_id}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    }
  };

  const getProgressPercentage = () => {
    if (!generationProgress) return 0;
    return Math.round((generationProgress.completed / generationProgress.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      {!lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              MOC Card Generation
            </CardTitle>
            <p className="text-gray-600">Generate dental benefit cards with format MOC-XXXXXX-RRR-CCCCCC (up to 100,000 per clinic)</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Quantity Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Quantity Selection</Label>

              {/* Quick Selection Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickQuantities.map((qty) => (
                  <Button
                    key={qty}
                    type="button"
                    variant={quantity === qty && !customQuantity ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickQuantitySelect(qty)}
                  >
                    {qty.toLocaleString()} card{qty > 1 ? 's' : ''}
                  </Button>
                ))}
              </div>

              {/* Custom Quantity Input */}
              <div>
                <Label htmlFor="customQuantity">Custom Quantity (1-100,000)</Label>
                <Input
                  id="customQuantity"
                  type="number"
                  min="1"
                  max="100000"
                  value={customQuantity}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  placeholder="Enter custom quantity"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Prefix Configuration */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Control Number Prefix</Label>

              {/* Default Prefix Buttons */}
              <div className="flex flex-wrap gap-2">
                {defaultPrefixes.map((defaultPrefix) => (
                  <Button
                    key={defaultPrefix}
                    type="button"
                    variant={prefix === defaultPrefix && !customPrefix ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrefixSelect(defaultPrefix)}
                  >
                    {defaultPrefix}
                  </Button>
                ))}
              </div>

              {/* Custom Prefix Input */}
              <div>
                <Label htmlFor="customPrefix">Custom Prefix (2-5 letters)</Label>
                <Input
                  id="customPrefix"
                  type="text"
                  value={customPrefix}
                  onChange={(e) => handleCustomPrefixChange(e.target.value)}
                  placeholder="Enter custom prefix"
                  maxLength={5}
                  className="mt-1 uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            {/* Real-time Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">Control Number Preview</Label>
              <div className="mt-2">
                <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                  {previewControlNumber}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                New Format: MOC-{(effectiveQuantity || 1).toString().padStart(6, '0')}-{clinics.find(c => c.id === clinicId)?.region || 'RRR'}-{clinics.find(c => c.id === clinicId)?.region || 'CCC'}001
              </p>
            </div>

            {/* Clinic Selection */}
            <div>
              <Label htmlFor="clinic">Target Clinic</Label>
              <Select value={clinicId} onValueChange={setClinicId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generation Progress */}
            {(isGenerating || generationProgress) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">
                    {generationProgress?.current_step || `Generating ${effectiveQuantity.toLocaleString()} cards...`}
                  </span>
                </div>
                {generationProgress && (
                  <div className="space-y-2">
                    <Progress value={getProgressPercentage()} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{generationProgress.completed.toLocaleString()} / {generationProgress.total.toLocaleString()} cards</span>
                      <span>{getProgressPercentage()}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || effectiveQuantity < 1 || !clinicId}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating {effectiveQuantity.toLocaleString()} cards...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate {effectiveQuantity.toLocaleString()} Card{effectiveQuantity > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {lastResult && lastResult.success && (
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully generated {lastResult.count.toLocaleString()} cards with prefix "{lastResult.prefix}"
            </AlertDescription>
          </Alert>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{lastResult.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Cards Generated</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                  {lastResult.prefix}
                </Badge>
                <div className="text-sm text-gray-600 mt-2">Prefix Used</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">Ready</div>
                <div className="text-sm text-gray-600">Status</div>
              </CardContent>
            </Card>
          </div>

          {/* Card Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Cards Preview</CardTitle>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <div className="space-y-2">
                  {lastResult.cards.slice(0, 10).map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-mono text-sm font-medium">{card.control_number}</div>
                        <div className="text-sm text-gray-600">{card.full_name}</div>
                      </div>
                      <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                        {card.status}
                      </Badge>
                    </div>
                  ))}
                  {lastResult.cards.length > 10 && (
                    <div className="text-center text-gray-500 p-4 border rounded-lg border-dashed">
                      ... and {(lastResult.cards.length - 10).toLocaleString()} more cards
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => setLastResult(null)}
              variant="outline"
              className="flex-1"
            >
              Generate Another Batch
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}