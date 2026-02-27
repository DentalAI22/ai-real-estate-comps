import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Real Estate Comps — True Sold Data, Not Listings',
    template: '%s | AI Real Estate Comps',
  },
  description:
    'Get accurate property valuations based on actual sold prices from county records — not listing data. AI-powered comp reports for homeowners, agents, investors, and lenders.',
  keywords: [
    'real estate comps',
    'comparable sales',
    'property valuation',
    'sold data',
    'home value',
    'CMA',
    'comp report',
    'county records',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://airealestatecomps.com',
    siteName: 'AI Real Estate Comps',
    title: 'AI Real Estate Comps — True Sold Data, Not Listings',
    description:
      'Property valuations based on actual sold prices from county records. Not Zestimates. Not listings. Real data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Real Estate Comps — True Sold Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Real Estate Comps — True Sold Data, Not Listings',
    description:
      'Property valuations based on actual sold prices from county records.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#c69c6d',
                secondary: '#fff',
              },
            },
          }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
