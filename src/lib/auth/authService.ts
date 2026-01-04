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

  // Create clinic session data (demo - in production would verify with database)
  createClinicSession(username: string) {
    return {
      user: {
        id: `clinic-${username}`,
        email: `${username}@clinic.local`
      },
      profile: {
        id: `clinic-${username}`,
        username: username,
        display_name: `${username.charAt(0).toUpperCase() + username.slice(1)} Clinic`,
        email: `${username}@clinic.local`,
        role: 'clinic' as const,
        clinic_id: `clinic-id-${username}`,
        clinic_name: `${username.charAt(0).toUpperCase() + username.slice(1)} Dental Clinic`,
        must_change_password: username === 'clinic1', // Demo: first login requires password change
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Check if it's a demo clinic login (demo only - in production would check database)
  private isDemoClinic(username: string, password: string): boolean {
    // Demo clinic accounts for testing
    const demoAccounts = [
      { username: 'clinic1', password: 'clinic123' },
      { username: 'smilecare', password: 'smile123' },
      { username: 'brightdental', password: 'bright123' }
    ];

    return demoAccounts.some(account =>
      account.username === username && account.password === password
    );
  }

  // Sign in with username - supports both admin and clinic
  async signIn(usernameOrEmail: string, password: string) {
    // Built-in admin check - completely client-side
    if (this.isBuiltinAdmin(usernameOrEmail, password)) {
      return {
        error: null,
        isAdmin: true,
        adminSession: this.createBuiltinAdminSession()
      };
    }

    // Demo clinic check (in production, this would query the database)
    if (this.isDemoClinic(usernameOrEmail, password)) {
      return {
        error: null,
        isAdmin: false,
        isClinic: true,
        clinicSession: this.createClinicSession(usernameOrEmail)
      };
    }

    return { error: 'Invalid credentials', isAdmin: false, isClinic: false };
  }


}

export const authService = new AuthService();