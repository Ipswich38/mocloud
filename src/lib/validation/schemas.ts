import { z } from "zod";

// Base validation helpers
const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Card generation schema
export const cardGenerationSchema = z.object({
  patient_name: z.string()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s.,-]+$/, "Name can only contain letters, spaces, periods, commas, and hyphens"),

  patient_birthdate: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, "Please enter a valid birthdate"),

  patient_address: z.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),

  patient_phone: z.string()
    .regex(phoneRegex, "Please enter a valid Philippine mobile number"),

  clinic_id: z.string()
    .min(1, "Please select a clinic"),

  perks: z.array(z.object({
    name: z.string().min(1, "Perk name is required"),
    description: z.string().min(1, "Perk description is required"),
    category: z.string().min(1, "Perk category is required")
  })).min(1, "At least one perk is required")
});

// Clinic registration schema
export const clinicRegistrationSchema = z.object({
  name: z.string()
    .min(3, "Clinic name must be at least 3 characters")
    .max(100, "Clinic name must not exceed 100 characters"),

  address: z.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),

  contact_email: z.string()
    .regex(emailRegex, "Please enter a valid email address"),

  contact_phone: z.string()
    .regex(phoneRegex, "Please enter a valid Philippine phone number"),

  contact_person: z.string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must not exceed 100 characters"),

  region_id: z.string()
    .min(1, "Please select a region")
});

// Appointment request schema
export const appointmentRequestSchema = z.object({
  card_code: z.string()
    .length(12, "Card code must be exactly 12 characters")
    .regex(/^MC[A-Z0-9]{10}$/, "Invalid card code format"),

  requested_date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Appointment date must be today or in the future"),

  requested_time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),

  purpose: z.string()
    .min(5, "Purpose must be at least 5 characters")
    .max(200, "Purpose must not exceed 200 characters"),

  notes: z.string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
});

// Card lookup schema
export const cardLookupSchema = z.object({
  card_code: z.string()
    .length(12, "Card code must be exactly 12 characters")
    .regex(/^MC[A-Z0-9]{10}$/, "Invalid card code format")
});

// User authentication schema
export const signInSchema = z.object({
  email: z.string()
    .regex(emailRegex, "Please enter a valid email address"),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
});

export const signUpSchema = z.object({
  email: z.string()
    .regex(emailRegex, "Please enter a valid email address"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Perk redemption schema
export const perkRedemptionSchema = z.object({
  perk_id: z.string()
    .min(1, "Perk ID is required"),

  redemption_notes: z.string()
    .max(300, "Notes must not exceed 300 characters")
    .optional()
});

// Admin settings schema
export const adminSettingsSchema = z.object({
  batch_size: z.number()
    .min(1, "Batch size must be at least 1")
    .max(100, "Batch size must not exceed 100"),

  default_perks: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1)
  })).max(10, "Cannot have more than 10 default perks")
});

// Form field types
export type CardGenerationForm = z.infer<typeof cardGenerationSchema>;
export type ClinicRegistrationForm = z.infer<typeof clinicRegistrationSchema>;
export type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;
export type CardLookupForm = z.infer<typeof cardLookupSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type PerkRedemptionForm = z.infer<typeof perkRedemptionSchema>;
export type AdminSettingsForm = z.infer<typeof adminSettingsSchema>;