import { BaseService } from './BaseService';
import type {
  Appointment,
  AppointmentWithRelations,
  ApiResponse,
  AppointmentRequestForm
} from '@/types';
import { TABLES } from '@/constants';

/**
 * Service class for appointment-related database operations
 */
export class AppointmentService extends BaseService {

  /**
   * Create a new appointment request
   */
  public async createAppointmentRequest(
    appointmentData: AppointmentRequestForm
  ): Promise<ApiResponse<Appointment>> {
    return this.executeQuery(async () => {
      // First, verify the card exists and get the clinic
      const { data: card, error: cardError } = await this.supabase
        .from(TABLES.CARDS)
        .select('id, clinic_id, is_active')
        .eq('card_code', appointmentData.card_code.toUpperCase())
        .single();

      if (cardError || !card) {
        throw new Error('Card not found or invalid');
      }

      if (!card.is_active) {
        throw new Error('Card is not active');
      }

      // Create appointment request
      const { data: appointment, error: appointmentError } = await this.supabase
        .from(TABLES.APPOINTMENTS)
        .insert([{
          card_id: card.id,
          clinic_id: card.clinic_id,
          requested_date: appointmentData.requested_date,
          requested_time: appointmentData.requested_time,
          purpose: appointmentData.purpose,
          notes: appointmentData.notes,
          status: 'pending'
        }])
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      return { data: appointment };
    });
  }

  /**
   * Get all appointments for a clinic
   */
  public async getClinicAppointments(
    clinicId?: string,
    status?: string
  ): Promise<ApiResponse<AppointmentWithRelations[]>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isClinicStaff() || await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Unauthorized to view appointments');
      }

      let finalClinicId = clinicId;

      // If no clinic ID provided and user is clinic staff, use their clinic
      if (!finalClinicId && await this.isClinicStaff()) {
        const userResult = await this.getCurrentUser();
        if (!userResult.data || !userResult.data.id) {
          throw new Error('User not authenticated');
        }

        const { data: profile } = await this.supabase
          .from('user_profiles')
          .select('clinic_id')
          .eq('id', userResult.data.id)
          .single();

        finalClinicId = profile?.clinic_id;
      }

      let query = this.supabase
        .from(TABLES.APPOINTMENTS)
        .select(`
          *,
          card:cards(*),
          clinic:clinics(*)
        `)
        .order('created_at', { ascending: false });

      if (finalClinicId) {
        query = query.eq('clinic_id', finalClinicId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Update appointment status
   */
  public async updateAppointmentStatus(
    appointmentId: string,
    status: 'confirmed' | 'rejected' | 'completed',
    notes?: string
  ): Promise<ApiResponse<Appointment>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isClinicStaff() || await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Unauthorized to update appointments');
      }

      const { data, error } = await this.supabase
        .from(TABLES.APPOINTMENTS)
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Get appointment by ID
   */
  public async getAppointmentById(
    appointmentId: string
  ): Promise<ApiResponse<AppointmentWithRelations | null>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.APPOINTMENTS)
        .select(`
          *,
          card:cards(*),
          clinic:clinics(*)
        `)
        .eq('id', appointmentId)
        .single();

      if (error && error.code === 'PGRST116') {
        return { data: null };
      }

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Get appointments for a specific card
   */
  public async getCardAppointments(
    cardCode: string
  ): Promise<ApiResponse<AppointmentWithRelations[]>> {
    return this.executeQuery(async () => {
      // First get the card ID
      const { data: card, error: cardError } = await this.supabase
        .from(TABLES.CARDS)
        .select('id')
        .eq('card_code', cardCode.toUpperCase())
        .single();

      if (cardError || !card) {
        throw new Error('Card not found');
      }

      const { data, error } = await this.supabase
        .from(TABLES.APPOINTMENTS)
        .select(`
          *,
          card:cards(*),
          clinic:clinics(*)
        `)
        .eq('card_id', card.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Get appointment statistics
   */
  public async getAppointmentStats(
    clinicId?: string
  ): Promise<ApiResponse<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    rejected: number;
  }>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isClinicStaff() || await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Unauthorized to view appointment statistics');
      }

      let query = this.supabase
        .from(TABLES.APPOINTMENTS)
        .select('status');

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const appointments = data || [];
      const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        rejected: appointments.filter(a => a.status === 'rejected').length
      };

      return { data: stats };
    });
  }

  /**
   * Get upcoming appointments
   */
  public async getUpcomingAppointments(
    clinicId?: string,
    days = 7
  ): Promise<ApiResponse<AppointmentWithRelations[]>> {
    return this.executeQuery(async () => {
      const isAuthorized = await this.isClinicStaff() || await this.isAdmin();
      if (!isAuthorized) {
        throw new Error('Unauthorized to view appointments');
      }

      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      let query = this.supabase
        .from(TABLES.APPOINTMENTS)
        .select(`
          *,
          card:cards(*),
          clinic:clinics(*)
        `)
        .eq('status', 'confirmed')
        .gte('requested_date', today.toISOString().split('T')[0])
        .lte('requested_date', futureDate.toISOString().split('T')[0])
        .order('requested_date')
        .order('requested_time');

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data || [] };
    });
  }

  /**
   * Cancel appointment
   */
  public async cancelAppointment(
    appointmentId: string,
    reason?: string
  ): Promise<ApiResponse<Appointment>> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from(TABLES.APPOINTMENTS)
        .update({
          status: 'rejected',
          notes: reason || 'Cancelled by user',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('status', 'pending') // Only allow cancelling pending appointments
        .select()
        .single();

      if (error) throw error;

      return { data };
    });
  }

  /**
   * Check for appointment conflicts
   */
  public async checkAppointmentConflict(
    clinicId: string,
    date: string,
    time: string,
    excludeId?: string
  ): Promise<ApiResponse<boolean>> {
    return this.executeQuery(async () => {
      let query = this.supabase
        .from(TABLES.APPOINTMENTS)
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('requested_date', date)
        .eq('requested_time', time)
        .in('status', ['pending', 'confirmed']);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: (data || []).length > 0 };
    });
  }
}