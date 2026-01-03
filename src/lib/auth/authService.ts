import { createClient } from '@/lib/supabase';

export class AuthService {
  private supabase = createClient();

  // Built-in admin bypass for immediate access
  private isBuiltinAdmin(username: string, password: string): boolean {
    return username === 'admin' && password === 'admin123';
  }

  // Create a session for built-in admin
  private async createAdminSession() {
    // Try to find existing admin user or create one
    let { data: existingProfile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('username', 'admin')
      .eq('role', 'admin')
      .single();

    if (!existingProfile) {
      // Create admin profile with a fixed UUID
      const adminId = '550e8400-e29b-41d4-a716-446655440000'; // Fixed UUID for admin
      const adminEmail = `admin-system@local-${Date.now()}`;

      // Insert admin profile directly
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .insert({
          id: adminId,
          username: 'admin',
          display_name: 'Administrator',
          email: adminEmail,
          role: 'admin'
        });

      if (!profileError) {
        existingProfile = {
          id: adminId,
          username: 'admin',
          display_name: 'Administrator',
          email: adminEmail,
          role: 'admin',
          clinic_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    return existingProfile;
  }

  // Sign in with username or email
  async signIn(usernameOrEmail: string, password: string) {
    try {
      // Built-in admin check - bypass all auth for admin/admin123
      if (this.isBuiltinAdmin(usernameOrEmail, password)) {
        const adminProfile = await this.createAdminSession();
        if (adminProfile) {
          // Store admin session locally for the app to use
          localStorage.setItem('mocards_admin_session', JSON.stringify({
            user: { id: adminProfile.id, email: adminProfile.email },
            profile: adminProfile
          }));
          return { error: null };
        }
        return { error: 'Admin setup failed' };
      }

      // Regular auth flow for other users
      const isEmail = usernameOrEmail.includes('@');

      if (isEmail) {
        const { error } = await this.supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password
        });
        return { error: error?.message || null };
      } else {
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