import type { Service } from '@/types/api';
import { useBooking } from '@/contexts/BookingContext';
import { formatPrice } from '@/lib/format';

interface ServicePickerProps {
  services: Service[];
}

export function ServicePicker({ services }: ServicePickerProps) {
  const { selectedService, setSelectedService, nextStep } = useBooking();

  function handleSelect(service: Service) {
    setSelectedService(service);
    // Small delay so user can see selection before advancing
    setTimeout(() => nextStep(), 150);
  }

  const activeServices = services.filter((s) => s.isActive);

  if (activeServices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
        <p className="text-sm text-zinc-500">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger-children">
      {activeServices.map((service) => {
        const isSelected = selectedService?.publicId === service.publicId;
        return (
          <button
            key={service.publicId}
            id={`service-${service.publicId}`}
            type="button"
            onClick={() => handleSelect(service)}
            className={[
              'w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] flex items-center gap-4',
              isSelected
                ? 'border-zinc-900 bg-zinc-950 text-white shadow-lg'
                : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
            ].join(' ')}
          >
            {/* Duration badge */}
            <div className={[
              'shrink-0 h-12 w-12 rounded-xl flex flex-col items-center justify-center text-center',
              isSelected ? 'bg-white/10' : 'bg-zinc-100',
            ].join(' ')}>
              <span className={['text-base font-bold leading-none', isSelected ? 'text-white' : 'text-zinc-900'].join(' ')}>
                {service.durationMinutes}
              </span>
              <span className={['text-[10px] font-medium mt-0.5', isSelected ? 'text-white/60' : 'text-zinc-500'].join(' ')}>
                min
              </span>
            </div>

            {/* Service info */}
            <div className="flex-1 min-w-0">
              <p className={['font-semibold text-base leading-tight', isSelected ? 'text-white' : 'text-zinc-900'].join(' ')}>
                {service.name}
              </p>
              {service.description && (
                <p className={['mt-0.5 text-sm line-clamp-1', isSelected ? 'text-white/70' : 'text-zinc-500'].join(' ')}>
                  {service.description}
                </p>
              )}
            </div>

            {/* Price + check */}
            <div className="shrink-0 flex items-center gap-2">
              <span className={['font-bold text-base', isSelected ? 'text-white' : 'text-zinc-900'].join(' ')}>
                {formatPrice(service.price)}
              </span>
              {isSelected && (
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {!isSelected && (
                <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
