import { createClient } from '@/lib/supabase';
import { z } from 'zod';

export interface GeneratedCard {
  id: string;
  control_number: string;
  full_name: string;
  birth_date: string;
  address: string;
  contact_number: string;
  emergency_contact: string;
  clinic_id: string;
  category_id?: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  perks_total: number;
  perks_used: number;
  issue_date: string;
  expiry_date: string;
  qr_code_data?: string;
  tenant_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CardBatch {
  id: string;
  clinic_id: string;
  batch_name: string;
  total_cards: number;
  generated_cards: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  template_data: Record<string, any>;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface CardGenerationRequest {
  clinic_id: string;
  count: number;
  category_id?: string;
  batch_id?: string;
  prefix?: string;
  template_data?: Record<string, any>;
}

export interface GenerationResult {
  success: boolean;
  count: number;
  cards: GeneratedCard[];
  batch_id: string;
  prefix: string;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface GenerationProgress {
  batch_id: string;
  total: number;
  completed: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  current_step?: string;
}

const cardGenerationRequestSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic ID is required'),
  count: z.number().min(1, 'Count must be at least 1').max(10000, 'Count cannot exceed 10,000'),
  category_id: z.string().optional(),
  batch_id: z.string().optional(),
  prefix: z.string().min(2, 'Prefix must be at least 2 characters').max(5, 'Prefix cannot exceed 5 characters').regex(/^[A-Z]+$/, 'Prefix must contain only uppercase letters').optional(),
  template_data: z.record(z.string(), z.any()).optional()
});

export class CardGenerationService {
  private supabase = createClient();
  private defaultPrefixes = ['MOC', 'CARD', 'MCN'];
  private sequenceCounters = new Map<string, number>();

  constructor() {
    this.initializeSequenceCounters();
  }

  private async initializeSequenceCounters() {
    try {
      const { data: batches } = await this.supabase
        .from('card_batches')
        .select('id, total_cards')
        .order('created_at', { ascending: false })
        .limit(1);

      if (batches && batches.length > 0) {
        const lastBatch = batches[0];
        this.sequenceCounters.set('global', lastBatch.total_cards || 0);
      }
    } catch (error) {
      console.warn('Failed to initialize sequence counters:', error);
      this.sequenceCounters.set('global', 0);
    }
  }

  generateControlNumber(prefix: string = 'MOC', sequenceIndex: number = 0): string {
    const timestamp = Date.now();
    const sequenceNumber = (sequenceIndex + 1).toString().padStart(4, '0');
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
      .padEnd(6, '0');

    return `${prefix}-${timestamp}-${sequenceNumber}-${randomSuffix}`;
  }

  validateGenerationRequest(request: CardGenerationRequest): ValidationResult {
    try {
      cardGenerationRequestSchema.parse(request);

      const errors: string[] = [];

      if (request.count > 10000) {
        errors.push('Maximum 10,000 cards per batch allowed');
      }

      if (request.prefix && !this.isValidPrefix(request.prefix)) {
        errors.push('Invalid prefix format. Must be 2-5 uppercase letters');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map(e => e.message)
        };
      }

      return {
        isValid: false,
        errors: ['Invalid generation request']
      };
    }
  }

  private isValidPrefix(prefix: string): boolean {
    return /^[A-Z]{2,5}$/.test(prefix);
  }

