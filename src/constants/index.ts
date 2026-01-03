// Philippine regions with MIMAROPA included
export const REGIONS = [
  { code: 'CVT', name: 'Cavite', id: '1' },
  { code: 'BTG', name: 'Batangas', id: '2' },
  { code: 'LGN', name: 'Laguna', id: '3' },
  { code: 'MIM', name: 'MIMAROPA Region (Region IV-B)', id: '4' }
] as const;

// Extended clinic codes (001-016 for each region)
export const CLINIC_CODE_SUFFIXES = Array.from({ length: 16 }, (_, i) =>
  String(i + 1).padStart(3, '0')
);

export const PERK_CATEGORIES = [
  'Dental Cleaning',
  'Consultation',
  'X-Ray',
  'Tooth Extraction',
  'Filling',
  'Oral Surgery',
  'Orthodontics',
  'Cosmetic Dentistry',
  'Emergency Care',
  'Preventive Care'
] as const;

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'completed'
] as const;

export const USER_ROLES = [
  'admin',
  'clinic',
  'public'
] as const;

export const DEFAULT_PERKS = [
  {
    name: 'Free Dental Consultation',
    description: 'One-time free dental consultation and checkup',
    category: 'Consultation'
  },
  {
    name: 'Discounted Cleaning',
    description: '50% off professional dental cleaning service',
    category: 'Dental Cleaning'
  },
  {
    name: 'Free X-Ray',
    description: 'Complimentary dental X-ray examination',
    category: 'X-Ray'
  }
] as const;

// Time slots for appointments
export const APPOINTMENT_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
] as const;

// Card generation settings
export const CARD_CODE_LENGTH = 12;
export const CARD_CODE_PREFIX = 'MC';

// Database table names
export const TABLES = {
  REGIONS: 'regions',
  CLINIC_CODES: 'clinic_codes',
  CLINICS: 'clinics',
  CARDS: 'cards',
  CARD_PERKS: 'card_perks',
  APPOINTMENTS: 'appointments',
  PERK_REDEMPTIONS: 'perk_redemptions',
  USER_PROFILES: 'user_profiles'
} as const;