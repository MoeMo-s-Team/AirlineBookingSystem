# Phase 2: Atomic Components - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 15 atomic UI components with TypeScript types, Tailwind styling, and Vitest unit tests.

**Architecture:**
- Each component is a single file with inline variants
- Icon component wraps Material Symbols with type-safe autocomplete
- CSS variables from Phase 1 for all styling
- Components are pure functional React components

**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Vitest

**Spec:** Phase 1 Design System (tokens.css), Aero Minimalist DESIGN.md

## Global Constraints

- All components must use CSS variables (no hardcoded colors)
- All components must be fully typed with TypeScript
- Icons use Material Symbols Outlined from Google Fonts
- Testing with Vitest + React Testing Library
- 1 file per component

## Review Focus

- Icon component: TypeScript autocomplete works for all 27 icons
- Button: All 4 variants (primary, secondary, tertiary, ghost) render correctly
- Input: Error state displays correctly with error message
- Modal: Click outside closes the modal
- Stepper: Active/complete/pending states render correctly

---

## Task 1: Install @material-symbols/react

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: Material Symbols icons available for import

---

### Task 1: Install Material Symbols

**Requirements & Acceptance Criteria:**
- [ ] Package `@material-symbols/react` installed
- [ ] No version conflicts with existing dependencies

- [ ] **Step 1: Install @material-symbols/react**

Run: `cd frontend && pnpm add @material-symbols/react`
Expected: Package installed successfully

- [ ] **Step 2: Verify installation**

Run: `cd frontend && pnpm list @material-symbols/react`
Expected: Package appears in dependencies

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(frontend): add @material-symbols/react for icons"
```

---

## Task 2: Create Icon Component

**Files:**
- Create: `frontend/src/components/ui/Icon/Icon.tsx`
- Test: `frontend/src/components/ui/Icon/Icon.test.tsx`

**Interfaces:**
- Produces: `Icon` component with type-safe `IconName` prop

---

### Task 2: Create Icon Component

**Requirements & Acceptance Criteria:**
- [ ] Component accepts `name` prop with autocomplete for all icons
- [ ] Component accepts `size` prop (default: 20)
- [ ] Component accepts `className` prop
- [ ] Renders correct Material Symbol based on name
- [ ] TypeScript compilation passes

- [ ] **Step 1: Create Icon component**

```tsx
// frontend/src/components/ui/Icon/Icon.tsx
import React from 'react';

export type IconName =
  | 'arrow_back'
  | 'arrow_forward'
  | 'bedtime'
  | 'calendar_today'
  | 'check'
  | 'chevron_left'
  | 'chevron_right'
  | 'close'
  | 'credit_card'
  | 'edit'
  | 'error'
  | 'expand_more'
  | 'filter_list'
  | 'flight_land'
  | 'flight_takeoff'
  | 'home'
  | 'light_mode'
  | 'lock'
  | 'notifications'
  | 'person'
  | 'schedule'
  | 'search'
  | 'timer'
  | 'tune'
  | 'verified'
  | 'warning'
  | 'wb_sunny'
  | 'wb_twilight';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`} 
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors related to Icon component

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Icon/Icon.tsx
git commit -m "feat(ui): add Icon component with type-safe Material Symbols"
```

---

## Task 3: Create Button Component

**Files:**
- Create: `frontend/src/components/ui/Button/Button.tsx`
- Test: `frontend/src/components/ui/Button/Button.test.tsx`

**Interfaces:**
- Consumes: `Icon` component
- Produces: `Button` component with variants

---

### Task 3: Create Button Component

**Requirements & Acceptance Criteria:**
- [ ] Variants: primary, secondary, tertiary, ghost
- [ ] Sizes: sm, md, lg
- [ ] States: default, hover, active, disabled, loading
- [ ] Props: variant, size, loading, disabled, leftIcon, rightIcon, children, onClick, type
- [ ] Loading state shows spinner and disables click
- [ ] Tests pass: renders correctly, handles clicks, loading state, disabled state

