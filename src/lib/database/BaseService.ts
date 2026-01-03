import { createClient } from '@/lib/supabase';
import type { ApiResponse } from '@/types';

/**
 * Base service class for database operations
 * Provides common functionality for all service classes
 */
export class BaseService {
  protected supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Handle database errors and return standardized response
   */
  protected handleError<T>(error: any): ApiResponse<T> {
    console.error('Database error:', error);

    return {
      data: null,
      error: error.message || 'An unexpected error occurred',
      status: 'error'
    };
  }

  /**
   * Return successful response
   */
  protected handleSuccess<T>(data: T): ApiResponse<T> {
    return {
      data,
      error: null,
      status: 'success'
    };
  }

  /**
   * Execute a query with error handling
   */
  protected async executeQuery<T>(queryFn: () => Promise<any>): Promise<ApiResponse<T>> {
    try {
      const result = await queryFn();

      if (result.error) {
        return this.handleError<T>(result.error);
      }

      return this.handleSuccess<T>(result.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        return this.handleError<any>(error);
      }

      return this.handleSuccess(user);
    } catch (error) {
      return this.handleError<any>(error);
    }
  }

  /**
   * Check if current user has admin role
   */
  public async isAdmin(): Promise<boolean> {
    try {
      const userResult = await this.getCurrentUser();
      if (userResult.status === 'error' || !userResult.data) {
        return false;
      }

      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userResult.data.id)
        .single();

      return profile?.role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * Check if current user has clinic role
   */
  public async isClinicStaff(): Promise<boolean> {
    try {
      const userResult = await this.getCurrentUser();
      if (userResult.status === 'error' || !userResult.data) {
        return false;
      }

      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userResult.data.id)
        .single();

      return profile?.role === 'clinic';
    } catch {
      return false;
    }
  }
}