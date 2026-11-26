/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          alpha: 'var(--color-accent-alpha)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
        },
        background: 'var(--color-background)',

        // Text colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },

        // Semantic colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',

        // Quran-specific colors
        quran: {
          text: 'var(--color-ayah-text)',
          number: 'var(--color-ayah-number)',
          bismillah: 'var(--color-bismillah)',
          mushafBg: 'var(--color-mushaf-bg)',
          mushafBorder: 'var(--color-mushaf-border)',
        },

        // Component colors
        card: {
          bg: 'var(--color-card-bg)',
          border: 'var(--color-card-border)',
        },

        // Backward compatibility with old color names
        quranic: {
          gold: '#D4AF37',
          green: '#2D5016',
          darkGreen: '#1a2e0d',
          cream: '#F5F5DC',
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        quran: ['Scheherazade New', 'Amiri', 'serif'],
      },
      boxShadow: {
        sm: 'var(--effect-shadowSm)',
        md: 'var(--effect-shadowMd)',
        lg: 'var(--effect-shadowLg)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
}
