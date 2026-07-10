import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';
import { SiteHeader } from '@/components/SiteHeader';
import { LeftSidebar } from '@/components/LeftSidebar';
import { DotGrid } from '@/components/DotGrid';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Competitive Vibing — explain algorithms like you mean it',
  description:
    'Interview prep for the thinking part: explain your approach in plain English, get AI-graded verdicts, survive follow-up questions, and watch flawed ideas break on real counterexamples.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans">
        <DotGrid />
        <SiteHeader />
        <div className="mx-auto flex max-w-[1440px]">
          <LeftSidebar />
          <main className="min-w-0 flex-1 px-4 py-4 md:py-6 lg:pl-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
