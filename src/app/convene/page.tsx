'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [gachaData, setGachaData] = useState<any[]>([]);
  const [selectedDataIndex, setSelectedDataIndex] = useState<number>(0);

  useEffect(() => {
    const savedGachaData = localStorage.getItem('gachaData');
    if (savedGachaData) {
      setGachaData(JSON.parse(savedGachaData));
    }
  }, []);

  return (
    <div className="flex flex-col shrink">
      <div className="pb-4">
        <h1 className="text-4xl font-extrabold scroll-m-20">Convene Tracker</h1>
        <p>Track your convene history!</p>
      </div>
      <div className="space-x-4">
        <Button>
          <Link href="/convene/import">Import Convenes</Link>
        </Button>
        <Button variant={'secondary'}>
          <Link href="/">Home</Link>
        </Button>
      </div>
      {gachaData.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Gacha Data</h2>
          <div className="flex mb-4 space-x-2">
            {gachaData.map((data, index) => (
              <Button
                key={data.cardPoolId} // Use a unique identifier as key
                onClick={() => setSelectedDataIndex(index)}
                variant={selectedDataIndex === index ? 'default' : 'secondary'}
              >
                Card Pool Type {index + 1}
              </Button>
            ))}
          </div>
          <ul className="list-disc list-inside">
            {Object.entries(gachaData[selectedDataIndex]).map(
              ([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : (
        <p>No Gacha data found. Please import your data first.</p>
      )}
    </div>
  );
}
