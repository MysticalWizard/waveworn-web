'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

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
  const [starFilter, setStarFilter] = useState({
    '3': true,
    '4': true,
    '5': true,
  });

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
          cardPoolType,
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

  const getTextColor = (qualityLevel: number): string => {
    const colors: Record<number, string> = {
      1: 'text-gray-400',
      2: 'text-green-400',
      3: 'text-blue-400',
      4: 'text-purple-400',
      5: 'text-yellow-400',
    };
    return colors[qualityLevel] || 'text-gray-200';
  };

  const calculatePityCounts = (
    data: GachaItem[],
  ): {
    items: GachaItem[];
    pityCounts: { fiveStar: number; fourStar: number };
  } => {
    let fiveStarPity = 0;
    let fourStarPity = 0;

    const itemsWithPity = data
      .slice()
      .reverse()
      .map((item) => {
        const itemWithPity = { ...item, pity: item.pity ?? 0 };

        if (item.qualityLevel === 5) {
          itemWithPity.pity = fiveStarPity;
          fiveStarPity = 0;
          fourStarPity = 0;
        } else if (item.qualityLevel === 4) {
          itemWithPity.pity = fourStarPity;
          fourStarPity = 0;
          fiveStarPity++;
        } else {
          itemWithPity.pity = 0; // 3-star pity is always 0
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

  const handleStarFilterChange = (star: keyof typeof starFilter) => {
    if (
      Object.values(starFilter).filter(Boolean).length === 1 &&
      starFilter[star]
    ) {
      return; // Prevent all filters from being disabled
    }
    setStarFilter((prevFilter) => ({
      ...prevFilter,
      [star]: !prevFilter[star],
    }));
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
                key={`pool-type-${index}`}
                onClick={() => setSelectedDataIndex(index)}
                variant={selectedDataIndex === index ? 'default' : 'secondary'}
              >
                Card Pool Type {index + 1}
              </Button>
            ))}
          </div>
          <div className="flex mb-4 space-x-2">
            <div className="flex flex-col">
              <div>Current pity counts: </div>
              <div>
                5-star:{' '}
                {
                  calculatePityCounts(gachaData[selectedDataIndex]).pityCounts
                    .fiveStar
                }
              </div>
              <div>
                4-star:{' '}
                {
                  calculatePityCounts(gachaData[selectedDataIndex]).pityCounts
                    .fourStar
                }
              </div>
            </div>
          </div>
          <div className="flex mb-4 space-x-2">
            <Button
              onClick={() => handleStarFilterChange('5')}
              variant={starFilter['5'] ? 'default' : 'secondary'}
            >
              5 Star
            </Button>
            <Button
              onClick={() => handleStarFilterChange('4')}
              variant={starFilter['4'] ? 'default' : 'secondary'}
            >
              4 Star
            </Button>
            <Button
              onClick={() => handleStarFilterChange('3')}
              variant={starFilter['3'] ? 'default' : 'secondary'}
            >
              3 Star
            </Button>
          </div>
          <Table>
            <TableCaption>A list of your gacha data.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Pity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatePityCounts(gachaData[selectedDataIndex])
                .items.filter(
                  (item) =>
                    starFilter[
                      item.qualityLevel.toString() as keyof typeof starFilter
                    ],
                )
                .map((item, idx) => (
                  <TableRow key={`gacha-item-${item.name}-${item.time}-${idx}`}>
                    <TableCell
                      className={`font-medium ${getTextColor(item.qualityLevel)}`}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell className="text-right">
                      {(item.pity ?? 0) + 1}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : isFetching ? (
        <p>Loading Gacha data...</p>
      ) : (
        <p>No Gacha data found. Please import your data first.</p>
      )}
    </div>
  );
}
