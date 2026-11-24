import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: true,
});

const SITE_URL = 'https://satriabmnyu.com';

export const viewport: Viewport = {
  themeColor: '#09090B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Satria Abimanyu Portfolio',
  title: {
    default: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu) | Software Engineer & Full Stack Developer',
    template: '%s | Satria Abimanyu (Satriabmnyu)',
  },
  description:
    'Official portfolio of Satria Abimanyu Putra Wijayatama (Satria Abimanyu / Satriabmnyu), Software Engineer and Full Stack Web Developer. Explore selected projects, experience, certifications, web development services, and interactive studio.',
  keywords: [
    'Satria Abimanyu',
    'Satria Abimanyu Putra Wijayatama',
    'satriabmnyu',
    'Satriabmnyu',
    'Satria',
    'Satria Developer',
    'Satria Software Engineer',
    'Satria Full Stack Developer',
    'Software Engineer Indonesia',
    'Full Stack Developer',
    'Web Developer Portfolio',
    'Next.js Developer',
    'React Developer',
    'Jasa Pembuatan Website',
  ],
  authors: [{ name: 'Satria Abimanyu Putra Wijayatama', url: SITE_URL }],
  creator: 'Satria Abimanyu Putra Wijayatama',
  publisher: 'Satria Abimanyu Putra Wijayatama',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/satria-logo.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: ['/satria-logo.png'],
    apple: [{ url: '/satria-logo.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['id_ID'],
    url: SITE_URL,
    siteName: 'Satria Abimanyu (Satriabmnyu)',
    title: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu) | Software Engineer',
    description:
      'Portfolio of Satria Abimanyu Putra Wijayatama (Satriabmnyu). Software Engineer & Full Stack Developer building modern web applications.',
    images: [
      {
        url: '/IMG_4058.PNG',
        width: 1200,
        height: 630,
        alt: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu) Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@satriabmnyu',
    title: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu) | Software Engineer',
    description:
      'Official portfolio of Satria Abimanyu (Satriabmnyu), Software Engineer & Full Stack Web Developer.',
    images: ['/IMG_4058.PNG'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className="antialiased bg-[#09090B] text-zinc-100">{children}</body>
    </html>
  );
}
