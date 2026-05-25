import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3, JetBrains_Mono, VT323, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

// Font optimization with display swap strategy
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  preload: true,
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
  preload: false, // Lazy load monospace
})

const vt323 = VT323({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vt323',
  weight: '400',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-share-tech',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'International Association of Spreadsheet Enthusiasts | IASE',
  description: 'Celebrating the art and science of spreadsheet optimization since 1987. Comprehensive spreadsheet-powered solutions for every conceivable need.',
  keywords: ['spreadsheets', 'Excel', 'data analysis', 'financial planning', 'business intelligence', 'feline tax services', 'blood test preparation'],
  authors: [{ name: 'IASE' }],
  creator: 'International Association of Spreadsheet Enthusiasts',
  publisher: 'IASE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://iase.org'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://iase.org',
    title: 'International Association of Spreadsheet Enthusiasts | IASE',
    description: 'Celebrating the art and science of spreadsheet optimization since 1987.',
    siteName: 'IASE - International Association of Spreadsheet Enthusiasts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Association of Spreadsheet Enthusiasts | IASE',
    description: 'Celebrating the art and science of spreadsheet optimization since 1987.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${sourceSans.variable} ${jetBrainsMono.variable} ${vt323.variable} ${shareTechMono.variable}`}>
      <body className="antialiased">
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}