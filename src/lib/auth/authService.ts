import { createClient } from '@/lib/supabase';

export class AuthService {
  private supabase = createClient();

  // Auto-setup admin user if it doesn't exist
  private async autoSetupAdmin() {
    try {
      // Check if admin profile already exists
      const { data: existingProfile } = await this.supabase
        .from('user_profiles')
        .select('id, username')
        .eq('username', 'admin')
        .single();

      if (existingProfile) {
        return; // Admin already exists
      }

      // Create admin user in auth.users with a generated email
      const adminEmail = `admin-${Date.now()}@local.mocards`;
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: adminEmail,
        password: 'admin123',
        options: {
          data: {
            username: 'admin',
            display_name: 'Administrator'
          }
        }
      });

      if (authError || !authData.user) {
        console.warn('Could not auto-create auth user:', authError?.message);
        return;
      }

      // Create user profile
      await this.supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: 'admin',
          display_name: 'Administrator',
          email: adminEmail,
          role: 'admin'
        });

    } catch (error) {
      console.warn('Auto-setup admin failed:', error);
    }
  }

  // Sign in with username or email
  async signIn(usernameOrEmail: string, password: string) {
    try {
      // Auto-setup admin if needed (for first-time setup)
      if (usernameOrEmail === 'admin') {
        await this.autoSetupAdmin();
      }

      // Check if input looks like email
      const isEmail = usernameOrEmail.includes('@');

      if (isEmail) {
        // Direct email login
        const { error } = await this.supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password
        });
        return { error: error?.message || null };
      } else {
        // Username login - first get email from username
        const { data: profile } = await this.supabase
          .from('user_profiles')
          .select('email')
          .eq('username', usernameOrEmail)
          .single();

        if (!profile) {
          return { error: 'Username not found' };
        }

        const { error } = await this.supabase.auth.signInWithPassword({
          email: profile.email,
          password
        });
        return { error: error?.message || null };
      }
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }


  // Get current session
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // Sign out
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error: error?.message || null };
  }

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    return { error: error?.message || null };
  }
}

export const authService = new AuthService();