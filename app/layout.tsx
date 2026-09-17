import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';
import { SiteHeader } from '@/components/SiteHeader';
import { LeftSidebar } from '@/components/LeftSidebar';

export const metadata: Metadata = {
  title: 'Competitive Vibing',
  description:
    'Explain your algorithm in plain English and get an interviewer’s verdict: correctness, edge cases, complexity, and the follow-up questions a real interview would ask.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans">
        <SiteHeader />
        <div className="mx-auto flex max-w-[1440px]">
          <LeftSidebar />
          <main className="min-w-0 flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
