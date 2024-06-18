import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convene Tracker',
  description: 'Track your convene history.',
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
