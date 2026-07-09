import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from 'next/font/google';

import { GlobalSnowfall } from '@/components/GlobalSnowfall';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: "Satriabmnyu Tempest",
  description: "Portfolio of Satria Abimanyu Putra Wijayatama (Satriabmnyu) - Software Engineer, Full Stack Developer. Explore my projects, work experience, and technical skills.",
  keywords: [
    "Satria Abimanyu Putra Wijayatama",
    "Satriabmnyu",
    "Satria Abimanyu",
    "Software Engineer",
    "Full Stack Developer",
    "Web Developer",
    "Portfolio",
  ],
  authors: [{ name: "Satria Abimanyu Putra Wijayatama" }],
  creator: "Satria Abimanyu Putra Wijayatama",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://satriabmnyu.com",
    siteName: "Satria Abimanyu Portfolio",
    title: "Satriabmnyu || Full Stack Developer",
    description: "Portfolio of Satria Abimanyu Putra Wijayatama - Software Engineer & Full Stack Developer",
    images: [
      {
        url: "/Logo.png",
        width: 800,
        height: 800,
        alt: "Satriabmnyu Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Satriabmnyu || Full Stack Developer",
    description: "Portfolio of Satria Abimanyu Putra Wijayatama - Software Engineer & Full Stack Developer",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
      <body className="antialiased bg-black">
        <GlobalSnowfall />
        {children}
      </body>
    </html>
  );
}
