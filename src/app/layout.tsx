import type { Metadata, Viewport } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { QuickAdd } from '@/components/QuickAdd';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TA Auto — Content',
  description: 'Content planning and production for TA Auto.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body>
        <Nav />
        {/* pb clears the fixed mobile nav and the floating quick-add. */}
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 sm:pb-16">
          {children}
        </main>
        <QuickAdd />
      </body>
    </html>
  );
}
