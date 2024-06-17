import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import Convenes',
  description: 'Import your convene history from Wuthering Waves.',
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
