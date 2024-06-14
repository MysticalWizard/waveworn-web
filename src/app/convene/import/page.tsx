import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Import Convenes',
  description: 'Import your convene history from Wuthering Waves.',
};

export default function Page() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-4xl font-extrabold scroll-m-20">
          Import Convene History
        </h1>
        <p>Paste your convene history URL below.</p>
        <Input placeholder="Paste URL here" />
      </div>
      <div className="flex justify-between">
        <Button variant={'secondary'}>
          <Link href="/convene">Back</Link>
        </Button>
        <Button>Import</Button>
      </div>
    </div>
  );
}
