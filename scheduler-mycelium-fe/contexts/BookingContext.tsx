'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Service, StaffMember } from '@/types/api';

interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface SelectedSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

interface BookingContextValue {
  step: number;
  selectedService: Service | null;
  selectedStaff: StaffMember | null;
  selectedSlot: SelectedSlot | null;
  guestInfo: GuestInfo;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedService: (service: Service) => void;
  setSelectedStaff: (staff: StaffMember | null) => void;
  setSelectedSlot: (slot: SelectedSlot) => void;
  setGuestInfo: (info: GuestInfo) => void;
  reset: () => void;
}

const defaultGuestInfo: GuestInfo = {
  fullName: '',
  email: '',
  phone: '',
  notes: '',
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(defaultGuestInfo);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const reset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedSlot(null);
    setGuestInfo(defaultGuestInfo);
  };

  const value = useMemo(
    () => ({
      step,
      selectedService,
      selectedStaff,
      selectedSlot,
      guestInfo,
      setStep,
      nextStep,
      prevStep,
      setSelectedService,
      setSelectedStaff,
      setSelectedSlot,
      setGuestInfo,
      reset,
    }),
    [step, selectedService, selectedStaff, selectedSlot, guestInfo],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