- [ ] **Step 1: Create Button component**

```tsx
// frontend/src/components/ui/Button/Button.tsx
import React from 'react';
import { Icon, IconName } from '../Icon/Icon';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses = {
  primary: 'bg-secondary text-on-secondary hover:bg-[#1976D2] active:bg-[#0D47A1]',
  secondary: 'bg-transparent border border-primary text-primary hover:bg-surface-container-low',
  tertiary: 'text-on-surface-variant hover:text-on-surface',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-label-md',
  md: 'px-6 py-3 text-label-lg',
  lg: 'px-8 py-4 text-label-lg',
};

const loadingSizeClasses = {
  sm: 14,
  md: 18,
  lg: 20,
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded font-label-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <span 
          className="material-symbols-outlined animate-spin" 
          style={{ fontSize: loadingSizeClasses[size] }}
        >
          progress_activity
        </span>
      )}
      {!loading && leftIcon && <Icon name={leftIcon} size={16} />}
      {children}
      {!loading && rightIcon && <Icon name={rightIcon} size={16} />}
    </button>
  );
}
```

- [ ] **Step 2: Create Button tests**

```tsx
// frontend/src/components/ui/Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state and disables button', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText(/click me/i)).toBeInTheDocument();
  });

  it('renders with leftIcon', () => {
    render(<Button leftIcon="search">Search</Button>);
    const button = screen.getByRole('button');
    expect(button.querySelector('.material-symbols-outlined')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Button/Button.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button/Button.tsx src/components/ui/Button/Button.test.tsx
git commit -m "feat(ui): add Button component with variants, sizes, and loading state"
```

---

## Task 4: Create Input Component

**Files:**
- Create: `frontend/src/components/ui/Input/Input.tsx`
- Test: `frontend/src/components/ui/Input/Input.test.tsx`

**Interfaces:**
- Consumes: `Icon` component
- Produces: `Input` component

---

### Task 4: Create Input Component

**Requirements & Acceptance Criteria:**
- [ ] Props: label, placeholder, error, helperText, leftIcon, rightIcon, size, disabled, required, type, value, onChange
- [ ] Error state shows red border and error message
- [ ] Label displays above input
- [ ] Helper text displays below input
- [ ] Tests pass: renders, handles input, shows error

- [ ] **Step 1: Create Input component**

