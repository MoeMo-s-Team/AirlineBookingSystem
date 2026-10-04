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
        'margin-mobile': 'var(--spacing-margin-mobile)',
        'gutter': 'var(--spacing-gutter)',
        'gutter-mobile': 'var(--spacing-gutter-mobile)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
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
      fontSize: {
        'display-hero': ['var(--font-size-display-hero)', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-hero-mobile': ['var(--font-size-display-hero-mobile)', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['var(--font-size-headline-lg)', { lineHeight: '40px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-lg-mobile': ['var(--font-size-headline-lg-mobile)', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['var(--font-size-headline-md)', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['var(--font-size-headline-sm)', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['var(--font-size-body-lg)', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['var(--font-size-body-md)', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['var(--font-size-body-sm)', { lineHeight: '16px', fontWeight: '400' }],
        'label-code': ['var(--font-size-label-code)', { lineHeight: '32px', letterSpacing: '0.04em', fontWeight: '700' }],
        'label-lg': ['var(--font-size-label-lg)', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['var(--font-size-label-md)', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['var(--font-size-label-sm)', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
