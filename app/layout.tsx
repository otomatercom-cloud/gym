import './globals.css';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui';

const GYM = process.env.NEXT_PUBLIC_APP_MODE === 'gym';
export const viewport = { themeColor: GYM ? '#11110F' : '#4f46e5' };

export const metadata = {
  title: GYM ? 'Gym Town · Gym Management' : 'Otomater · Sales & Project Lifecycle', description: GYM ? 'Members, attendance, training and billing' : 'Lead to delivery, in one place',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: GYM ? 'Gym Town' : 'Otomater', statusBarStyle: 'default' as const },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
