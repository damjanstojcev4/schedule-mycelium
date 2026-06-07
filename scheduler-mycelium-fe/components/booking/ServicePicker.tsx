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
    nextStep();
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">Choose a service</h2>

      {activeServices.length === 0 && (
        <p className="text-sm text-gray-500">No services available at the moment.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {activeServices.map((service) => {
          const isSelected = selectedService?.publicId === service.publicId;
          return (
            <button
              key={service.publicId}
              id={`service-${service.publicId}`}
              type="button"
              onClick={() => handleSelect(service)}
              className={[
                'w-full rounded-xl border-2 p-4 text-left transition-all',
                isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <span className="shrink-0 font-semibold text-gray-900">
                  {formatPrice(service.price)}
                </span>
              </div>
              {service.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {service.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {service.durationMinutes} min
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
