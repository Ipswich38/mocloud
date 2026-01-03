import { createClient } from '@/lib/supabase';

export class AuthService {
  private supabase = createClient();

  // Sign in with username or email
  async signIn(usernameOrEmail: string, password: string) {
    try {
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

  // Sign up with username and email
  async signUp(username: string, email: string, password: string) {
    try {
      // Check if username already exists
      const { data: existingProfile } = await this.supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingProfile) {
        return { error: 'Username already taken' };
      }

      const { error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            display_name: username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
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