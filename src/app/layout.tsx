import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Patel Networks | Commercial CCTV, Surveillance & Networking Hardware',
  description:
    'Authorized Indian supplier for CP Plus, Hikvision, Dahua, and D-Link surveillance cameras, AI DVRs, 24/7 hard drives, and networking hardware with B2B GST tax invoicing.',
  openGraph: {
    title: 'Patel Networks | Commercial CCTV, Surveillance & Networking Hardware',
    description:
      'Authorized Indian supplier for CP Plus, Hikvision, Dahua, and D-Link surveillance cameras, AI DVRs, 24/7 hard drives, and networking hardware with B2B GST tax invoicing.',
    siteName: 'Patel Networks',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <WhatsAppSupportWidget />
      </body>
    </html>
  );
}
