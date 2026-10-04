# Phase 1: Design System Foundation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Aero Minimalist design tokens from templates and configure frontend to use them via CSS Variables + Tailwind.

**Architecture:** 
- CSS Variables in `tokens.css` as source of truth
- Tailwind config extends theme with CSS variable references
- Google Fonts CDN for Roboto Flex typography
- Light mode only (no dark mode)

**Tech Stack:** Tailwind CSS 3.x, React (existing), Vanilla CSS Variables

**Spec:** `stitch_skywing_flight_booking_interface/aero_minimalist/DESIGN.md`

## Global Constraints

- Use exactly the hex colors from DESIGN.md (no approximations)
- Font: Roboto Flex from Google Fonts CDN
- No dark mode implementation
- All Tailwind utilities must reference CSS variables
- Must work with existing React/Vite setup

## Review Focus

- Colors match template exactly (verify hex values)
- Typography renders correctly (Roboto Flex loaded)
- Tailwind utilities work (e.g., `bg-primary`, `text-secondary`)
- Shadows match design spec
- Responsive spacing works

---

## Task 1: Create Design Tokens CSS File

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Test: `frontend/src/styles/tokens.css` (manual verification)

**Interfaces:**
- Produces: CSS custom properties consumed by Tailwind config and components

---

### Task 1: Create tokens.css

**Requirements & Acceptance Criteria:**
- [ ] File created at correct path `frontend/src/styles/tokens.css`
- [ ] All 35+ color tokens defined as CSS custom properties
- [ ] All typography tokens defined
- [ ] All spacing tokens defined
- [ ] All border-radius tokens defined
- [ ] All shadow tokens defined
- [ ] Tokens match DESIGN.md hex values exactly

- [ ] **Step 1: Create tokens.css with all design tokens**

```css
/* Aero Minimalist Design Tokens - SkyWing Airlines */
:root {
  /* ========== COLORS ========== */
  
  /* Primary Palette */
  --color-primary: #003178;
  --color-on-primary: #ffffff;
  --color-primary-container: #0d47a1;
  --color-on-primary-container: #a1bbff;
  --color-inverse-primary: #b0c6ff;
  --color-primary-fixed: #d9e2ff;
  --color-primary-fixed-dim: #b0c6ff;
  --color-on-primary-fixed: #001945;
  --color-on-primary-fixed-variant: #00429c;
  
  /* Secondary Palette */
  --color-secondary: #0061a4;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #33a0fd;
  --color-on-secondary-container: #00355c;
  --color-secondary-fixed: #d1e4ff;
  --color-secondary-fixed-dim: #9ecaff;
  --color-on-secondary-fixed: #001d36;
  --color-on-secondary-fixed-variant: #00497d;
  
  /* Tertiary Palette */
  --color-tertiary: #003856;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #005078;
  --color-on-tertiary-container: #88c2f0;
  --color-tertiary-fixed: #cbe6ff;
  --color-tertiary-fixed-dim: #93cdfc;
  --color-on-tertiary-fixed: #001e30;
  --color-on-tertiary-fixed-variant: #004b71;
  
  /* Surface Colors */
  --color-surface: #f9f9ff;
  --color-surface-dim: #cfdaf2;
  --color-surface-bright: #f9f9ff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f0f3ff;
  --color-surface-container: #e7eeff;
  --color-surface-container-high: #dee8ff;
  --color-surface-container-highest: #d8e3fb;
  --color-surface-variant: #d8e3fb;
  --color-surface-tint: #2b5bb5;
  
  /* On Surface */
  --color-on-surface: #111c2d;
  --color-on-surface-variant: #434652;
  --color-inverse-surface: #263143;
  --color-inverse-on-surface: #ecf1ff;
  
  /* Outline */
  --color-outline: #737783;
  --color-outline-variant: #c3c6d4;
  
  /* Background */
  --color-background: #f9f9ff;
  --color-on-background: #111c2d;
  
  /* Error */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;
  
  /* ========== TYPOGRAPHY ========== */
  --font-family-base: 'Roboto Flex', system-ui, sans-serif;
  
  /* ========== SPACING ========== */
  --spacing-space-xs: 0.25rem;
  --spacing-space-sm: 0.5rem;
  --spacing-space-md: 1rem;
  --spacing-space-lg: 1.5rem;
  --spacing-space-xl: 2.5rem;
  --spacing-margin: 2rem;
  --spacing-gutter: 1.5rem;
  --spacing-gutter-mobile: 1rem;
  
  /* ========== BORDER RADIUS ========== */
  --radius-sm: 0.125rem;
  --radius: 0.25rem;
  --radius-lg: 0.375rem;
  --radius-xl: 0.5rem;
  --radius-full: 0.75rem;
  
  /* ========== SHADOWS ========== */
  --shadow-card: 0 1px 3px rgba(13,71,161,0.04), 0 1px 2px rgba(0,0,0,0.02);
  --shadow-elevated: 0 8px 20px -4px rgba(13,71,161,0.08), 0 4px 6px -2px rgba(13,71,161,0.03);
  --shadow-floating: 0 20px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.03);
}
```

