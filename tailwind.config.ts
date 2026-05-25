import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        green: {
          50: 'oklch(0.98 0.02 65)',
          100: 'oklch(0.95 0.04 65)',
          200: 'oklch(0.90 0.06 65)',
          300: 'oklch(0.85 0.08 65)',
          400: 'var(--aig-accent-warm)', // oklch(0.75 0.15 65)
          500: 'var(--aig-accent-warm)', // oklch(0.75 0.15 65)
          600: 'var(--aig-accent-warm-dim)', // oklch(0.55 0.10 65)
          700: 'oklch(0.45 0.08 65)',
          800: 'oklch(0.35 0.06 65)',
          900: 'oklch(0.25 0.04 65)',
        },
        gray: {
          50: 'var(--aig-text-primary)',
          100: 'var(--aig-text-primary)',
          200: 'var(--aig-text-body)',
          300: 'var(--aig-text-body)',
          400: 'var(--aig-text-secondary)',
          500: 'var(--aig-text-secondary)',
          600: 'var(--aig-text-tertiary)',
          700: 'var(--aig-void-glass)',
          800: 'var(--aig-void-raised)',
          900: 'var(--aig-void-base)',
          950: 'var(--aig-void-deep)',
        },
        zinc: {
          50: 'var(--aig-text-primary)',
          100: 'var(--aig-text-primary)',
          200: 'var(--aig-text-body)',
          300: 'var(--aig-text-body)',
          400: 'var(--aig-text-secondary)',
          500: 'var(--aig-text-secondary)',
          600: 'var(--aig-text-tertiary)',
          700: 'var(--aig-void-glass)',
          800: 'var(--aig-void-raised)',
          900: 'var(--aig-void-base)',
          950: 'var(--aig-void-deep)',
        },
        slate: {
          50: 'var(--aig-text-primary)',
          100: 'var(--aig-text-primary)',
          200: 'var(--aig-text-body)',
          300: 'var(--aig-text-body)',
          400: 'var(--aig-text-secondary)',
          500: 'var(--aig-text-secondary)',
          600: 'var(--aig-text-tertiary)',
          700: 'var(--aig-void-glass)',
          800: 'var(--aig-void-raised)',
          900: 'var(--aig-void-base)',
          950: 'var(--aig-void-deep)',
        },
        neutral: {
          50: 'var(--aig-text-primary)',
          100: 'var(--aig-text-primary)',
          200: 'var(--aig-text-body)',
          300: 'var(--aig-text-body)',
          400: 'var(--aig-text-secondary)',
          500: 'var(--aig-text-secondary)',
          600: 'var(--aig-text-tertiary)',
          700: 'var(--aig-void-glass)',
          800: 'var(--aig-void-raised)',
          900: 'var(--aig-void-base)',
          950: 'var(--aig-void-deep)',
        },
      },
      fontFamily: {
        sans: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-glass-tty)', 'var(--font-array)', 'var(--font-vt323)', 'monospace'],
        heading: ['var(--font-share-tech)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
export default config