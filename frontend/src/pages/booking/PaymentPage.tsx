import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { useBooking } from '@/context/BookingContext';

export function PaymentPage() {
  const navigate = useNavigate();
  const { grandTotal } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate brief payment processing
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    navigate('/confirmation');
  };

  return (
    <BookingLayout currentStep={3}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Payment Details
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Complete your booking with secure payment
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center gap-3">
              <Icon name="lock" size={20} className="text-secondary" />
              <span className="font-body-sm text-on-surface-variant">
                256-bit SSL Encrypted Payment
              </span>
            </div>

            <Input
              label="Card Number"
              value={formData.cardNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
              placeholder="1234 5678 9012 3456"
              required
            />

            <Input
              label="Card Holder Name"
              value={formData.cardHolder}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardHolder: e.target.value }))}
              placeholder="NGUYEN VAN A"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={formData.expiry}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiry: e.target.value }))}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                type="password"
                value={formData.cvv}
                onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                placeholder="123"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isProcessing}
            >
              Pay {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(grandTotal)}
            </Button>
          </form>
        </Card>
      </div>
    </BookingLayout>
  );
}
