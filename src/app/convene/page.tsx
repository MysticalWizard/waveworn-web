import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Convene Tracker',
  description: 'Track your convene history.',
};

export default function Page() {
  return (
    <div className="flex flex-col shrink">
      <div className="pb-4">
        <h1 className="text-4xl font-extrabold scroll-m-20">Convene Tracker</h1>
        <p>Track your convene history!</p>
      </div>
      <div>
        <Button>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
