import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'AlgoExplain — practice explaining algorithms',
  description:
    'Explain your algorithm in plain English or pseudocode and get AI feedback on correctness, edge cases, and complexity — before you write a line of code.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-4 md:py-6">{children}</main>
      </body>
    </html>
  );
}
