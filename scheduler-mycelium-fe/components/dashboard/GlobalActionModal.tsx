import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { NewAppointmentForm } from './NewAppointmentForm';
import { StaffMember } from '@/types/api';
import { api } from '@/lib/api';
import { localDateISO } from '@/lib/format';

interface GlobalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  businessPublicId: string;
  staffList: StaffMember[];
  onSuccess: () => void;
}

const DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: 'Half Day', minutes: 240 },
  { label: 'Full Day', minutes: 780 },
];

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const fh = Math.min(Math.floor(total / 60), 20);
  const fm = total % 60;
  return `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`;
}

export function GlobalActionModal({
  isOpen,
  onClose,
  slug,
  businessPublicId,
  staffList,
  onSuccess,
}: GlobalActionModalProps) {
  const [tab, setTab] = useState<'appointment' | 'block'>('appointment');

  // Block Time State
  const [selectedStaffId, setSelectedStaffId] = useState(() => staffList.length > 0 ? staffList[0].publicId : '');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [blockMode, setBlockMode] = useState<'TIME' | 'OFF_DAYS'>('TIME');
  const [selectedDate, setSelectedDate] = useState(localDateISO(new Date()));
  const [offStartDate, setOffStartDate] = useState(localDateISO(new Date()));
  const [offEndDate, setOffEndDate] = useState(localDateISO(new Date()));
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
  const [blockError, setBlockError] = useState('');

  const timeOptions = useMemo(() =>
    Array.from({ length: 13 }, (_, h) => h + 8).flatMap(h =>
      [0, 15, 30, 45].map(m =>
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      )
    ), []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError('');

    if (!selectedStaffId) {
      setBlockError('Please select a staff member');
      return;
    }

    if (blockMode === 'TIME') {
      if (fromTime >= toTime) { setBlockError('Start time must be before end time'); return; }
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(selectedDate) < today) { setBlockError('Cannot block time in the past'); return; }
    } else {
      if (offStartDate > offEndDate) { setBlockError('Start date must be before or equal to end date'); return; }
    }

    setIsSubmittingBlock(true);
    try {
      if (blockMode === 'TIME') {
        await api.createTimeBlock(businessPublicId, selectedStaffId, {
          blockDate: selectedDate, startTime: fromTime + ':00', endTime: toTime + ':00', reason
        });
      } else {
        const start = new Date(offStartDate), end = new Date(offEndDate);
        const promises = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          promises.push(api.createTimeBlock(businessPublicId, selectedStaffId, {
            blockDate: localDateISO(d), startTime: '00:00:00', endTime: '23:59:59',
            reason: reason || 'Off day'
          }));
        }
        await Promise.all(promises);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setBlockError(err.message || 'Failed to create block');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Schedule">
      <div className="mb-4 flex space-x-2 border-b border-zinc-200 pb-px">
        <button
          onClick={() => setTab('appointment')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${tab === 'appointment' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
            }`}
        >
          New Appointment
        </button>
        <button
          onClick={() => setTab('block')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${tab === 'block' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
            }`}
        >
          Block Time
        </button>
      </div>

      {tab === 'appointment' ? (
        <NewAppointmentForm
          slug={slug}
          onSuccess={() => { onSuccess(); onClose(); }}
          onCancel={onClose}
        />
      ) : (
        <form onSubmit={handleCreateBlock} className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer w-max">
            <input
              type="checkbox"
              checked={blockMode === 'OFF_DAYS'}
              onChange={(e) => setBlockMode(e.target.checked ? 'OFF_DAYS' : 'TIME')}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
            />
            <span className="text-sm font-semibold text-zinc-700 select-none">Vacation</span>
          </label>

          {blockError && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
              {blockError}
            </div>
          )}

          {staffList.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Staff Member</label>
              <select
                required value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="block w-full appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat rounded-xl border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {staffList.map(s => <option key={s.publicId} value={s.publicId}>{s.name}</option>)}
              </select>
            </div>
          )}

          {blockMode === 'TIME' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Date</label>
                <input
                  type="date" required value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Quick Select</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.minutes >= 720) { setFromTime('08:00'); setToTime('20:00'); }
                        else if (preset.minutes >= 240) { setFromTime('08:00'); setToTime('12:00'); }
                        else setToTime(addMinutes(fromTime, preset.minutes));
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 transition-colors active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'From', value: fromTime, set: setFromTime }, { label: 'To', value: toTime, set: setToTime }].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
                    <select
                      required value={value}
                      onChange={e => set(e.target.value)}
                      className="block w-full appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat rounded-xl border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none"
                    >
                      {timeOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Start Date', value: offStartDate, set: setOffStartDate },
                { label: 'End Date', value: offEndDate, set: setOffEndDate },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
                  <input
                    type="date" required value={value}
                    onChange={e => set(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Meeting, Personal, Training"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="pt-4 flex justify-center sm:justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingBlock}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 shadow-sm"
            >
              {isSubmittingBlock ? 'Saving...' : 'Save Block'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
