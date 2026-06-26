export type Role = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'STAFF' | 'CUSTOMER';

export interface AuthResponse {
  token: string;
  accountId: number;
  email: string;
  fullName: string | null;
  role: Role;
  slug: string | null;
  businessPublicId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  role: 'CUSTOMER' | 'BUSINESS_OWNER';
}

export interface Account {
  publicId: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Business {
  publicId: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  address: string;
  soloOperator: boolean;
  createdAt: string;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
  category: string;
  phone: string;
  address: string;
  soloOperator: boolean;
}

export interface AdminCreateBusinessRequest {
  ownerEmail: string;
  ownerPassword?: string;
  name: string;
  description?: string;
  category: string;
  phone: string;
  address: string;
  soloOperator: boolean;
}

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  category?: string;
  phone?: string;
  address?: string;
  soloOperator?: boolean;
}

export interface BusinessSettings {
  cancellationCutoffHours: number;
  slotIntervalMinutes: number;
}

export interface Service {
  publicId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
}

export interface StaffMember {
  publicId: string;
  email: string;
  name: string;
  roleTitle: string;
  workStart: string;
  workEnd: string;
  breakStart: string | null;
  breakEnd: string | null;
  tempPassword: string | null;
}

export interface CreateStaffRequest {
  email: string;
  name: string;
  roleTitle: string;
  workStart: string;
  workEnd: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface Appointment {
  publicId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  staffName: string;
  customerName: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  cancelledBy: 'CUSTOMER' | 'STAFF' | 'BUSINESS_OWNER' | null;
  notes: string | null;
  createdAt: string;
}

export interface AvailableSlots {
  date: string;
  staffId: string;
  availableSlots: string[];
}

export interface BusinessBookingPage {
  publicId: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  address: string;
  soloOperator: boolean;
  services: Service[];
  staff: StaffMember[];
}

export interface BookAppointmentRequest {
  servicePublicId: string;
  staffPublicId?: string;
  startTime: string; // ISO LocalDateTime: "2026-06-07T09:00:00"
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
}

export interface BookingConfirmation {
  publicId: string;
  businessName: string;
  businessSlug: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
}
