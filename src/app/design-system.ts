/**
 * Design System for IASE (International Association of Spreadsheet Enthusiasts)
 * Fortune 500 Professional + Tech Startup Polish
 *
 * Based on design context: corporate, luxury, convincing
 */

// === TYPOGRAPHY ===

/**
 * Font Selection Rationale:
 * Brand voice: "corporate, luxury, convincing"
 * Physical object reference: Premium financial institution letterhead
 *
 * Display Font: 'Playfair Display' - Luxury serif with editorial quality
 * Body Font: 'Source Sans 3' - Clean, professional sans-serif with tech startup feel
 * Monospace Font: 'JetBrains Mono' - Technical precision for data/code
 */

export const typography = {
  fonts: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Fluid type scale for headings (marketing pages)
  fluid: {
    'hero': 'clamp(2.5rem, 5vw, 4rem)',     // 40px - 64px
    'h1': 'clamp(2rem, 4vw, 3rem)',          // 32px - 48px
    'h2': 'clamp(1.5rem, 3vw, 2.25rem)',     // 24px - 36px
    'h3': 'clamp(1.25rem, 2vw, 1.75rem)',    // 20px - 28px
    'h4': 'clamp(1.125rem, 1.5vw, 1.5rem)',  // 18px - 24px
  },

  // Fixed rem scale for UI components
  fixed: {
    'xs': '0.75rem',     // 12px
    'sm': '0.875rem',    // 14px
    'base': '1rem',      // 16px
    'lg': '1.125rem',    // 18px
    'xl': '1.25rem',     // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
  },

  // Line heights (inverted scale for width)
  leading: {
    'tight': '1.25',      // Narrow columns
    'normal': '1.5',      // Standard body text
    'relaxed': '1.75',    // Wide columns
    'display': '1.1',     // Headings
  },

  // Font weights (intentional contrast)
  weights: {
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
  },

  // Letter spacing for optical refinement
  tracking: {
    'tight': '-0.02em',
    'normal': '0',
    'wide': '0.05em',
    'wider': '0.1em',
  },
}

// === COLOR PALETTE ===

/**
 * Color Strategy:
 * Brand hue: Deep emerald (conveys trust, growth, stability)
 * Using OKLCH for perceptual uniformity
 * Neutrals tinted toward brand hue for subconscious cohesion
 * 60-30-10 visual weight rule applied
 */

export const colors = {
  // Primary brand color - Deep emerald
  primary: {
    50: 'oklch(0.95 0.03 155)',
    100: 'oklch(0.92 0.04 155)',
    200: 'oklch(0.87 0.06 155)',
    300: 'oklch(0.80 0.08 155)',
    400: 'oklch(0.72 0.10 155)',
    500: 'oklch(0.65 0.12 155)',  // Primary brand
    600: 'oklch(0.55 0.14 155)',
    700: 'oklch(0.45 0.16 155)',
    800: 'oklch(0.35 0.18 155)',
    900: 'oklch(0.25 0.20 155)',
  },

  // Accent color - Sophisticated gold (luxury touch)
  accent: {
    50: 'oklch(0.98 0.02 85)',
    100: 'oklch(0.95 0.04 85)',
    200: 'oklch(0.90 0.06 85)',
    300: 'oklch(0.85 0.08 85)',
    400: 'oklch(0.78 0.10 85)',
    500: 'oklch(0.70 0.12 85)',  // Primary accent
    600: 'oklch(0.60 0.14 85)',
    700: 'oklch(0.50 0.16 85)',
    800: 'oklch(0.40 0.18 85)',
    900: 'oklch(0.30 0.20 85)',
  },

  // Neutrals tinted toward emerald (subtle brand cohesion)
  neutral: {
    50: 'oklch(0.98 0.005 155)',   // Nearly white, hint of emerald
    100: 'oklch(0.96 0.008 155)',
    200: 'oklch(0.92 0.010 155)',
    300: 'oklch(0.85 0.012 155)',
    400: 'oklch(0.75 0.015 155)',   // Border color
    500: 'oklch(0.60 0.018 155)',   // Secondary text
    600: 'oklch(0.45 0.020 155)',   // Primary text
    700: 'oklch(0.35 0.022 155)',
    800: 'oklch(0.25 0.024 155)',
    900: 'oklch(0.15 0.026 155)',   // Nearly black, hint of emerald
  },

  // Semantic colors (tinted, not pure hues)
  semantic: {
    success: 'oklch(0.70 0.12 145)',
    warning: 'oklch(0.75 0.15 65)',
    error: 'oklch(0.65 0.18 25)',
    info: 'oklch(0.70 0.12 220)',
  },

  // Gradients (subtle, not overwhelming)
  gradients: {
    primary: 'linear-gradient(135deg, oklch(0.65 0.12 155) 0%, oklch(0.55 0.14 155) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.70 0.12 85) 0%, oklch(0.60 0.14 85) 100%)',
    subtle: 'linear-gradient(180deg, oklch(0.98 0.005 155) 0%, oklch(0.96 0.008 155) 100%)',
  },
}

