'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/types/api';

interface ServiceFormState {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
}

const emptyForm: ServiceFormState = { name: '', description: '', durationMinutes: '30', price: '0' };

export default function DashboardServicesPage() {
  const params = useParams<{ slug: string }>();
  const { auth } = useAuth();
  const identifier = auth?.businessPublicId || params.slug;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api
      .getServices(identifier)
      .then(setServices)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [identifier]);

  function openAdd() {
    setEditingService(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: String(service.durationMinutes),
      price: String(service.price),
    });
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingService(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof ServiceFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const dur = parseInt(form.durationMinutes, 10);
    const price = parseInt(form.price, 10);
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (isNaN(dur) || dur < 1) { setFormError('Duration must be a positive number.'); return; }
    if (isNaN(price) || price < 0) { setFormError('Price must be 0 or more.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        durationMinutes: dur,
        price,
      };
      if (editingService) {
        const updated = await api.updateService(identifier, editingService.publicId, body);
        setServices((prev) => prev.map((s) => (s.publicId === editingService.publicId ? updated : s)));
      } else {
        const created = await api.createService(identifier, body);
        setServices((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(service: Service) {
    if (!confirm(`Deactivate "${service.name}"? It will no longer appear in booking.`)) return;
    try {
      await api.deactivateService(identifier, service.publicId);
      setServices((prev) =>
        prev.map((s) => (s.publicId === service.publicId ? { ...s, isActive: false } : s)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to deactivate.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services you offer."
        action={
          <Button id="add-service-btn" onClick={openAdd}>
            + Add Service
          </Button>
        }
      />

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-gray-900" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {!loading && services.length === 0 && (
        <EmptyState
          title="No services yet"
          description="Add your first service so customers can start booking."
          action={<Button onClick={openAdd}>Add your first service</Button>}
        />
      )}

      {!loading && services.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {services.map((service) => (
            <div
              key={service.publicId}
              className={`flex items-center gap-4 px-6 py-4 transition-opacity ${
                service.isActive ? '' : 'opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  {service.isActive ? (
                    <Badge status="BOOKED" />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      Inactive
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{service.description}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {service.durationMinutes} min · {formatPrice(service.price)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  id={`edit-service-${service.publicId}`}
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(service)}
                >
                  Edit
                </Button>
                {service.isActive && (
                  <Button
                    id={`deactivate-service-${service.publicId}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivate(service)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <Input
            id="service-name"
            label="Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Haircut"
          />
          <Textarea
            id="service-description"
            label="Description (optional)"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
            placeholder="Brief description…"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="service-duration"
              label="Duration (min)"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={(e) => updateField('durationMinutes', e.target.value)}
            />
            <Input
              id="service-price"
              label="Price (cents)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="2500 = $25.00"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button id="save-service-btn" loading={saving} onClick={handleSave} className="flex-1">
              {editingService ? 'Save changes' : 'Add service'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
