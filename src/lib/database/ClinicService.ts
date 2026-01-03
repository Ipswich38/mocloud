import { BaseService } from './BaseService';
import type {
  Clinic,
  ClinicWithRelations,
  ClinicCode,
  Region,
  ApiResponse,
  ClinicRegistrationForm
} from '@/types';
import { TABLES, REGIONS } from '@/constants';
import { generateClinicCode } from '@/lib/utils/index';

/**
 * Service class for clinic-related database operations
 */
export class ClinicService extends BaseService {

  /**
   * Register a new clinic
   */
  public async registerClinic(clinicData: ClinicRegistrationForm): Promise<ApiResponse<Clinic>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can register new clinics');
      }

      // Find next available clinic code for the region
      const region = REGIONS.find(r => r.id === clinicData.region_id);
      if (!region) {
        throw new Error('Invalid region selected');
      }

      // Get existing clinic codes for this region
      const { data: existingCodes } = await this.supabase
        .from(TABLES.CLINIC_CODES)
        .select('code')
        .eq('region_id', clinicData.region_id)
        .eq('is_assigned', true);

      // Find next available sequence number
      const usedSequences = (existingCodes || [])
        .map(code => parseInt(code.code.slice(-3)))
        .filter(num => !isNaN(num));

      let nextSequence = 1;
      while (usedSequences.includes(nextSequence) && nextSequence <= 16) {
        nextSequence++;
      }

      if (nextSequence > 16) {
        throw new Error(`No available clinic codes for region ${region.name}`);
      }

      const newClinicCode = generateClinicCode(region.code, nextSequence);

      // Create clinic code record
      const { data: clinicCode, error: codeError } = await this.supabase
        .from(TABLES.CLINIC_CODES)
        .insert([{
          region_id: clinicData.region_id,
          code: newClinicCode,
          is_assigned: true
        }])
        .select()
        .single();

      if (codeError) throw codeError;

      // Create clinic record
      const { data: clinic, error: clinicError } = await this.supabase
        .from(TABLES.CLINICS)
        .insert([{
          clinic_code_id: clinicCode.id,
          name: clinicData.name,
          address: clinicData.address,
          contact_email: clinicData.contact_email,
          contact_phone: clinicData.contact_phone,
          contact_person: clinicData.contact_person,
          is_active: true
        }])
        .select()
        .single();

      if (clinicError) throw clinicError;

      return { data: clinic };
    });
  }

  /**
   * Get all clinics
   */
  public async getAllClinics(): Promise<ApiResponse<ClinicWithRelations[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .select(`
          *,
          clinic_code:clinic_codes(*),
          region:clinic_codes!inner(regions(*))
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Get clinic by ID
   */
  public async getClinicById(clinicId: string): Promise<ApiResponse<ClinicWithRelations | null>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .select(`
          *,
          clinic_code:clinic_codes(*),
          region:clinic_codes!inner(regions(*))
        `)
        .eq('id', clinicId)
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        return { data: null };
      }

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Update clinic information
   */
  public async updateClinic(
    clinicId: string,
    updates: Partial<ClinicRegistrationForm>
  ): Promise<ApiResponse<Clinic>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can update clinic information');
      }

      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Deactivate clinic
   */
  public async deactivateClinic(clinicId: string): Promise<ApiResponse<Clinic>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can deactivate clinics');
      }

      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Get available clinic codes for a region
   */
  public async getAvailableClinicCodes(regionId: string): Promise<ApiResponse<string[]>> {
    return this.executeQuery(async () => {
      const region = REGIONS.find(r => r.id === regionId);
      if (!region) {
        throw new Error('Invalid region');
      }

      const { data: usedCodes } = await this.supabase
        .from(TABLES.CLINIC_CODES)
        .select('code')
        .eq('region_id', regionId)
        .eq('is_assigned', true);

      const usedSequences = (usedCodes || [])
        .map(code => parseInt(code.code.slice(-3)))
        .filter(num => !isNaN(num));

      const availableCodes = [];
      for (let i = 1; i <= 16; i++) {
        if (!usedSequences.includes(i)) {
          availableCodes.push(generateClinicCode(region.code, i));
        }
      }

      return { data: availableCodes };
    });
  }

  /**
   * Get clinic statistics
   */
  public async getClinicStats(): Promise<ApiResponse<{
    totalClinics: number;
    activeClinics: number;
    inactiveClinics: number;
    regionBreakdown: Record<string, number>;
  }>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Only admins can view clinic statistics');
      }

      const { data: clinics, error } = await this.supabase
        .from(TABLES.CLINICS)
        .select(`
          is_active,
          clinic_code:clinic_codes!inner(
            region:regions(name)
          )
        `);

      if (error) throw error;

      const stats = {
        totalClinics: clinics.length,
        activeClinics: clinics.filter(c => c.is_active).length,
        inactiveClinics: clinics.filter(c => !c.is_active).length,
        regionBreakdown: {} as Record<string, number>
      };

      // Count clinics by region
      clinics.forEach((clinic: any) => {
        const regionName = clinic.clinic_code?.region?.name;
        if (regionName) {
          stats.regionBreakdown[regionName] =
            (stats.regionBreakdown[regionName] || 0) + 1;
        }
      });

      return { data: stats };
    });
  }

  /**
   * Search clinics by name or location
   */
  public async searchClinics(searchTerm: string): Promise<ApiResponse<ClinicWithRelations[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .select(`
          *,
          clinic_code:clinic_codes(*),
          region:clinic_codes!inner(regions(*))
        `)
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Get clinics by region
   */
  public async getClinicsByRegion(regionId: string): Promise<ApiResponse<ClinicWithRelations[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.CLINICS)
        .select(`
          *,
          clinic_code:clinic_codes!inner(*),
          region:clinic_codes!inner(regions(*))
        `)
        .eq('clinic_codes.region_id', regionId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return { data: data || [] };
    });
  }
}