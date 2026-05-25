import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'BLACKTIVISM OSINT',
    description: 'Covert geospatial intelligence platform — documentation suite',
    base: '/wiki/',

    appearance: 'dark',

    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
      ['meta', { name: 'theme-color', content: '#0a1628' }],
    ],

    themeConfig: {
      logo: { light: '/logo-dark.svg', dark: '/logo-dark.svg', alt: 'BLACKTIVISM' },

      nav: [
        { text: 'Getting Started', link: '/01-getting-started/overview' },
        { text: 'Deep Dive', link: '/02-deep-dive/architecture/' },
        {
          text: 'Onboarding',
          items: [
            { text: 'Contributor', link: '/onboarding/contributor' },
            { text: 'Staff Engineer', link: '/onboarding/staff-engineer' },
            { text: 'Executive', link: '/onboarding/executive' },
            { text: 'Product Manager', link: '/onboarding/product-manager' },
          ],
        },
      ],

      sidebar: [
        {
          text: '01 — Getting Started',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/01-getting-started/overview' },
            { text: 'Setup', link: '/01-getting-started/setup' },
            { text: 'Quick Reference', link: '/01-getting-started/quick-reference' },
          ],
        },
        {
          text: '02 — Deep Dive',
          collapsed: false,
          items: [
            { text: 'System Architecture', link: '/02-deep-dive/architecture/' },
            { text: 'Data Layer', link: '/02-deep-dive/data-layer/' },
            { text: 'Business Logic', link: '/02-deep-dive/business-logic/' },
            { text: 'Integrations', link: '/02-deep-dive/integrations/' },
            { text: 'Frontend', link: '/02-deep-dive/frontend/' },
          ],
        },
        {
          text: 'Onboarding Guides',
          collapsed: false,
          items: [
            { text: '👩‍💻 Contributor', link: '/onboarding/contributor' },
            { text: '🏗 Staff Engineer', link: '/onboarding/staff-engineer' },
            { text: '📊 Executive', link: '/onboarding/executive' },
            { text: '📋 Product Manager', link: '/onboarding/product-manager' },
          ],
        },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/AReid987/shadowbroker-deployment' },
      ],

      footer: {
        message: 'BLACKTIVISM OSINT v0.4',
        copyright: 'Internal documentation — not for public distribution',
      },

      search: {
        provider: 'local',
      },

      outline: {
        level: [2, 3],
        label: 'On this page',
      },
    },

    markdown: {
      theme: {
        light: 'github-dark',
        dark: 'github-dark',
      },
      lineNumbers: true,
    },

    // Mermaid dark theme config
    mermaid: {
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1e3a5f',
        primaryTextColor: '#e0e0e0',
        primaryBorderColor: '#4a9eed',
        lineColor: '#4a9eed',
        secondaryColor: '#0d2137',
        tertiaryColor: '#0a1628',
        background: '#0a1628',
        mainBkg: '#1e3a5f',
        nodeBorder: '#4a9eed',
        clusterBkg: '#0d2137',
        titleColor: '#e0e0e0',
        edgeLabelBackground: '#0d2137',
        fontFamily: 'JetBrains Mono, monospace',
      },
    },

    // Custom CSS for dark tactical aesthetic
    vite: {
      css: {
        preprocessorOptions: {
          css: {
            additionalData: `
              :root {
                --vp-c-brand-1: #4a9eed;
                --vp-c-brand-2: #1e3a5f;
                --vp-c-brand-3: #0d2137;
                --vp-font-family-base: 'JetBrains Mono', monospace;
                --vp-c-bg: #0a1628;
                --vp-c-bg-soft: #0d2137;
                --vp-c-bg-mute: #1e3a5f;
              }
            `,
          },
        },
      },
    },
  })
)
