import { Badge } from '@/components/ui/Badge';
import type { Appointment } from '@/types/api';

export function AppointmentStatusBadge({ appointment }: { appointment: Appointment }) {
  return <Badge status={appointment.status} />;
}
