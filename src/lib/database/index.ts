// Export all service classes
export { BaseService } from './BaseService';
export { CardService } from './CardService';
export { ClinicService } from './ClinicService';
export { AppointmentService } from './AppointmentService';

// Import classes for singleton creation
import { CardService } from './CardService';
import { ClinicService } from './ClinicService';
import { AppointmentService } from './AppointmentService';

// Create singleton instances for easier usage
export const cardService = new CardService();
export const clinicService = new ClinicService();
export const appointmentService = new AppointmentService();