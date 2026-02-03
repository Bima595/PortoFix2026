import type { Metadata } from "next";
import "./globals.css";

import { GlobalSnowfall } from '@/components/GlobalSnowfall';

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://satriabmnyu.com",
    siteName: "Satria Abimanyu Portfolio",
    title: "Satriabmnyu || Full Stack Developer",
    description: "Portfolio of Satria Abimanyu Putra Wijayatama - Software Engineer & Full Stack Developer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satriabmnyu || Full Stack Developer",
    description: "Portfolio of Satria Abimanyu Putra Wijayatama - Software Engineer & Full Stack Developer",
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
    <html lang="en" className="dark">
      <body className="antialiased bg-black">
        <GlobalSnowfall />
        {children}
      </body>
    </html>
  );
}
