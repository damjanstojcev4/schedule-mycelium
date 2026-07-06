'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function StaffSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 overflow-hidden">
      <header className="bg-zinc-950 text-white px-4 pt-safe-top shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Staff Portal</p>
            <h1 className="text-lg font-bold text-white leading-tight">Settings</h1>
          </div>
          <button
            onClick={() => router.push(`/staff/${slug}`)}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500"
          >
            Back to Schedule
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ChangePasswordForm />
        </div>
      </main>
    </div>
  );
}
