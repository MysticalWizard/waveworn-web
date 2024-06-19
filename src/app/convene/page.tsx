'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const API_SERVER_URL = 'https://gmserver-api.aki-game2.net/gacha/record/query';

interface QueryParams {
  [key: string]: any;
}

interface GachaItem {
  qualityLevel: number;
  name: string;
  time: string;
  pity?: number;
}

export default function Page() {
  const [gachaData, setGachaData] = useState<GachaItem[][]>([]);
  const [selectedDataIndex, setSelectedDataIndex] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchGachaData = useCallback(
    async (
      queryParams: QueryParams,
      cardPoolType: number,
    ): Promise<GachaItem[]> => {
      const response = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardPoolId: queryParams['resources_id'],
          cardPoolType: cardPoolType,
          languageCode: 'en',
          playerId: queryParams['player_id'],
          recordId: queryParams['record_id'],
          serverId: queryParams['svr_id'],
        }),
      });

      const result = await response.json();
      return result.data;
    },
    [],
  );

  const fetchAllGachaData = useCallback(
    async (queryParams: QueryParams) => {
      setIsFetching(true);
      try {
        const fetchPromises = Array.from({ length: 6 }, (_, i) =>
          fetchGachaData(queryParams, i + 1),
        );

        const data = await Promise.all(fetchPromises);
        setGachaData(data);
      } catch (error) {
        console.error(
          'An error occurred while fetching the gacha data:',
          error,
        );
      } finally {
        setIsFetching(false);
      }
    },
    [fetchGachaData],
  );

  useEffect(() => {
    const savedQueryParams = localStorage.getItem('gachaQueryParams');
    if (savedQueryParams) {
      const queryParams = JSON.parse(savedQueryParams);
      fetchAllGachaData(queryParams);
    }
  }, [fetchAllGachaData]);

  const getBorderColor = (qualityLevel: number): string => {
    const colors: Record<number, string> = {
      1: 'border-gray-400',
      2: 'border-green-400',
      3: 'border-blue-400',
      4: 'border-purple-400',
      5: 'border-yellow-400',
    };
    return colors[qualityLevel] || 'border-gray-200';
  };

  const calculatePityCounts = (
    data: GachaItem[],
  ): {
    items: GachaItem[];
    pityCounts: { fiveStar: number; fourStar: number };
  } => {
    let fiveStarPity = 1;
    let fourStarPity = 1;

    const itemsWithPity = data
      .slice()
      .reverse()
      .map((item) => {
        const itemWithPity = { ...item };

        if (item.qualityLevel === 5) {
          itemWithPity.pity = fiveStarPity;
          fiveStarPity = 1;
          fourStarPity = 1;
        } else if (item.qualityLevel === 4) {
          itemWithPity.pity = fourStarPity;
          fourStarPity = 1;
          fiveStarPity++;
        } else {
          itemWithPity.pity = 1; // 3-star pity is always 1
          fourStarPity++;
          fiveStarPity++;
        }

        return itemWithPity;
      })
      .reverse(); // Reverse back to original order

    return {
      items: itemsWithPity,
      pityCounts: { fiveStar: fiveStarPity, fourStar: fourStarPity },
    };
  };

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
        <Button variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {gachaData.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Gacha Data</h2>
          <div className="flex mb-4 space-x-2">
            {gachaData.map((_, index) => (
              <Button
                key={index}
                onClick={() => setSelectedDataIndex(index)}
                variant={selectedDataIndex === index ? 'default' : 'secondary'}
              >
                Card Pool Type {index + 1}
              </Button>
            ))}
          </div>
          <div className="space-y-4">
            {calculatePityCounts(gachaData[selectedDataIndex]).items.map(
              (item, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg ${getBorderColor(item.qualityLevel)}`}
                >
                  <div className="flex flex-row justify-between px-4 py-2">
                    <p className="pl-2 text-left">{item.name}</p>
                    <p className="pl-2 text-right">{item.time}</p>
                    <p className="flex-shrink-0 text-left">{item.pity}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ) : isFetching ? (
        <p>Loading Gacha data...</p>
      ) : (
        <p>No Gacha data found. Please import your data first.</p>
      )}
    </div>
  );
}
