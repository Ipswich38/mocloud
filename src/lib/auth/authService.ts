export class AuthService {
  // Built-in admin bypass for immediate access - no database required
  private isBuiltinAdmin(username: string, password: string): boolean {
    return username === 'admin' && password === 'admin123';
  }

  // Create hardcoded admin session data
  createBuiltinAdminSession() {
    return {
      user: {
        id: 'admin-built-in',
        email: 'admin@system.local'
      },
      profile: {
        id: 'admin-built-in',
        username: 'admin',
        display_name: 'Administrator',
        email: 'admin@system.local',
        role: 'admin' as const,
        clinic_id: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Sign in with username - pure client side for admin
  async signIn(usernameOrEmail: string, password: string) {
    // Built-in admin check - completely client-side
    if (this.isBuiltinAdmin(usernameOrEmail, password)) {
      return {
        error: null,
        isAdmin: true,
        adminSession: this.createBuiltinAdminSession()
      };
    }

    return { error: 'Invalid credentials', isAdmin: false };
  }


}

export const authService = new AuthService();