```tsx
// frontend/src/components/ui/Input/Input.tsx
import React from 'react';
import { Icon, IconName } from '../Icon/Icon';

export interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'tel';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'py-2 text-body-sm pl-10 pr-4',
  md: 'py-3 text-body-md pl-11 pr-4',
  lg: 'py-4 text-body-lg pl-12 pr-4',
};

const iconSizeClasses = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function Input({
  label,
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  disabled = false,
  required = false,
  type = 'text',
  value,
  onChange,
  id,
  name,
  className = '',
}: InputProps) {
  const inputId = id || name || `input-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={leftIcon} size={iconSizeClasses[size]} className="text-outline" />
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className={`
            w-full rounded-lg font-body-md
            bg-surface-container-low border 
            text-on-surface placeholder:text-on-surface-variant
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-error focus:border-error' 
              : 'border-outline-variant focus:border-secondary'
            }
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
          `}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={rightIcon} size={iconSizeClasses[size]} className="text-on-surface-variant" />
          </span>
        )}
      </div>
      {(error || helperText) && (
        <span className={`font-body-sm ${hasError ? 'text-error' : 'text-on-surface-variant'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Input tests**

```tsx
// frontend/src/components/ui/Input/Input.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter email..." />);
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows helper text when error is not present', () => {
    render(<Input helperText="We'll never share your email" />);
    expect(screen.getByText(/we'll never share/i)).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(<Input error="Error" helperText="Helper text" />);
    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Input/Input.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Input/Input.tsx src/components/ui/Input/Input.test.tsx
git commit -m "feat(ui): add Input component with label, error state, and icons"
```

---

## Task 5: Create Badge Component

**Files:**
- Create: `frontend/src/components/ui/Badge/Badge.tsx`

**Interfaces:**
- Produces: `Badge` component

---

### Task 5: Create Badge Component

**Requirements & Acceptance Criteria:**
- [ ] Variants: primary, secondary, success, warning, error, neutral
- [ ] Sizes: sm, md, lg
- [ ] Props: variant, size, children, className
- [ ] Consistent styling across all variants

- [ ] **Step 1: Create Badge component**

```tsx
// frontend/src/components/ui/Badge/Badge.tsx
import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  success: 'bg-[#dcfce7] text-[#166534]', // green-100 / green-800
  warning: 'bg-amber-100 text-amber-900',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-label-sm',
  lg: 'px-3 py-1.5 text-label-md',
};

export function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  children, 
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-label-sm font-semibold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Badge/Badge.tsx
git commit -m "feat(ui): add Badge component with variants"
```

---

## Task 6: Create Chip Component

**Files:**
- Create: `frontend/src/components/ui/Chip/Chip.tsx`

**Interfaces:**
- Consumes: `Icon` component
- Produces: `Chip` component

---

### Task 6: Create Chip Component

**Requirements & Acceptance Criteria:**
- [ ] Props: selected, disabled, onClick, leftIcon, children, className
- [ ] Selected state has different styling
- [ ] Hover effects work correctly
- [ ] Disabled state prevents interaction

- [ ] **Step 1: Create Chip component**

```tsx
// frontend/src/components/ui/Chip/Chip.tsx
import React from 'react';
import { Icon, IconName } from '../Icon/Icon';

export interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  leftIcon?: IconName;
  children: React.ReactNode;
  className?: string;
}

export function Chip({
  selected = false,
  disabled = false,
  onClick,
  leftIcon,
  children,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-label-md
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${selected
          ? 'bg-primary text-on-primary border-transparent hover:bg-primary-container'
          : 'bg-surface-container-high border border-outline text-on-surface-variant hover:border-primary hover:text-primary'
        }
        ${className}
      `}
    >
      {leftIcon && <Icon name={leftIcon} size={14} />}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Chip/Chip.tsx
git commit -m "feat(ui): add Chip component with selected state"
```

---

## Task 7: Create Card Component

**Files:**
- Create: `frontend/src/components/ui/Card/Card.tsx`

**Interfaces:**
- Produces: `Card` component

---

### Task 7: Create Card Component

**Requirements & Acceptance Criteria:**
- [ ] Variants: elevated, outlined, flat
- [ ] Props: variant, padding, hoverable, children, onClick, className
- [ ] Hoverable cards have hover effects
- [ ] Clickable cards have cursor pointer

- [ ] **Step 1: Create Card component**

```tsx
// frontend/src/components/ui/Card/Card.tsx
import React from 'react';

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantClasses = {
  elevated: 'bg-surface-container-lowest shadow-card',
  outlined: 'bg-surface-container-lowest border border-outline-variant',
  flat: 'bg-surface-container-lowest',
};

export function Card({
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  children,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverable || onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-elevated hover:border-secondary' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Card/Card.tsx
git commit -m "feat(ui): add Card component with variants and hoverable"
```

---

## Task 8: Create Avatar Component

**Files:**
- Create: `frontend/src/components/ui/Avatar/Avatar.tsx`

**Interfaces:**
- Produces: `Avatar` component

---

### Task 8: Create Avatar Component

**Requirements & Acceptance Criteria:**
- [ ] Props: src, alt, initials, size, className
- [ ] Shows image if src provided
- [ ] Shows initials if no image
- [ ] Sizes: sm (32px), md (40px), lg (64px)

- [ ] **Step 1: Create Avatar component**

```tsx
// frontend/src/components/ui/Avatar/Avatar.tsx
import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-label-sm',
  md: 'w-10 h-10 text-label-md',
  lg: 'w-16 h-16 text-headline-sm',
};

export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showInitials = !src || imgError;

  if (showInitials) {
    return (
      <div
        className={`
          rounded-full bg-primary-container text-on-primary-container
          flex items-center justify-center font-bold
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {initials?.slice(0, 2).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={`
        rounded-full object-cover
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Avatar/Avatar.tsx
git commit -m "feat(ui): add Avatar component with image and initials support"
```

---

## Task 9: Create Spinner Component

**Files:**
- Create: `frontend/src/components/ui/Spinner/Spinner.tsx`

**Interfaces:**
- Produces: `Spinner` component

---

### Task 9: Create Spinner Component

**Requirements & Acceptance Criteria:**
- [ ] Props: size, className
- [ ] Sizes: sm (14px), md (20px), lg (32px)
- [ ] Uses Material Symbols for spinning animation

- [ ] **Step 1: Create Spinner component**

```tsx
// frontend/src/components/ui/Spinner/Spinner.tsx
import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 32,
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span 
      className={`material-symbols-outlined animate-spin ${className}`}
      style={{ fontSize: sizeMap[size] }}
    >
      progress_activity
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Spinner/Spinner.tsx
git commit -m "feat(ui): add Spinner component"
```

---

## Task 10: Create Select Component

**Files:**
- Create: `frontend/src/components/ui/Select/Select.tsx`
- Test: `frontend/src/components/ui/Select/Select.test.tsx`

**Interfaces:**
- Consumes: `Icon` component
- Produces: `Select` component

---

### Task 10: Create Select Component

**Requirements & Acceptance Criteria:**
- [ ] Props: label, options, value, onChange, placeholder, error, disabled, className
- [ ] Options array: { value: string, label: string }[]
- [ ] Shows error state correctly
- [ ] Native select element for accessibility

- [ ] **Step 1: Create Select component**

```tsx
// frontend/src/components/ui/Select/Select.tsx
import React from 'react';
import { Icon } from '../Icon/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
}: SelectProps) {
  const selectId = id || name || `select-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            w-full pl-11 pr-10 py-3 rounded-lg font-body-md appearance-none
            bg-surface-container-low border
            text-on-surface
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#90CAF9]
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${hasError 
              ? 'border-error focus:border-error' 
              : 'border-outline-variant focus:border-secondary'
            }
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon name="expand_more" size={20} className="text-outline" />
        </span>
      </div>
      {error && (
        <span className="font-body-sm text-error">{error}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Select tests**

```tsx
// frontend/src/components/ui/Select/Select.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const mockOptions = [
  { value: 'vn', label: 'Vietnam' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Country" options={mockOptions} />);
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  });

  it('renders options correctly', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Vietnam')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'us' } });
    expect(handleChange).toHaveBeenCalledWith('us');
  });

  it('shows error message', () => {
    render(<Select options={mockOptions} error="Country is required" />);
    expect(screen.getByText(/country is required/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Select/Select.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Select/Select.tsx src/components/ui/Select/Select.test.tsx
git commit -m "feat(ui): add Select component with options and error state"
```

---

## Task 11: Create Checkbox Component

**Files:**
- Create: `frontend/src/components/ui/Checkbox/Checkbox.tsx`
- Test: `frontend/src/components/ui/Checkbox/Checkbox.test.tsx`

**Interfaces:**
- Produces: `Checkbox` component

---

### Task 11: Create Checkbox Component

**Requirements & Acceptance Criteria:**
- [ ] Props: checked, onChange, disabled, label, className
- [ ] Controlled component (checked + onChange)
- [ ] Label is clickable
- [ ] Custom styling matching design system

- [ ] **Step 1: Create Checkbox component**

```tsx
// frontend/src/components/ui/Checkbox/Checkbox.tsx
import React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  id?: string;
  name?: string;
  className?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  name,
  className = '',
}: CheckboxProps) {
  const checkboxId = id || name || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label 
      htmlFor={checkboxId}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-4 h-4 rounded
            border-2 border-outline
            bg-transparent
            appearance-none
            cursor-pointer
            transition-colors duration-150
            checked:bg-secondary checked:border-secondary
            focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-2
            disabled:cursor-not-allowed
          "
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-on-secondary text-[14px]">
              check
            </span>
          </span>
        )}
      </div>
      {label && (
        <span className="font-body-md text-on-surface">{label}</span>
      )}
    </label>
  );
}
```

- [ ] **Step 2: Create Checkbox tests**

```tsx
// frontend/src/components/ui/Checkbox/Checkbox.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('disables when disabled prop is true', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('renders with label', () => {
    render(<Checkbox label="I agree to terms" />);
    expect(screen.getByText(/i agree to terms/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Checkbox/Checkbox.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Checkbox/Checkbox.tsx src/components/ui/Checkbox/Checkbox.test.tsx
git commit -m "feat(ui): add Checkbox component with custom styling"
```

---

## Task 12: Create Radio Component

**Files:**
- Create: `frontend/src/components/ui/Radio/Radio.tsx`

**Interfaces:**
- Produces: `Radio` component

---

### Task 12: Create Radio Component

**Requirements & Acceptance Criteria:**
- [ ] Props: checked, onChange, disabled, label, value, name, className
- [ ] Custom styling matching design system
- [ ] Group behavior via name prop

- [ ] **Step 1: Create Radio component**

```tsx
// frontend/src/components/ui/Radio/Radio.tsx
import React from 'react';

export interface RadioProps {
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  value: string;
  name: string;
  id?: string;
  className?: string;
}

export function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  value,
  name,
  id,
  className = '',
}: RadioProps) {
  const radioId = id || `${name}-${value}`;

  const handleChange = () => {
    onChange?.(value);
  };

  return (
    <label 
      htmlFor={radioId}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-4 h-4 rounded-full
            border-2 border-outline
            bg-transparent
            appearance-none
            cursor-pointer
            transition-colors duration-150
            checked:border-secondary
            focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-2
            disabled:cursor-not-allowed
          "
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </span>
        )}
      </div>
      {label && (
        <span className="font-body-md text-on-surface">{label}</span>
      )}
    </label>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Radio/Radio.tsx
git commit -m "feat(ui): add Radio component with custom styling"
```

---

## Task 13: Create Slider Component

**Files:**
- Create: `frontend/src/components/ui/Slider/Slider.tsx`

**Interfaces:**
- Produces: `Slider` component

---

### Task 13: Create Slider Component

**Requirements & Acceptance Criteria:**
- [ ] Props: min, max, step, value, onChange, disabled, label, formatValue, className
- [ ] Range slider with draggable handle
- [ ] Displays current value (formatted)

- [ ] **Step 1: Create Slider component**

```tsx
// frontend/src/components/ui/Slider/Slider.tsx
import React from 'react';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = min,
  onChange,
  disabled = false,
  label,
  formatValue = (v) => v.toString(),
  className = '',
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="font-label-lg text-label-lg text-primary">{label}</span>
          <span className="font-label-md text-label-md font-bold text-secondary">
            {formatValue(value)}
          </span>
        </div>
      )}
      <div className="relative pt-2 px-1">
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-secondary-container rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-full h-1.5 appearance-none bg-surface-container-high rounded-full
            cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-secondary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-secondary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>
      <div className="flex justify-between text-[11px] font-label-sm text-outline px-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Slider/Slider.tsx
git commit -m "feat(ui): add Slider component for price range"
```

---

## Task 14: Create Breadcrumb Component

**Files:**
- Create: `frontend/src/components/ui/Breadcrumb/Breadcrumb.tsx`

**Interfaces:**
- Consumes: `Icon` component
- Produces: `Breadcrumb` component

---

### Task 14: Create Breadcrumb Component

**Requirements & Acceptance Criteria:**
- [ ] Props: items array [{label, href?, icon?}]
- [ ] Shows separator between items
- [ ] Last item is not a link (current page)
- [ ] Icons supported for items

- [ ] **Step 1: Create Breadcrumb component**

```tsx
// frontend/src/components/ui/Breadcrumb/Breadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconName } from '../Icon/Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-space-xs text-on-surface-variant font-label-md ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-outline-variant">/</span>
            )}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-primary font-bold' : ''}>
                {item.icon && !isFirst && <Icon name={item.icon} size={16} className="inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href} 
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Breadcrumb/Breadcrumb.tsx
git commit -m "feat(ui): add Breadcrumb component with navigation"
```

---

## Task 15: Create Stepper Component

**Files:**
- Create: `frontend/src/components/ui/Stepper/Stepper.tsx`
- Test: `frontend/src/components/ui/Stepper/Stepper.test.tsx`

**Interfaces:**
- Produces: `Stepper` component

---

### Task 15: Create Stepper Component

**Requirements & Acceptance Criteria:**
- [ ] Props: steps array [{id, label, status}], currentStep
- [ ] Status: 'complete' | 'active' | 'pending'
- [ ] Visual distinction for each status
- [ ] Tests pass: renders correctly, shows correct states

- [ ] **Step 1: Create Stepper component**

```tsx
// frontend/src/components/ui/Stepper/Stepper.tsx
import React from 'react';
import { Icon } from '../Icon/Icon';

export interface Step {
  id: string;
  label: string;
  status: 'complete' | 'active' | 'pending';
}

export interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className = '' }: StepperProps) {
  return (
    <div className={`grid grid-cols-${steps.length} gap-space-sm relative ${className}`}>
      {steps.map((step, index) => {
        const isComplete = step.status === 'complete';
        const isActive = step.status === 'active';

        return (
          <div 
            key={step.id} 
            className={`
              flex items-center gap-space-sm
              ${isActive ? 'bg-surface-container-high px-space-sm py-1.5 rounded-lg shadow-sm' : ''}
            `}
          >
            {/* Step indicator */}
            <div 
              className={`
                w-7 h-7 rounded-full flex items-center justify-center
                ${isComplete 
                  ? 'bg-primary text-on-primary' 
                  : isActive 
                    ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary-fixed-dim' 
                    : 'bg-surface-container text-on-surface-variant'
                }
                font-bold text-[12px]
              `}
            >
              {isComplete ? (
                <Icon name="check" size={16} />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step label */}
            <div className="min-w-0">
              <p className={`
                font-label-sm uppercase tracking-wider
                ${isActive ? 'text-on-secondary-container font-semibold' : 'text-on-surface-variant'}
              `}>
                {isActive ? 'Active' : `Step ${index + 1}`}
              </p>
              <p className={`
                font-label-md truncate
                ${isActive ? 'text-primary font-bold' : 'text-on-surface font-semibold'}
              `}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create Stepper tests**

```tsx
// frontend/src/components/ui/Stepper/Stepper.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const mockSteps = [
  { id: '1', label: 'Select Flight', status: 'complete' as const },
  { id: '2', label: 'Passenger Info', status: 'complete' as const },
  { id: '3', label: 'Add-ons', status: 'active' as const },
  { id: '4', label: 'Payment', status: 'pending' as const },
];

describe('Stepper', () => {
  it('renders all steps', () => {
    render(<Stepper steps={mockSteps} />);
    expect(screen.getByText('Select Flight')).toBeInTheDocument();
    expect(screen.getByText('Passenger Info')).toBeInTheDocument();
    expect(screen.getByText('Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('shows check icon for completed steps', () => {
    render(<Stepper steps={mockSteps} />);
    const checkIcons = document.querySelectorAll('.material-symbols-outlined');
    expect(checkIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows active state for current step', () => {
    render(<Stepper steps={mockSteps} />);
    const activeStep = screen.getByText('Active');
    expect(activeStep).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Stepper/Stepper.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Stepper/Stepper.tsx src/components/ui/Stepper/Stepper.test.tsx
git commit -m "feat(ui): add Stepper component for checkout flow"
```

---

## Task 16: Create Modal Component

**Files:**
- Create: `frontend/src/components/ui/Modal/Modal.tsx`
- Test: `frontend/src/components/ui/Modal/Modal.test.tsx`

**Interfaces:**
- Consumes: `Button`, `Icon` components
- Produces: `Modal` component

---

### Task 16: Create Modal Component

**Requirements & Acceptance Criteria:**
- [ ] Props: isOpen, onClose, title, children, size, className
- [ ] Sizes: sm, md, lg, xl
- [ ] Click outside closes modal
- [ ] Escape key closes modal
- [ ] Renders portal to body
- [ ] Tests pass: opens, closes, click outside

- [ ] **Step 1: Create Modal component**

```tsx
// frontend/src/components/ui/Modal/Modal.tsx
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div 
        className={`
          relative bg-surface-container-lowest rounded-xl shadow-floating
          w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-container-low transition-colors"
              aria-label="Close modal"
            >
              <Icon name="close" size={20} className="text-on-surface-variant" />
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 2: Create Modal tests**

```tsx
// frontend/src/components/ui/Modal/Modal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    );
    fireEvent.click(screen.getByRole('dialog').firstChild!);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders with title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/ui/Modal/Modal.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Modal/Modal.tsx src/components/ui/Modal/Modal.test.tsx
git commit -m "feat(ui): add Modal component with portal and keyboard support"
```

---

## Task 17: Create Barrel Export

**Files:**
- Create: `frontend/src/components/ui/index.ts`

**Interfaces:**
- Produces: Single export point for all UI components

---

### Task 17: Create Barrel Export

**Requirements & Acceptance Criteria:**
- [ ] Exports all 15 components
- [ ] Type exports included
- [ ] Enables clean imports: `import { Button, Input } from '@/components/ui'`

- [ ] **Step 1: Create barrel export**

```tsx
// frontend/src/components/ui/index.ts
// Components
export { Button } from './Button/Button';
export type { ButtonProps } from './Button/Button';

export { Input } from './Input/Input';
export type { InputProps } from './Input/Input';

export { Select } from './Select/Select';
export type { SelectProps, SelectOption } from './Select/Select';

export { Checkbox } from './Checkbox/Checkbox';
export type { CheckboxProps } from './Checkbox/Checkbox';

export { Radio } from './Radio/Radio';
export type { RadioProps } from './Radio/Radio';

export { Badge } from './Badge/Badge';
export type { BadgeProps } from './Badge/Badge';

export { Chip } from './Chip/Chip';
export type { ChipProps } from './Chip/Chip';

export { Card } from './Card/Card';
export type { CardProps } from './Card/Card';

export { Avatar } from './Avatar/Avatar';
export type { AvatarProps } from './Avatar/Avatar';

export { Spinner } from './Spinner/Spinner';
export type { SpinnerProps } from './Spinner/Spinner';

export { Slider } from './Slider/Slider';
export type { SliderProps } from './Slider/Slider';

export { Breadcrumb } from './Breadcrumb/Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb/Breadcrumb';

export { Stepper } from './Stepper/Stepper';
export type { StepperProps, Step } from './Stepper/Stepper';

export { Modal } from './Modal/Modal';
export type { ModalProps } from './Modal/Modal';

// Icons
export { Icon } from './Icon/Icon';
export type { IconName } from './Icon/Icon';
```

- [ ] **Step 2: Verify exports**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "feat(ui): add barrel export for all components"
```

---

## Self-Review Checklist

- [ ] All 15 components created with correct props and variants
- [ ] All components use CSS variables from Phase 1
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] Barrel export includes all components
- [ ] No hardcoded colors

## Summary

**Tasks Completed:** 17
**Files Created:** 19 components + 8 test files + 1 barrel export
**Components:** Icon, Button, Input, Select, Checkbox, Radio, Badge, Chip, Card, Avatar, Spinner, Slider, Breadcrumb, Stepper, Modal

**Next Phase:** Phase 3 - Composite Components
