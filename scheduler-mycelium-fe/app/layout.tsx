import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Scheduler Mycelium — Book Appointments Online',
    template: '%s | Scheduler Mycelium',
  },
  description:
    'Multi-tenant appointment scheduling for local businesses. Book services, manage your schedule, and grow your business with a premium booking experience.',
  keywords: ['appointment scheduling', 'booking software', 'local business software', 'calendar scheduling', 'service booking'],
  openGraph: {
    title: 'Scheduler Mycelium — Premium Booking Software',
    description: 'The easiest way to schedule appointments for your business. Share your link and start accepting bookings today.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Scheduler Mycelium',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scheduler Mycelium — Premium Booking Software',
    description: 'The easiest way to schedule appointments for your business. Share your link and start accepting bookings today.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <body className="h-full font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
