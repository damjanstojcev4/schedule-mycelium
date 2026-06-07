import { useBooking } from '@/contexts/BookingContext';
import { formatPrice } from '@/lib/format';

export function BookingSummary() {
  const { selectedService, selectedStaff, selectedSlot } = useBooking();

  if (!selectedService) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Summary
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Service</span>
          <span className="font-medium text-gray-900 text-right">{selectedService.name}</span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium text-gray-900">{selectedService.durationMinutes} min</span>
        </div>

        {selectedStaff && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Staff</span>
            <span className="font-medium text-gray-900 text-right">{selectedStaff.name}</span>
          </div>
        )}

        {selectedSlot && (
          <>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{selectedSlot.time}</span>
            </div>
          </>
        )}

        <div className="border-t border-gray-200 pt-2 flex justify-between gap-2">
          <span className="font-semibold text-gray-700">Total</span>
          <span className="font-bold text-gray-900">{formatPrice(selectedService.price)}</span>
        </div>
      </div>
    </div>
  );
}
