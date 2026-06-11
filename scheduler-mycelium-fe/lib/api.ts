import { clearToken, getToken } from '@/lib/auth';
import type {
  Account,
  AdminCreateBusinessRequest,
  Appointment,
  AuthResponse,
  AvailableSlots,
  BookAppointmentRequest,
  BookingConfirmation,
  Business,
  BusinessBookingPage,
  BusinessSettings,
  CreateBusinessRequest,
  CreateServiceRequest,
  CreateStaffRequest,
  LoginRequest,
  RegisterRequest,
  Service,
  StaffMember,
  UpdateBusinessRequest,
  UpdateServiceRequest,
} from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (auth) {
      // Only clear token and redirect for authenticated requests —
      // public endpoints (auth=false) should never force a login redirect.
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new ApiError('Unauthorized', 401);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const cloned = res.clone();
      const body = await cloned.json() as { message?: string; error?: string };
      message = body.message ?? body.error ?? JSON.stringify(body);
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const api = {
  login: (body: LoginRequest) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }, false),

  register: (body: RegisterRequest) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }, false),

  // ─── Business ───────────────────────────────────────────────────────────────

  createBusiness: (body: CreateBusinessRequest) =>
    request<Business>('/api/businesses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateBusiness: (slug: string, body: UpdateBusinessRequest) =>
    request<Business>(`/api/businesses/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // ─── Public — Discovery ──────────────────────────────────────────────────────

  getBusinesses: () =>
    request<Business[]>('/api/businesses', {}, false),

  // ─── Public Booking ─────────────────────────────────────────────────────────

  getBookingPage: (slug: string) =>
    request<BusinessBookingPage>(`/api/book/${slug}`, {}, false),

  getAvailableSlots: (
    slug: string,
    servicePublicId: string,
    date: string,
    staffPublicId?: string,
  ) => {
    const params: Record<string, string> = { servicePublicId, date };
    if (staffPublicId) params.staffPublicId = staffPublicId;
    const query = new URLSearchParams(params);
    return request<AvailableSlots>(`/api/book/${slug}/slots?${query}`, {}, false);
  },

  bookAppointment: (slug: string, body: BookAppointmentRequest) =>
    request<BookingConfirmation>(`/api/book/${slug}/appointments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, false),

  // ─── Customer ───────────────────────────────────────────────────────────────

  getMyAppointments: () =>
    request<Appointment[]>('/api/appointments/my'),

  cancelMyAppointment: (publicId: string) =>
    request<void>(`/api/appointments/${publicId}/cancel`, { method: 'PATCH' }),

  // ─── Dashboard — Appointments ───────────────────────────────────────────────

  getDashboardAppointments: () =>
    request<Appointment[]>('/api/appointments/my'),

  cancelAppointment: (publicId: string) =>
    request<void>(`/api/appointments/${publicId}/cancel`, {
      method: 'PATCH',
    }),

  completeAppointment: (publicId: string) =>
    request<void>(`/api/appointments/${publicId}/complete`, {
      method: 'PATCH',
    }),

  // ─── Dashboard — Services ───────────────────────────────────────────────────

  getServices: (businessPublicId: string) =>
    request<Service[]>(`/api/businesses/${businessPublicId}/services`),

  createService: (businessPublicId: string, body: CreateServiceRequest) =>
    request<Service>(`/api/businesses/${businessPublicId}/services`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateService: (businessPublicId: string, publicId: string, body: UpdateServiceRequest) =>
    request<Service>(`/api/businesses/${businessPublicId}/services/${publicId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deactivateService: (businessPublicId: string, publicId: string) =>
    request<void>(`/api/businesses/${businessPublicId}/services/${publicId}`, {
      method: 'DELETE',
    }),

  // ─── Dashboard — Staff ──────────────────────────────────────────────────────

  getStaff: (businessPublicId: string) =>
    request<StaffMember[]>(`/api/businesses/${businessPublicId}/staff`),

  createStaff: (businessPublicId: string, body: CreateStaffRequest) =>
    request<StaffMember>(`/api/businesses/${businessPublicId}/staff`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  removeStaff: (businessPublicId: string, publicId: string) =>
    request<void>(`/api/businesses/${businessPublicId}/staff/${publicId}`, {
      method: 'DELETE',
    }),

  // ─── Dashboard — Settings ───────────────────────────────────────────────────

  getSettings: (businessPublicId: string) =>
    request<BusinessSettings>(`/api/businesses/${businessPublicId}/settings`),

  updateSettings: (businessPublicId: string, body: BusinessSettings) =>
    request<BusinessSettings>(`/api/businesses/${businessPublicId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // ─── Staff View ─────────────────────────────────────────────────────────────

  getStaffSchedule: (slug: string, date: string) => {
    const query = new URLSearchParams({ date });
    return request<Appointment[]>(`/api/staff/${slug}/appointments?${query}`);
  },

  // ─── Admin ──────────────────────────────────────────────────────────────────

  adminGetBusinesses: () =>
    request<Business[]>('/api/admin/businesses'),

  adminCreateBusiness: (body: AdminCreateBusinessRequest) =>
    request<Business>('/api/admin/businesses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminDeleteBusiness: (publicId: string) =>
    request<void>(`/api/admin/businesses/${publicId}`, {
      method: 'DELETE',
    }),

  adminGetAccounts: () =>
    request<Account[]>('/api/admin/accounts'),

  adminGetAppointments: () =>
    request<Appointment[]>('/api/admin/appointments'),
};
