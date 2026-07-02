import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { StaffMember, Service } from '@/types/api';

interface SlotActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  timeString: string | null;
  dateString: string | null;
  services: Service[];
  businessSlug: string;
  businessPublicId: string;
  onSuccess: () => void;
}

export function SlotActionModal({
  isOpen,
  onClose,
  staff,
  timeString,
  dateString,
  services,
  businessSlug,
  businessPublicId,
  onSuccess,
}: SlotActionModalProps) {
  const [tab, setTab] = useState<'appointment' | 'break'>('appointment');
  
  // Appointment Form
  const [serviceId, setServiceId] = useState(() => services.length > 0 ? services[0].publicId : '');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Break Form
  const [endTime, setEndTime] = useState(() => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':').map(Number);
    const endM = m + 30;
    const finalH = endM >= 60 ? h + 1 : h;
    const finalM = endM % 60;
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  });
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !timeString || !dateString) return;
    
    setLoading(true);
    setError('');

    try {
      if (tab === 'appointment') {
        await api.ownerBookAppointment(businessSlug, {
          servicePublicId: serviceId,
          staffPublicId: staff.publicId,
          startTime: `${dateString}T${timeString}:00`,
          customerName,
          customerEmail,
          customerPhone,
        });
      } else {
        await api.createTimeBlock(businessPublicId, staff.publicId, {
          blockDate: dateString,
          startTime: `${timeString}:00`,
          endTime: `${endTime}:00`,
          reason,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!staff || !timeString) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule at ${timeString}`}>
      <div className="mb-6 flex space-x-2 border-b border-zinc-200 pb-px">
        <button
          onClick={() => setTab('appointment')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${
            tab === 'appointment' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Book Appointment
        </button>
        <button
          onClick={() => setTab('break')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${
            tab === 'break' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Add Break
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'appointment' ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-700">Service</label>
              <select
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="block w-full rounded-lg border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:ring-zinc-500 border"
              >
                <option value="">Select a service</option>
                {services.map(s => (
                  <option key={s.publicId} value={s.publicId}>{s.name} ({s.durationMinutes}m)</option>
                ))}
              </select>
            </div>
            <Input
              label="Customer Name"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email (optional)"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <Input
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || (tab === 'appointment' && !serviceId)}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
