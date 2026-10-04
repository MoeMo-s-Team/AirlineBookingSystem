import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBooking } from '@/context/BookingContext';

const titleOptions = [
  { value: 'Mr', label: 'Mr.' },
  { value: 'Ms', label: 'Ms.' },
  { value: 'Mrs', label: 'Mrs.' },
];

export function PassengerInfoPage() {
  const navigate = useNavigate();
  const { dispatch, totalPassengers } = useBooking();
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Vietnam (VNM)',
  });
  const [error, setError] = useState('');

  const handleInputChange = (field: string) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddPassenger = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Please fill in First Name, Last Name, and Email');
      return;
    }
    setError('');

    dispatch({
      type: 'ADD_PASSENGER',
      payload: {
        id: `passenger-${Date.now()}-${currentPassenger}`,
        type: 'adult',
        title: formData.title,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
      },
    });

    if (currentPassenger < totalPassengers - 1) {
      setCurrentPassenger((prev) => prev + 1);
      setFormData({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: 'Vietnam (VNM)',
      });
    } else {
      navigate('/services');
    }
  };

  return (
    <BookingLayout currentStep={1}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Passenger Information
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Enter details for all passengers. Names must match official ID.
          </p>
        </div>

        <Badge variant="secondary">
          Passenger {currentPassenger + 1} of {totalPassengers}
        </Badge>

        <Card variant="elevated" padding="lg">
          {error && (
            <div className="mb-4 bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-sm" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Title"
                options={titleOptions}
                value={formData.title}
                onChange={(v) => setFormData((prev) => ({ ...prev, title: v }))}
              />
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                placeholder="NGUYEN"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                placeholder="VAN A"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="email@example.com"
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="0912345678"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="text"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Nationality"
                value={formData.nationality}
                onChange={handleInputChange('nationality')}
                placeholder="Vietnam"
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleAddPassenger}
            >
              {currentPassenger < totalPassengers - 1
                ? 'Add Passenger & Continue'
                : 'Continue to Services'}
            </Button>
          </div>
        </Card>
      </div>
    </BookingLayout>
  );
}
