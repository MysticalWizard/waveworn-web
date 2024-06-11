import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { PageHeader } from '@/components/page-header';
import { PageFooter } from '@/components/page-footer';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Wuthering Waves Tools',
    default: 'Wuthering Waves Tools',
  },
  description: 'Various tools for Wuthering Waves',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div
            id="root"
            className="relative flex min-h-screen flex-col bg-background"
          >
            <PageHeader />
            <main className="flex-1">{children}</main>
            <PageFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
