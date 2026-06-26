import type { StaffMember } from '@/types/api';
import { useBooking } from '@/contexts/BookingContext';

interface StaffPickerProps {
  staff: StaffMember[];
}

const AVATAR_COLORS = [
  'bg-violet-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-fuchsia-600',
];

export function StaffPicker({ staff }: StaffPickerProps) {
  const { selectedStaff, setSelectedStaff, nextStep } = useBooking();

  function handleSelect(member: StaffMember | null) {
    setSelectedStaff(member);
    setTimeout(() => nextStep(), 150);
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
        <p className="text-sm text-zinc-500">No staff members available.</p>
      </div>
    );
  }

  const noPreferenceSelected = selectedStaff === null;

  return (
    <div className="space-y-3">
      {/* "No preference" option */}
      <button
        type="button"
        onClick={() => handleSelect(null)}
        className={[
          'w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] flex items-center gap-4',
          noPreferenceSelected
            ? 'border-zinc-900 bg-zinc-950 text-white shadow-lg'
            : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
        ].join(' ')}
      >
        <div className={['h-12 w-12 rounded-xl flex items-center justify-center shrink-0', noPreferenceSelected ? 'bg-white/10' : 'bg-zinc-100'].join(' ')}>
          <svg className={['h-6 w-6', noPreferenceSelected ? 'text-white/80' : 'text-zinc-500'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className={['font-semibold text-base', noPreferenceSelected ? 'text-white' : 'text-zinc-900'].join(' ')}>No preference</p>
          <p className={['text-sm mt-0.5', noPreferenceSelected ? 'text-white/60' : 'text-zinc-500'].join(' ')}>First available staff member</p>
        </div>
        {noPreferenceSelected && (
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-100" />
        <span className="text-xs font-medium text-zinc-400">or choose</span>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>

      {/* Staff list */}
      <div className="space-y-2 stagger-children">
        {staff.map((member, idx) => {
          const isSelected = selectedStaff?.publicId === member.publicId;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          return (
            <button
              key={member.publicId}
              id={`staff-${member.publicId}`}
              type="button"
              onClick={() => handleSelect(member)}
              className={[
                'w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] flex items-center gap-4',
                isSelected
                  ? 'border-zinc-900 bg-zinc-950 text-white shadow-lg'
                  : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Avatar */}
              <div className={[
                'h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0',
                isSelected ? 'opacity-90 ' + avatarColor : avatarColor,
              ].join(' ')}>
                {member.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={['font-semibold text-base leading-tight', isSelected ? 'text-white' : 'text-zinc-900'].join(' ')}>
                  {member.name}
                </p>
                {member.roleTitle && (
                  <p className={['text-sm mt-0.5', isSelected ? 'text-white/60' : 'text-zinc-500'].join(' ')}>
                    {member.roleTitle}
                  </p>
                )}
                {member.workStart && member.workEnd && (
                  <p className={['text-xs mt-1 flex items-center gap-1', isSelected ? 'text-white/50' : 'text-zinc-400'].join(' ')}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {member.workStart} – {member.workEnd}
                  </p>
                )}
              </div>

              {isSelected && (
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
