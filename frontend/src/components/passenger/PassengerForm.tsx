import React, { useState, useMemo } from 'react';
import { Passenger } from '../../types';

export interface PassengerFormProps {
  readonly passenger: Passenger;
  readonly passengerIndex: number;
  readonly onChange: (index: number, updated: Partial<Passenger>) => void;
  readonly forceShowErrors?: boolean;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-+()]{8,20}$/.test(phone);
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

    if (!passenger.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (passenger.firstName.trim().length < 2) {
      errs.firstName = 'At least 2 characters required';
    }

    if (!passenger.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (passenger.lastName.trim().length < 2) {
      errs.lastName = 'At least 2 characters required';
    }

    if (!passenger.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(passenger.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        errs.dateOfBirth = 'Date of birth must be in the past';
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        if (age > 120) errs.dateOfBirth = 'Invalid date of birth';
      }
    }

    if (!passenger.nationality.trim()) {
      errs.nationality = 'Nationality is required';
    }

    if (!passenger.passportNumber.trim()) {
      errs.passportNumber = 'Passport number is required';
    } else if (passenger.passportNumber.trim().length < 5) {
      errs.passportNumber = 'At least 5 characters required';
    }

    if (passenger.passportExpiry) {
      const expiry = new Date(passenger.passportExpiry);
      const minExpiry = new Date();
      minExpiry.setMonth(minExpiry.getMonth() + 6);
      if (expiry <= minExpiry) {
        errs.passportExpiry = 'Passport must be valid for at least 6 months';
      }
    }

    if (!passenger.email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(passenger.email)) {
      errs.email = 'Invalid email format';
    }

    if (!passenger.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validatePhone(passenger.phone)) {
      errs.phone = 'Invalid phone format';
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Title */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Title *
          </label>
          <select
            value={passenger.title}
            onChange={e => onChange(passengerIndex, { title: e.target.value as Passenger['title'] })}
            className={getInputClass(false)}
          >
            <option value="Mr">Mr.</option>
            <option value="Mrs">Mrs.</option>
            <option value="Ms">Ms.</option>
            <option value="Dr">Dr.</option>
            <option value="Prof">Prof.</option>
          </select>
        </div>

        {/* First & Middle Name */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            First & Middle Name *
          </label>
          <input
            type="text"
            placeholder="e.g. VAN A"
            value={passenger.firstName}
            onChange={e => onChange(passengerIndex, { firstName: e.target.value })}
            onBlur={() => handleBlur('firstName')}
            className={getInputClass(!!shouldShowError('firstName', errors.firstName))}
          />
          {shouldShowError('firstName', errors.firstName) && (
            <p className="text-error text-label-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Last Name (Surname) *
          </label>
          <input
            type="text"
            placeholder="e.g. NGUYEN"
            value={passenger.lastName}
            onChange={e => onChange(passengerIndex, { lastName: e.target.value })}
            onBlur={() => handleBlur('lastName')}
            className={getInputClass(!!shouldShowError('lastName', errors.lastName))}
          />
          {shouldShowError('lastName', errors.lastName) && (
            <p className="text-error text-label-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            value={passenger.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => onChange(passengerIndex, { dateOfBirth: e.target.value })}
            onBlur={() => handleBlur('dateOfBirth')}
            className={getInputClass(!!shouldShowError('dateOfBirth', errors.dateOfBirth))}
          />
          {shouldShowError('dateOfBirth', errors.dateOfBirth) && (
            <p className="text-error text-label-sm mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Nationality *
          </label>
          <input
            type="text"
            placeholder="e.g. Vietnamese"
            value={passenger.nationality}
            onChange={e => onChange(passengerIndex, { nationality: e.target.value })}
            onBlur={() => handleBlur('nationality')}
            className={getInputClass(!!shouldShowError('nationality', errors.nationality))}
          />
          {shouldShowError('nationality', errors.nationality) && (
            <p className="text-error text-label-sm mt-1">{errors.nationality}</p>
          )}
        </div>

        {/* Passport Number */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Passport / National ID Number *
          </label>
          <input
            type="text"
            placeholder="e.g. C8941203"
            value={passenger.passportNumber}
            onChange={e => onChange(passengerIndex, { passportNumber: e.target.value.toUpperCase() })}
            onBlur={() => handleBlur('passportNumber')}
            className={`${getInputClass(!!shouldShowError('passportNumber', errors.passportNumber))} uppercase`}
          />
          {shouldShowError('passportNumber', errors.passportNumber) && (
            <p className="text-error text-label-sm mt-1">{errors.passportNumber}</p>
          )}
        </div>

        {/* Passport Expiry */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Passport Expiry Date
          </label>
          <input
            type="date"
            value={passenger.passportExpiry || ''}
            min={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onChange={e => onChange(passengerIndex, { passportExpiry: e.target.value })}
            onBlur={() => handleBlur('passportExpiry')}
            className={getInputClass(!!shouldShowError('passportExpiry', errors.passportExpiry))}
          />
          {shouldShowError('passportExpiry', errors.passportExpiry) && (
            <p className="text-error text-label-sm mt-1">{errors.passportExpiry}</p>
          )}
          <p className="text-on-surface-variant text-label-sm mt-1">Must be valid for at least 6 months</p>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Email for E-Ticket Delivery *
          </label>
          <input
            type="email"
            placeholder="traveler@email.com"
            value={passenger.email}
            onChange={e => onChange(passengerIndex, { email: e.target.value })}
            onBlur={() => handleBlur('email')}
            className={getInputClass(!!shouldShowError('email', errors.email))}
          />
          {shouldShowError('email', errors.email) && (
            <p className="text-error text-label-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            Mobile Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+84 908 123 456"
            value={passenger.phone}
            onChange={e => onChange(passengerIndex, { phone: e.target.value })}
            onBlur={() => handleBlur('phone')}
            className={getInputClass(!!shouldShowError('phone', errors.phone))}
          />
          {shouldShowError('phone', errors.phone) && (
            <p className="text-error text-label-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Frequent Flyer Number */}
        <div>
          <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
            SkyWing Club Frequent Flyer
          </label>
          <input
            type="text"
            placeholder="e.g. SW-88910"
            value={passenger.frequentFlyerNumber || ''}
            onChange={e => onChange(passengerIndex, { frequentFlyerNumber: e.target.value.toUpperCase() })}
            className={`${getInputClass(false)} uppercase`}
          />
        </div>
      </div>
    </div>
  );
};
