import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { services as initialServices } from '@/mocks/services';
import type { ServiceData } from '@/components/features/ServiceCard/ServiceCard';

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    icon: ServiceData['icon'];
    category: ServiceData['category'];
  }>({
    name: '',
    description: '',
    price: 0,
    icon: 'miscellaneous_services',
    category: 'baggage',
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      icon: 'miscellaneous_services',
      category: 'baggage',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceData) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      icon: service.icon,
      category: service.category,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      );
    } else {
      setServices((prev) => [
        ...prev,
        { id: `svc-${Date.now()}`, ...formData },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Services</h1>
          <Button variant="primary" leftIcon="add" onClick={handleOpenCreate}>
            Add Service
          </Button>
        </div>

        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Name</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Category</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Price</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-right font-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-label-lg text-on-surface">{service.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{service.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-body-md text-primary font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        aria-label={`Edit ${service.name}`}
                        onClick={() => handleOpenEdit(service)}
                        className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Icon name="edit" size={18} className="text-secondary" />
                      </button>
                      <button
                        aria-label={`Delete ${service.name}`}
                        onClick={() => handleDelete(service.id)}
                        className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Icon name="delete" size={18} className="text-error" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add Service'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Extra Baggage (20kg)"
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Service description"
            />
            <Input
              label="Price (VND)"
              type="number"
              value={String(formData.price)}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
