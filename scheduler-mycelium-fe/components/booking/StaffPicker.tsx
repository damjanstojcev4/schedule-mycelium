import type { StaffMember } from '@/types/api';
import { useBooking } from '@/contexts/BookingContext';

interface StaffPickerProps {
  staff: StaffMember[];
}

export function StaffPicker({ staff }: StaffPickerProps) {
  const { selectedStaff, setSelectedStaff, nextStep } = useBooking();

  function handleSelect(member: StaffMember) {
    setSelectedStaff(member);
    nextStep();
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">Choose a staff member</h2>

      {staff.length === 0 && (
        <p className="text-sm text-gray-500">No staff members available.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((member) => {
          const isSelected = selectedStaff?.publicId === member.publicId;
          return (
            <button
              key={member.publicId}
              id={`staff-${member.publicId}`}
              type="button"
              onClick={() => handleSelect(member)}
              className={[
                'w-full rounded-xl border-2 p-4 text-left transition-all',
                isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
              ].join(' ')}
            >
              {/* Avatar placeholder */}
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-black">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-medium text-gray-900">{member.name}</h3>
              <p className="mt-0.5 text-sm text-gray-500">{member.roleTitle}</p>
              <p className="mt-2 text-xs text-gray-400">
                {member.workStart} – {member.workEnd}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Staff members are assigned based on availability.
      </p>
    </div>
  );
}
