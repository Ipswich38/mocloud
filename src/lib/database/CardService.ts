import { BaseService } from './BaseService';
import type {
  Card,
  CardWithRelations,
  CardPerk,
  ApiResponse,
  CardGenerationForm
} from '@/types';
import { generateCardCode } from '@/lib/utils/index';
import { TABLES, DEFAULT_PERKS } from '@/constants';

/**
 * Service class for card-related database operations
 */
export class CardService extends BaseService {

  /**
   * Generate a new card with perks
   */
  public async generateCard(cardData: CardGenerationForm): Promise<ApiResponse<Card>> {
    return this.executeQuery(async () => {
      // Check if user has permission to generate cards
      const isAuthorized = await this.isAdmin() || await this.isClinicStaff();
      if (!isAuthorized) {
        throw new Error('Unauthorized to generate cards');
      }

      const cardCode = generateCardCode();
      const userResult = await this.getCurrentUser();

      if (!userResult.data) {
        throw new Error('User not authenticated');
      }

      // Insert the card
      const { data: card, error: cardError } = await this.supabase
        .from(TABLES.CARDS)
        .insert([{
          card_code: cardCode,
          patient_name: cardData.patient_name,
          patient_birthdate: cardData.patient_birthdate,
          patient_address: cardData.patient_address,
          patient_phone: cardData.patient_phone,
          clinic_id: cardData.clinic_id,
          is_active: true,
          generated_by: userResult.data.id
        }])
        .select()
        .single();

      if (cardError) throw cardError;

      // Insert associated perks
      const perksToInsert = cardData.perks.map(perk => ({
        card_id: card.id,
        perk_name: perk.name,
        perk_description: perk.description,
        perk_category: perk.category,
        is_redeemed: false
      }));

      const { error: perksError } = await this.supabase
        .from(TABLES.CARD_PERKS)
        .insert(perksToInsert);

      if (perksError) throw perksError;

      return { data: card };
    });
  }

  /**
   * Generate multiple cards in batch
   */
  public async generateCardBatch(
    cardsData: CardGenerationForm[],
    useDefaultPerks = true
  ): Promise<ApiResponse<Card[]>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can generate card batches');
      }

      const userResult = await this.getCurrentUser();
      if (!userResult.data) {
        throw new Error('User not authenticated');
      }

      // Prepare cards for batch insert
      const cardsToInsert = cardsData.map(cardData => ({
        card_code: generateCardCode(),
        patient_name: cardData.patient_name,
        patient_birthdate: cardData.patient_birthdate,
        patient_address: cardData.patient_address,
        patient_phone: cardData.patient_phone,
        clinic_id: cardData.clinic_id,
        is_active: true,
        generated_by: userResult.data.id
      }));

      // Insert cards
      const { data: cards, error: cardsError } = await this.supabase
        .from(TABLES.CARDS)
        .insert(cardsToInsert)
        .select();

      if (cardsError) throw cardsError;

      // Insert perks for all cards
      const perksToInsert = cards.flatMap(card => {
        const perks = useDefaultPerks ? DEFAULT_PERKS : cardsData.find(c =>
          c.patient_name === card.patient_name
        )?.perks || [];

        return perks.map(perk => ({
          card_id: card.id,
          perk_name: perk.name,
          perk_description: perk.description,
          perk_category: perk.category,
          is_redeemed: false
        }));
      });

      if (perksToInsert.length > 0) {
        const { error: perksError } = await this.supabase
          .from(TABLES.CARD_PERKS)
          .insert(perksToInsert);

        if (perksError) throw perksError;
      }

      return { data: cards };
    });
  }

  /**
   * Look up a card by card code (public access)
   */
  public async lookupCard(cardCode: string): Promise<ApiResponse<CardWithRelations | null>> {
    return this.executeQuery(async () => {
      const { data: card, error } = await this.supabase
        .from(TABLES.CARDS)
        .select(`
          *,
          clinic:clinics(*),
          perks:card_perks(*)
        `)
        .eq('card_code', cardCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        // Card not found
        return { data: null };
      }

      if (error) throw error;

      return { data: card };
    });
  }

  /**
   * Get all cards (admin/clinic access)
   */
  public async getAllCards(clinicId?: string): Promise<ApiResponse<CardWithRelations[]>> {
    return this.executeQuery(async () => {
      let query = this.supabase
        .from(TABLES.CARDS)
        .select(`
          *,
          clinic:clinics(*),
          perks:card_perks(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // If clinic ID is provided, filter by clinic
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Get cards for current user's clinic
   */
  public async getClinicCards(): Promise<ApiResponse<CardWithRelations[]>> {
    return this.executeQuery(async () => {
      const userResult = await this.getCurrentUser();
      if (!userResult.data) {
        throw new Error('User not authenticated');
      }

      // Get user's clinic ID
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('clinic_id')
        .eq('id', userResult.data.id)
        .single();

      if (!profile?.clinic_id) {
        throw new Error('User is not associated with a clinic');
      }

      return this.getAllCards(profile.clinic_id);
    });
  }

  /**
   * Update card status
   */
  public async updateCardStatus(cardId: string, isActive: boolean): Promise<ApiResponse<Card>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can update card status');
      }

      const { data, error } = await this.supabase
        .from(TABLES.CARDS)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Redeem a perk
   */
  public async redeemPerk(
    perkId: string,
    redemptionNotes?: string
  ): Promise<ApiResponse<CardPerk>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isClinicStaff() || await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Unauthorized to redeem perks');
      }

      const userResult = await this.getCurrentUser();
      if (!userResult.data) {
        throw new Error('User not authenticated');
      }

      // Update perk as redeemed
      const { data: perk, error: perkError } = await this.supabase
        .from(TABLES.CARD_PERKS)
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
          redeemed_by: userResult.data.id
        })
        .eq('id', perkId)
        .eq('is_redeemed', false)
        .select()
        .single();

      if (perkError) throw perkError;

      // Create redemption record
      const { error: redemptionError } = await this.supabase
        .from(TABLES.PERK_REDEMPTIONS)
        .insert([{
          perk_id: perkId,
          redeemed_by: userResult.data.id,
          redemption_notes: redemptionNotes
        }]);

      if (redemptionError) throw redemptionError;

      return { data: perk };
    });
  }

  /**
   * Get card statistics
   */
  public async getCardStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    totalPerks: number;
    redeemedPerks: number;
  }>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can view card statistics');
      }

      const [cardsResult, perksResult] = await Promise.all([
        this.supabase
          .from(TABLES.CARDS)
          .select('is_active'),
        this.supabase
          .from(TABLES.CARD_PERKS)
          .select('is_redeemed')
      ]);

      if (cardsResult.error) throw cardsResult.error;
      if (perksResult.error) throw perksResult.error;

      const cards = cardsResult.data || [];
      const perks = perksResult.data || [];

      const stats = {
        total: cards.length,
        active: cards.filter(c => c.is_active).length,
        inactive: cards.filter(c => !c.is_active).length,
        totalPerks: perks.length,
        redeemedPerks: perks.filter(p => p.is_redeemed).length
      };

      return { data: stats };
    });
  }
}