- [ ] **Step 2: Verify file exists**

Run: `ls -la frontend/src/styles/tokens.css`
Expected: File exists with content

---

## Task 2: Create Styles Entry File

**Files:**
- Create: `frontend/src/styles/index.css`
- Modify: `frontend/src/index.css` (existing)

**Interfaces:**
- Consumes: `tokens.css`
- Produces: Global styles layer

---

### Task 2: Create styles/index.css

**Requirements & Acceptance Criteria:**
- [ ] File created at `frontend/src/styles/index.css`
- [ ] Imports Google Fonts (Roboto Flex)
- [ ] Imports tokens.css
- [ ] Configures Tailwind layers
- [ ] Sets global component defaults

- [ ] **Step 1: Create styles/index.css**

```css
/* Google Fonts - Roboto Flex */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;500;600;700&display=swap');

/* Design Tokens */
@import './tokens.css';

/* Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global base styles */
@layer base {
  html {
    font-family: var(--font-family-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    background-color: var(--color-background);
    color: var(--color-on-surface);
  }
}

/* Custom component utilities */
@layer components {
  /* Primary Button */
  .btn-primary {
    @apply inline-flex items-center justify-center px-6 py-3 rounded font-label-lg;
    @apply bg-secondary text-on-secondary;
    @apply hover:bg-[#1976D2] active:bg-[#0D47A1];
    @apply focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-2;
    @apply transition-colors duration-150;
  }
  
  /* Secondary Button */
  .btn-secondary {
    @apply inline-flex items-center justify-center px-6 py-3 rounded font-label-lg;
    @apply bg-transparent border border-primary text-primary;
    @apply hover:bg-surface-container-low;
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
    @apply transition-colors duration-150;
  }
  
  /* Tertiary Button */
  .btn-tertiary {
    @apply inline-flex items-center justify-center px-4 py-2 font-label-md;
    @apply text-on-surface-variant;
    @apply hover:text-on-surface;
    @apply transition-colors duration-150;
  }
  
  /* Card */
  .card {
    @apply bg-surface-container-lowest rounded-xl;
    box-shadow: var(--shadow-card);
    @apply border border-outline-variant;
  }
  
  /* Card Elevated */
  .card-elevated {
    @apply bg-surface-container-lowest rounded-xl;
    box-shadow: var(--shadow-elevated);
  }
  
  /* Input */
  .input {
    @apply w-full px-4 py-3 rounded-lg font-body-md;
    @apply bg-surface-container-low border border-outline-variant;
    @apply text-on-surface placeholder:text-on-surface-variant;
    @apply focus:border-secondary focus:ring-2 focus:ring-[#90CAF9] focus:ring-offset-0;
    @apply transition-colors duration-150;
  }
  
  /* Badge */
  .badge {
    @apply inline-flex items-center px-2 py-1 rounded-full font-label-sm text-label-sm;
  }
  
  /* Chip */
  .chip {
    @apply inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-label-md;
    @apply bg-surface-container-high border border-outline;
    @apply text-on-surface-variant;
    @apply hover:border-primary hover:text-primary;
    @apply cursor-pointer transition-colors duration-150;
  }
  
  .chip-selected {
    @apply bg-primary text-on-primary border-transparent;
    @apply hover:bg-primary-container hover:text-on-primary-container;
  }
}
```

- [ ] **Step 2: Update frontend/src/index.css**

```css
/* Re-export styles from styles folder */
@import './styles/index.css';
```

- [ ] **Step 3: Verify file structure**

Run: `ls -la frontend/src/styles/`
Expected: `index.css` and `tokens.css` exist

---

## Task 3: Configure Tailwind with Design Tokens

**Files:**
- Modify: `frontend/tailwind.config.js` (existing, may need check)
- Modify: `frontend/postcss.config.js` (if exists)

**Interfaces:**
- Consumes: `tokens.css` CSS variables
- Produces: Tailwind theme extended with all tokens

---

### Task 3: Extend Tailwind Config

