import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { PageHeader } from '@/components/page-header';
import { PageFooter } from '@/components/page-footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Wuthering Waves Tools',
    default: 'Wuthering Waves Tools',
  },
  description: 'Various tools for Wuthering Waves',
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
          <div id="root">
            <PageHeader />
            <main>{children}</main>
            <PageFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
