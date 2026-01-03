import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique card code with format: MC + 10 random characters
 */
export function generateCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MC';

  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Format phone number to Philippine format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Handle different Philippine number formats
  if (cleaned.startsWith('63')) {
    // International format
    return `+${cleaned}`;
  } else if (cleaned.startsWith('09')) {
    // Mobile format
    return `+63${cleaned.slice(1)}`;
  } else if (cleaned.length === 10) {
    // Landline format
    return `+63${cleaned}`;
  }

  return phone;
}

/**
 * Format date to Philippine date format
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date and time for appointments
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Philippine phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Check for valid Philippine mobile number patterns
  return (
    cleaned.startsWith('639') && cleaned.length === 12 ||
    cleaned.startsWith('09') && cleaned.length === 11 ||
    cleaned.length === 10 || // Landline
    cleaned.startsWith('63') && cleaned.length >= 11
  );
}

/**
 * Generate clinic code based on region and sequence
 */
export function generateClinicCode(regionCode: string, sequence: number): string {
  return `${regionCode}${String(sequence).padStart(3, '0')}`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Check if user is admin
 */
export function isAdmin(role?: string): boolean {
  return role === 'admin';
}

/**
 * Check if user is clinic staff
 */
export function isClinicStaff(role?: string): boolean {
  return role === 'clinic';
}

/**
 * Generate random ID for demo purposes
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}