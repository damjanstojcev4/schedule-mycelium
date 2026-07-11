import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancel Appointment | Scheduler Mycelium',
  description:
    'Enter the email address you used when booking to find and cancel your upcoming appointments.',
};

export default function CancelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