// === SPACING SCALE ===

/**
 * 4pt scale with semantic names
 * Creating visual rhythm through varied spacing
 */

export const spacing = {
  'xs': '0.25rem',   // 4px
  'sm': '0.5rem',    // 8px
  'md': '0.75rem',   // 12px (frequently needed)
  'lg': '1rem',      // 16px
  'xl': '1.5rem',    // 24px
  '2xl': '2rem',     // 32px
  '3xl': '3rem',     // 48px
  '4xl': '4rem',     // 64px
  '5xl': '6rem',     // 96px

  // Fluid spacing for responsive layouts
  fluid: {
    'sm': 'clamp(0.5rem, 2vw, 1rem)',
    'md': 'clamp(1rem, 3vw, 2rem)',
    'lg': 'clamp(2rem, 5vw, 4rem)',
    'xl': 'clamp(3rem, 8vw, 6rem)',
  },
}

// === BORDERS & RADIUS ===

/**
 * Sophisticated border treatment
 * Subtle radius for luxury feel
 */

export const borders = {
  radius: {
    'none': '0',
    'sm': '0.25rem',    // 4px - Subtle
    'md': '0.5rem',     // 8px - Standard
    'lg': '0.75rem',    // 12px - Large elements
    'xl': '1rem',       // 16px - Hero elements
    'full': '9999px',
  },

  width: {
    'none': '0',
    'hairline': '1px',
    'thin': '2px',
    'medium': '3px',
    'thick': '4px',
  },
}

// === SHADOWS ===

/**
 * Luxury shadow system
 * Subtle, sophisticated, not harsh
 */

export const shadows = {
  'none': 'none',
  'sm': '0 1px 2px 0 oklch(0.25 0.026 155 / 0.05)',
  'md': '0 4px 6px -1px oklch(0.25 0.026 155 / 0.1), 0 2px 4px -1px oklch(0.25 0.026 155 / 0.06)',
  'lg': '0 10px 15px -3px oklch(0.25 0.026 155 / 0.1), 0 4px 6px -2px oklch(0.25 0.026 155 / 0.05)',
  'xl': '0 20px 25px -5px oklch(0.25 0.026 155 / 0.1), 0 10px 10px -5px oklch(0.25 0.026 155 / 0.04)',
  'inner': 'inset 0 2px 4px 0 oklch(0.25 0.026 155 / 0.06)',
}

// === TRANSITIONS ===

/**
 * Smooth, premium animations
 * Exponential easing for natural feel
 */

export const transitions = {
  duration: {
    'fast': '150ms',
    'base': '200ms',
    'slow': '300ms',
    'slower': '500ms',
  },

  easing: {
    'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'in': 'cubic-bezier(0.4, 0, 1, 1)',
    'out': 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// === Z-INDEX SCALE ===

/**
 * Predictable layering
 */

export const zIndex = {
  'hide': -1,
  'auto': 'auto',
  'base': 0,
  'dropdown': 1000,
  'sticky': 1100,
  'fixed': 1200,
  'modal-backdrop': 1300,
  'modal': 1400,
  'popover': 1500,
  'tooltip': 1600,
}

// === BREAKPOINTS ===

/**
 * Mobile-first responsive design
 */

export const breakpoints = {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Wide desktop
  '2xl': '1536px', // Extra wide desktop
}

// === COMPONENT TOKENS ===

/**
 * Reusable component styling
 */

export const components = {
  // Button styles
  button: {
    padding: {
      sm: `${spacing.sm} ${spacing.lg}`,
      md: `${spacing.md} ${spacing.xl}`,
      lg: `${spacing.lg} ${spacing['2xl']}`,
    },
    radius: borders.radius.md,
    fontWeight: typography.weights.semibold,
    transition: `all ${transitions.duration.base} ${transitions.easing.default}`,
  },

  // Card styles
  card: {
    padding: spacing.xl,
    radius: borders.radius.lg,
    background: colors.neutral[50],
    border: `1px solid ${colors.neutral[200]}`,
  },

  // Input styles
  input: {
    padding: `${spacing.md} ${spacing.lg}`,
    radius: borders.radius.md,
    border: `1px solid ${colors.neutral[300]}`,
    background: colors.neutral[50],
    transition: `all ${transitions.duration.fast} ${transitions.easing.default}`,
  },

  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

// === UTILITY CLASSES ===

/**
 * Commonly used utility combinations
 */

export const utilities = {
  // Text truncation
  'line-clamp': {
    1: 'overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1;',
    2: 'overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;',
    3: 'overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3;',
  },

  // Focus styles for accessibility
  'focus-ring': `outline: 2px solid ${colors.primary[500]}; outline-offset: 2px;`,

  // Visually hidden (accessible)
  'sr-only': `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  `,
}

// Export complete design system
export const designSystem = {
  typography,
  colors,
  spacing,
  borders,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  components,
  utilities,
}

export default designSystem