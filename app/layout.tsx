import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SP500 Insights - Daily Trading Intelligence for Smart Investors',
  description: 'Get AI-powered daily insights for S&P 500 stocks. Real-time predictions, analyst targets, and transparent forecasts to make informed trading decisions.',
  keywords: 'S&P 500, stock trading, investment insights, stock predictions, financial analysis, trading platform',
  authors: [{ name: 'SP500 Insights Team' }],
  creator: 'SP500 Insights',
  publisher: 'SP500 Insights',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sp500insights.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SP500 Insights - Daily Trading Intelligence',
    description: 'AI-powered daily insights for S&P 500 stocks with transparent predictions and analyst targets.',
    url: 'https://sp500insights.com',
    siteName: 'SP500 Insights',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SP500 Insights Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SP500 Insights - Daily Trading Intelligence',
    description: 'AI-powered daily insights for S&P 500 stocks with transparent predictions.',
    images: ['/og-image.png'],
    creator: '@sp500insights',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SP500 Insights" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased dark:bg-gray-900`}>
        <AppProvider>
          <Providers>
            <div className="min-h-full">
              {children}
            </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </Providers>
        </AppProvider>
      </body>
    </html>
  );
} 