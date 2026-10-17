import React, { useState, useMemo } from 'react';
import type { BookingPassengerDraft } from '../../types/bookingFlow';

export interface PassengerFormProps {
  readonly passenger: BookingPassengerDraft;
  readonly passengerIndex: number;
  readonly onChange: (index: number, updated: Partial<BookingPassengerDraft>) => void;
  readonly forceShowErrors?: boolean;
}

export interface ValidationErrors {
  fullName?: string;
  dateOfBirth?: string;
  passportNo?: string;
  phone?: string;
}

const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-+()]{7,20}$/.test(phone);
};

const getInputClass = (hasError: boolean) => `
  w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20
  ${hasError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'}
`;

export const PassengerForm: React.FC<PassengerFormProps> = ({
  passenger,
  passengerIndex,
  onChange,
  forceShowErrors = false
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const shouldShowError = (field: string, error?: string) => (touched[field] || forceShowErrors) && error;

  const errors = useMemo<ValidationErrors>(() => {
    const errs: ValidationErrors = {};

    if (!passenger?.fullName?.trim()) {
      errs.fullName = 'Full name is required';
    } else if (passenger.fullName.trim().length < 2) {
      errs.fullName = 'At least 2 characters required';
    }

    if (!passenger?.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(passenger.dateOfBirth);
      const today = new Date();
      if (isNaN(dob.getTime()) || dob >= today) {
        errs.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!passenger?.passportNo?.trim()) {
      errs.passportNo = 'Passport / National ID is required';
    } else if (passenger.passportNo.trim().length < 5) {
      errs.passportNo = 'At least 5 characters required';
    }

    if (!passenger?.phone?.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validatePhone(passenger.phone)) {
      errs.phone = 'Invalid phone number format';
    }

    return errs;
  }, [passenger]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className={`bg-surface-container-lowest border rounded-2xl p-6 shadow-sm ${
      isValid ? 'border-outline-variant' : 'border-error/50'
    }`}>
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            isValid ? 'bg-primary text-on-primary' : 'bg-error text-on-error'
          }`}>
            {passengerIndex + 1}
          </div>
          <h3 className="font-headline-sm font-bold text-primary">
            Passenger {passengerIndex + 1} (Adult)
          </h3>
        </div>
        <span className={`text-label-sm font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
          isValid
            ? 'text-secondary bg-surface-container'
            : 'text-error bg-error-container'
        }`}>
          {isValid ? 'Ready' : 'Incomplete'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Full Name (as in Passport / ID) *
          </label>
          <input
            type="text"
            placeholder="e.g. NGUYEN VAN A"
            value={passenger?.fullName || ''}
            onChange={e => onChange(passengerIndex, { fullName: e.target.value.toUpperCase() })}
            onBlur={() => handleBlur('fullName')}
            className={getInputClass(!!shouldShowError('fullName', errors.fullName))}
          />
          {shouldShowError('fullName', errors.fullName) && (
            <p className="text-error text-label-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            value={passenger?.dateOfBirth || ''}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => onChange(passengerIndex, { dateOfBirth: e.target.value })}
            onBlur={() => handleBlur('dateOfBirth')}
            className={getInputClass(!!shouldShowError('dateOfBirth', errors.dateOfBirth))}
          />
          {shouldShowError('dateOfBirth', errors.dateOfBirth) && (
            <p className="text-error text-label-sm mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Passport Number */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Passport / National ID Number *
          </label>
          <input
            type="text"
            placeholder="e.g. C1234567"
            value={passenger?.passportNo || ''}
            onChange={e => onChange(passengerIndex, { passportNo: e.target.value.toUpperCase() })}
            onBlur={() => handleBlur('passportNo')}
            className={`${getInputClass(!!shouldShowError('passportNo', errors.passportNo))} uppercase`}
          />
          {shouldShowError('passportNo', errors.passportNo) && (
            <p className="text-error text-label-sm mt-1">{errors.passportNo}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="e.g. 0901234567"
            value={passenger?.phone || ''}
            onChange={e => onChange(passengerIndex, { phone: e.target.value })}
            onBlur={() => handleBlur('phone')}
            className={getInputClass(!!shouldShowError('phone', errors.phone))}
          />
          {shouldShowError('phone', errors.phone) && (
            <p className="text-error text-label-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};
