import { Metadata, ResolvingMetadata } from 'next';
import { api } from '@/lib/api';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const business = await api.getBookingPage(params.slug);
    
    return {
      title: `${business.name} | Book Appointment`,
      description: `Book your next appointment with ${business.name}. Select a service, choose a time, and confirm your booking instantly.`,
      openGraph: {
        title: `${business.name} | Book Appointment`,
        description: `Book your next appointment with ${business.name}. Select a service, choose a time, and confirm your booking instantly.`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${business.name} | Book Appointment`,
        description: `Book your next appointment with ${business.name}. Select a service, choose a time, and confirm your booking instantly.`,
      }
    };
  } catch (e) {
    return {
      title: 'Booking | Scheduler Mycelium'
    };
  }
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
