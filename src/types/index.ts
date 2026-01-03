// Core database types
export interface Region {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface ClinicCode {
  id: string;
  region_id: string;
  code: string;
  is_assigned: boolean;
  created_at: string;
}

export interface Clinic {
  id: string;
  clinic_code_id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  card_code: string;
  patient_name: string;
  patient_birthdate: string;
  patient_address: string;
  patient_phone: string;
  clinic_id: string;
  is_active: boolean;
  generated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CardPerk {
  id: string;
  card_id: string;
  perk_name: string;
  perk_description: string;
  perk_category: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  redeemed_by?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  card_id: string;
  clinic_id: string;
  requested_date: string;
  requested_time: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PerkRedemption {
  id: string;
  perk_id: string;
  redeemed_by: string;
  redemption_notes?: string;
  created_at: string;
}

// Auth types
export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  email: string;
  role: 'admin' | 'clinic' | 'public';
  clinic_id?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

// Form types
export interface CardGenerationForm {
  patient_name: string;
  patient_birthdate: string;
  patient_address: string;
  patient_phone: string;
  clinic_id: string;
  perks: {
    name: string;
    description: string;
    category: string;
  }[];
}

export interface ClinicRegistrationForm {
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  region_id: string;
}

export interface AppointmentRequestForm {
  card_code: string;
  requested_date: string;
  requested_time: string;
  purpose: string;
  notes?: string;
}

// Extended types with relations
export interface CardWithRelations extends Card {
  clinic?: Clinic;
  perks?: CardPerk[];
  appointments?: Appointment[];
}

export interface ClinicWithRelations extends Clinic {
  cards?: Card[];
  clinic_code?: ClinicCode;
  region?: Region;
}

export interface AppointmentWithRelations extends Appointment {
  card?: Card;
  clinic?: Clinic;
}