  async generateCardBatch(request: CardGenerationRequest): Promise<GenerationResult> {
    const validation = this.validateGenerationRequest(request);

    if (!validation.isValid) {
      return {
        success: false,
        count: 0,
        cards: [],
        batch_id: '',
        prefix: request.prefix || 'MOC',
        errors: validation.errors
      };
    }

    const batchId = request.batch_id || `BATCH_${Date.now()}`;
    const prefix = request.prefix || 'MOC';

    try {
      const batch: CardBatch = {
        id: batchId,
        clinic_id: request.clinic_id,
        batch_name: `BATCH_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        total_cards: request.count,
        generated_cards: 0,
        status: 'generating',
        template_data: request.template_data || {},
        created_by: 'admin', // TODO: Get from auth context
        created_at: new Date().toISOString()
      };

      await this.createBatchRecord(batch);

      const cards: GeneratedCard[] = [];
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      for (let i = 0; i < request.count; i++) {
        const controlNumber = this.generateControlNumber(prefix, i);
        const issueDate = new Date().toISOString();

        const card: GeneratedCard = {
          id: `card_${Date.now()}_${i}`,
          control_number: controlNumber,
          full_name: this.generateRandomName(),
          birth_date: this.generateRandomBirthDate(),
          address: 'Philippines',
          contact_number: this.generatePhoneNumber(),
          emergency_contact: this.generatePhoneNumber(),
          clinic_id: request.clinic_id,
          category_id: request.category_id,
          status: 'active',
          perks_total: 10,
          perks_used: 0,
          issue_date: issueDate,
          expiry_date: expiryDate.toISOString(),
          qr_code_data: JSON.stringify({
            control_number: controlNumber,
            issued: issueDate,
            clinic_id: request.clinic_id
          }),
          tenant_id: request.clinic_id,
          metadata: {
            batch_id: batchId,
            generation_timestamp: Date.now(),
            ...request.template_data
          },
          created_at: issueDate,
          updated_at: issueDate
        };

        cards.push(card);

        if ((i + 1) % 100 === 0) {
          await this.updateBatchProgress(batchId, i + 1, request.count, 'generating');
        }
      }

      await this.saveBatchCards(cards);

      await this.updateBatchProgress(batchId, request.count, request.count, 'completed');

      return {
        success: true,
        count: cards.length,
        cards,
        batch_id: batchId,
        prefix
      };

    } catch (error) {
      await this.updateBatchProgress(batchId, 0, request.count, 'failed');

      return {
        success: false,
        count: 0,
        cards: [],
        batch_id: batchId,
        prefix,
        errors: [error instanceof Error ? error.message : 'Generation failed']
      };
    }
  }

  private async createBatchRecord(batch: CardBatch): Promise<void> {
    const { error } = await this.supabase
      .from('card_batches')
      .insert([{
        id: batch.id,
        clinic_id: batch.clinic_id,
        batch_name: batch.batch_name,
        total_cards: batch.total_cards,
        generated_cards: batch.generated_cards,
        status: batch.status,
        template_data: batch.template_data,
        created_by: batch.created_by,
        created_at: batch.created_at
      }]);

    if (error) {
      throw new Error(`Failed to create batch record: ${error.message}`);
    }
  }

  private async updateBatchProgress(batchId: string, generated: number, total: number, status: CardBatch['status']): Promise<void> {
    const updates: Partial<CardBatch> = {
      generated_cards: generated,
      status
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('card_batches')
      .update(updates)
      .eq('id', batchId);

    if (error) {
      console.error('Failed to update batch progress:', error);
    }
  }

  private async saveBatchCards(cards: GeneratedCard[]): Promise<void> {
    const cardsToInsert = cards.map(card => ({
      id: card.id,
      control_number: card.control_number,
      full_name: card.full_name,
      birth_date: card.birth_date,
      address: card.address,
      contact_number: card.contact_number,
      emergency_contact: card.emergency_contact,
      clinic_id: card.clinic_id,
      category_id: card.category_id,
      status: card.status,
      perks_total: card.perks_total,
      perks_used: card.perks_used,
      issue_date: card.issue_date,
      expiry_date: card.expiry_date,
      qr_code_data: card.qr_code_data,
      tenant_id: card.tenant_id,
      metadata: card.metadata,
      created_at: card.created_at,
      updated_at: card.updated_at
    }));

    const BATCH_SIZE = 100;
    for (let i = 0; i < cardsToInsert.length; i += BATCH_SIZE) {
      const batch = cardsToInsert.slice(i, i + BATCH_SIZE);

      const { error } = await this.supabase
        .from('cards')
        .insert(batch);

      if (error) {
        throw new Error(`Failed to save batch cards: ${error.message}`);
      }
    }
  }

  async trackGenerationProgress(batchId: string): Promise<GenerationProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('card_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        batch_id: batchId,
        total: data.total_cards,
        completed: data.generated_cards,
        status: data.status,
        current_step: data.status === 'generating' ? `Generating cards...` : undefined
      };
    } catch (error) {
      console.error('Failed to track generation progress:', error);
      return null;
    }
  }

  async exportBatchToCSV(batchId: string): Promise<Blob> {
    try {
      const { data: cards, error } = await this.supabase
        .from('cards')
        .select('*')
        .eq('metadata->batch_id', batchId);

      if (error) {
        throw new Error(`Failed to fetch batch cards: ${error.message}`);
      }

      const headers = [
        'Card ID',
        'Control Number',
        'Full Name',
        'Birth Date',
        'Address',
        'Contact Number',
        'Emergency Contact',
        'Clinic ID',
        'Status',
        'Perks Total',
        'Perks Used',
        'Issue Date',
        'Expiry Date',
        'Generated At'
      ];

      const csvContent = [
        headers.join(','),
        ...(cards || []).map(card => [
          card.id,
          card.control_number,
          `"${card.full_name}"`,
          card.birth_date,
          `"${card.address}"`,
          card.contact_number,
          card.emergency_contact,
          card.clinic_id,
          card.status,
          card.perks_total,
          card.perks_used,
          card.issue_date,
          card.expiry_date,
          card.created_at
        ].join(','))
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      throw new Error(`Failed to export batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getDefaultPrefixes(): string[] {
    return [...this.defaultPrefixes];
  }

  getQuickQuantities(): number[] {
    return [1, 10, 100, 1000];
  }

  getControlNumberPreview(prefix: string = 'MOC'): string {
    return `${prefix}-${Date.now()}-0001-ABC123`;
  }

  private generateRandomName(): string {
    const firstNames = [
      'Maria', 'Jose', 'Ana', 'Juan', 'Rosa', 'Pedro', 'Carmen', 'Luis',
      'Elena', 'Miguel', 'Sofia', 'Carlos', 'Isabella', 'Fernando', 'Lucia'
    ];
    const lastNames = [
      'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza',
      'Torres', 'Flores', 'Morales', 'Rivera', 'Gomez', 'Hernandez', 'Lopez', 'Gonzalez'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  private generateRandomBirthDate(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    return randomDate.toISOString().split('T')[0];
  }

  private generatePhoneNumber(): string {
    const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(1000000 + Math.random() * 9000000);

    return `${prefix}${number}`;
  }
}