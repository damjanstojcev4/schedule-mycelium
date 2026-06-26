import { useBooking } from '@/contexts/BookingContext';
import { formatPrice } from '@/lib/format';

export function BookingSummary() {
  const { selectedService, selectedStaff, selectedSlot } = useBooking();

  if (!selectedService) return null;

  const dateFormatted = selectedSlot
    ? new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
    : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-zinc-100">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Booking Summary</p>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-zinc-500">Service</span>
          <span className="text-sm font-semibold text-zinc-900 text-right">{selectedService.name}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-zinc-500">Duration</span>
          <span className="text-sm font-semibold text-zinc-900">{selectedService.durationMinutes} min</span>
        </div>
        {selectedStaff && (
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-zinc-500">With</span>
            <span className="text-sm font-semibold text-zinc-900">{selectedStaff.name}</span>
          </div>
        )}
        {selectedSlot && (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-zinc-500">Date</span>
              <span className="text-sm font-semibold text-zinc-900">{dateFormatted}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-zinc-500">Time</span>
              <span className="text-sm font-semibold text-zinc-900">{selectedSlot.time}</span>
            </div>
          </>
        )}
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-zinc-200 bg-white flex justify-between items-center">
        <span className="text-sm font-bold text-zinc-600">Total</span>
        <span className="text-lg font-bold text-zinc-900">{formatPrice(selectedService.price)}</span>
      </div>
    </div>
  );
}