**Requirements & Acceptance Criteria:**
- [ ] `tailwind.config.js` exists in frontend root
- [ ] All colors mapped to CSS variables
- [ ] All spacing mapped to CSS variables
- [ ] All border-radius mapped to CSS variables
- [ ] All font families mapped
- [ ] All shadows mapped
- [ ] Content paths include all src files

- [ ] **Step 1: Check if tailwind.config.js exists**

Run: `ls -la frontend/tailwind.config.js frontend/postcss.config.js 2>/dev/null || echo "Files not found"`

- [ ] **Step 2: Create tailwind.config.js with design tokens**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        'inverse-primary': 'var(--color-inverse-primary)',
        'primary-fixed': 'var(--color-primary-fixed)',
        'primary-fixed-dim': 'var(--color-primary-fixed-dim)',
        'on-primary-fixed': 'var(--color-on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--color-on-primary-fixed-variant)',
        
        // Secondary
        secondary: 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
        'secondary-fixed': 'var(--color-secondary-fixed)',
        'secondary-fixed-dim': 'var(--color-secondary-fixed-dim)',
        'on-secondary-fixed': 'var(--color-on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--color-on-secondary-fixed-variant)',
        
        // Tertiary
        tertiary: 'var(--color-tertiary)',
        'on-tertiary': 'var(--color-on-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',
        'on-tertiary-container': 'var(--color-on-tertiary-container)',
        'tertiary-fixed': 'var(--color-tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--color-tertiary-fixed-dim)',
        'on-tertiary-fixed': 'var(--color-on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--color-on-tertiary-fixed-variant)',
        
        // Surface
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-variant': 'var(--color-surface-variant)',
        'surface-tint': 'var(--color-surface-tint)',
        
        // On Surface
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'inverse-surface': 'var(--color-inverse-surface)',
        'inverse-on-surface': 'var(--color-inverse-on-surface)',
        
        // Outline
        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',
        
        // Background
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        
        // Error
        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
        'error-container': 'var(--color-error-container)',
        'on-error-container': 'var(--color-on-error-container)',
      },
      spacing: {
        'space-xs': 'var(--spacing-space-xs)',
        'space-sm': 'var(--spacing-space-sm)',
        'space-md': 'var(--spacing-space-md)',
        'space-lg': 'var(--spacing-space-lg)',
        'space-xl': 'var(--spacing-space-xl)',
        'margin': 'var(--spacing-margin)',
        'gutter': 'var(--spacing-gutter)',
        'gutter-mobile': 'var(--spacing-gutter-mobile)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        base: ['var(--font-family-base)'],
        'display-hero': ['var(--font-family-base)'],
        'display-hero-mobile': ['var(--font-family-base)'],
        'headline-lg': ['var(--font-family-base)'],
        'headline-lg-mobile': ['var(--font-family-base)'],
        'headline-md': ['var(--font-family-base)'],
        'headline-sm': ['var(--font-family-base)'],
        'body-lg': ['var(--font-family-base)'],
        'body-md': ['var(--font-family-base)'],
        'body-sm': ['var(--font-family-base)'],
        'label-lg': ['var(--font-family-base)'],
        'label-md': ['var(--font-family-base)'],
        'label-sm': ['var(--font-family-base)'],
        'label-code': ['var(--font-family-base)'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'floating': 'var(--shadow-floating)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Verify Tailwind config is valid**

Run: `cd frontend && npx tailwindcss --help | head -5`
Expected: Tailwind CLI help output

---

## Task 4: Verify Design System Integration

**Files:**
- Test: `frontend/src/App.tsx` (existing, modify temporarily)

**Interfaces:**
- Consumes: All tokens, Tailwind config
- Produces: Verified working design system

---

### Task 4: Integration Verification

**Requirements & Acceptance Criteria:**
- [ ] Dev server starts without errors
- [ ] CSS variables load correctly (check browser DevTools)
- [ ] Tailwind utilities work (bg-primary, text-secondary, etc.)
- [ ] Google Font loads
- [ ] No console errors related to styles

- [ ] **Step 1: Create verification component for testing**

Create `frontend/src/components/TestDesignSystem.tsx`:

```tsx
export function TestDesignSystem() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      {/* Colors */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Colors</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="w-20 h-20 bg-primary rounded-lg" title="primary" />
          <div className="w-20 h-20 bg-secondary rounded-lg" title="secondary" />
          <div className="w-20 h-20 bg-tertiary rounded-lg" title="tertiary" />
          <div className="w-20 h-20 bg-surface-container rounded-lg border" title="surface-container" />
        </div>
      </section>
      
      {/* Typography */}
      <section className="space-y-2">
        <h2 className="font-headline-lg text-primary">Typography</h2>
        <p className="font-display-hero text-primary">Display Hero</p>
        <p className="font-headline-lg text-on-surface">Headline LG</p>
        <p className="font-headline-md text-on-surface">Headline MD</p>
        <p className="font-headline-sm text-on-surface">Headline SM</p>
        <p className="font-body-lg text-on-surface">Body LG</p>
        <p className="font-body-md text-on-surface">Body MD</p>
        <p className="font-label-lg text-on-surface">Label LG</p>
        <p className="font-label-code text-primary">HAN</p>
      </section>
      
      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Buttons</h2>
        <div className="flex gap-4">
          <button className="btn-primary">Primary CTA</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn-tertiary">Tertiary</button>
        </div>
      </section>
      
      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Inputs</h2>
        <input type="text" className="input" placeholder="Enter text..." />
      </section>
      
      {/* Cards */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Cards</h2>
        <div className="card p-6 max-w-sm">
          <h3 className="font-headline-sm text-on-surface">Card Title</h3>
          <p className="font-body-md text-on-surface-variant mt-2">
            Card content goes here with some descriptive text.
          </p>
        </div>
      </section>
      
      {/* Badges */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Badges & Chips</h2>
        <div className="flex gap-4">
          <span className="badge bg-secondary text-on-secondary">Badge</span>
          <span className="chip">Filter Chip</span>
          <span className="chip chip-selected">Selected</span>
        </div>
      </section>
      
      {/* Shadows */}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-primary">Shadows</h2>
        <div className="flex gap-8">
          <div className="w-32 h-32 bg-surface-container-lowest rounded-lg shadow-card flex items-center justify-center text-body-sm">
            Card
          </div>
          <div className="w-32 h-32 bg-surface-container-lowest rounded-lg shadow-elevated flex items-center justify-center text-body-sm">
            Elevated
          </div>
          <div className="w-32 h-32 bg-surface-container-lowest rounded-lg shadow-floating flex items-center justify-center text-body-sm">
            Floating
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx temporarily to test**

```tsx
import { TestDesignSystem } from './components/TestDesignSystem'

function App() {
  return <TestDesignSystem />
}

export default App
```

- [ ] **Step 3: Start dev server and verify**

Run: `cd frontend && pnpm dev`
Expected: 
- Server starts on http://localhost:5173
- Page shows all design tokens correctly
- No console errors
- Colors match template
- Typography renders with Roboto Flex

- [ ] **Step 4: Revert App.tsx changes**

Restore `App.tsx` to original state (with AuthProvider and routing).

- [ ] **Step 5: Delete TestDesignSystem.tsx**

Run: `rm frontend/src/components/TestDesignSystem.tsx`

---

## Task 5: Final Verification & Commit

**Files:**
- Commit: All Phase 1 files

---

### Task 5: Verify and Commit

**Requirements & Acceptance Criteria:**
- [ ] All 5 tasks completed
- [ ] No errors in dev server
- [ ] Design tokens verified visually
- [ ] Committed with descriptive message

- [ ] **Step 1: Final verification**

Run dev server and visually verify:
- Primary blue (#003178) visible
- Secondary blue (#0061a4) visible
- Surface colors correct
- Typography hierarchy clear
- Shadows work

- [ ] **Step 2: Commit Phase 1**

```bash
cd frontend
git add src/styles/tokens.css src/styles/index.css src/index.css tailwind.config.js
git commit -m "feat(frontend): add Aero Minimalist design system foundation

- Extract design tokens from Stitch templates (35+ colors, typography, spacing)
- Configure Tailwind with CSS variables for easy theming
- Add Google Fonts (Roboto Flex) via CDN
- Create base component utilities (.btn-primary, .card, .input, .badge, .chip)

Design system provides foundation for all frontend pages."
```

---

## Self-Review Checklist

After completing all tasks:

- [ ] Spec coverage: All tokens from DESIGN.md implemented
- [ ] No placeholder: All hex values are exact matches from template
- [ ] Type consistency: N/A (CSS-only)
- [ ] Review Focus verified:
  - [ ] Colors match template hex values
  - [ ] Typography renders with Roboto Flex
  - [ ] Tailwind utilities work (bg-primary, text-secondary)
  - [ ] Shadows match design spec
  - [ ] Responsive spacing works

---

## Summary

**Tasks Completed:** 5
**Files Created:** 4
**Files Modified:** 2
**Lines of Code:** ~350 CSS, ~200 Tailwind config

**Next Phase:** Phase 2 - Atomic Components
