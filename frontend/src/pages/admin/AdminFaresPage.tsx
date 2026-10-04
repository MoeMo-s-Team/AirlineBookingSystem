import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { fareClasses, type FareClass } from '@/mocks/fares';

export function AdminFaresPage() {
  const [fares, setFares] = useState<FareClass[]>(fareClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<FareClass | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    amenities: [''],
    priceMultiplier: 1,
  });

  const handleOpenCreate = () => {
    setEditingFare(null);
    setFormData({ code: '', name: '', description: '', amenities: ['Standard services'], priceMultiplier: 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fare: FareClass) => {
    setEditingFare(fare);
    setFormData({
      code: fare.code,
      name: fare.name,
      description: fare.description,
      amenities: fare.amenities,
      priceMultiplier: fare.priceMultiplier,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (editingFare) {
      setFares((prev) =>
        prev.map((f) => (f.id === editingFare.id ? { ...f, ...formData } : f))
      );
    } else {
      setFares((prev) => [
        ...prev,
        { id: `fare-${Date.now()}`, ...formData },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFares((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Fare Classes</h1>
          <Button variant="primary" leftIcon="add" onClick={handleOpenCreate}>
            Add Fare
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fares.map((fare) => (
            <Card key={fare.id} variant="elevated" padding="md">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">{fare.code}</Badge>
                <div className="flex gap-1">
                  <button
                    aria-label={`Edit ${fare.name}`}
                    onClick={() => handleOpenEdit(fare)}
                    className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <Icon name="edit" size={18} className="text-secondary" />
                  </button>
                  <button
                    aria-label={`Delete ${fare.name}`}
                    onClick={() => handleDelete(fare.id)}
                    className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <Icon name="delete" size={18} className="text-error" />
                  </button>
                </div>
              </div>
              <h3 className="font-headline-sm text-primary mb-1">{fare.name}</h3>
              <p className="font-body-sm text-on-surface-variant mb-4">{fare.description}</p>
              <div className="border-t border-outline-variant pt-4">
                <p className="font-label-sm text-on-surface-variant mb-2">Multiplier: {fare.priceMultiplier}x</p>
                <ul className="space-y-1">
                  {fare.amenities.slice(0, 3).map((amenity, i) => (
                    <li key={i} className="flex items-center gap-2 font-body-sm text-on-surface">
                      <Icon name="check" size={14} className="text-success" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFare ? 'Edit Fare Class' : 'Add Fare Class'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., ECO"
                required
              />
              <Input
                label="Price Multiplier"
                type="number"
                value={String(formData.priceMultiplier)}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceMultiplier: Number(e.target.value) || 1 }))}
              />
            </div>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
