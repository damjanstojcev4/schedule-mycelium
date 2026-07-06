'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Manage your admin account settings." />

      <ChangePasswordForm />
    </div>
  );
}
