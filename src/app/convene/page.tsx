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

  const getButtonColor = (star: number, selected: boolean): string => {
    if (!selected) return '';
    const colors: Record<number, string> = {
      3: 'bg-blue-400 hover:bg-blue-500',
      4: 'bg-purple-400 hover:bg-purple-500',
      5: 'bg-yellow-400 hover:bg-yellow-500',
    };
    return colors[star] || 'bg-gray-200';
  };

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
    setStarFilter((prevFilter) => ({
      ...prevFilter,
      [star]: !prevFilter[star],
    }));
  };

  const selectedGachaData = gachaData[selectedDataIndex];
  const totalConveneCount = selectedGachaData?.length || 0;
  const totalAsteriteSpent = totalConveneCount * 160;
  const noFiltersSelected = !Object.values(starFilter).some(Boolean);

  return (
    <div className="flex flex-col shrink">
      <div className="pb-4">
        <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
          Convene Tracker
        </h1>
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
          <h2 className="text-xl font-bold md:text-2xl">Gacha Data</h2>
          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <div>
                Total convene count: {totalConveneCount} (asterite x{' '}
                {totalAsteriteSpent})
              </div>
              <div>
                5-star:{' '}
                {calculatePityCounts(selectedGachaData).pityCounts.fiveStar}
              </div>
              <div>
                4-star:{' '}
                {calculatePityCounts(selectedGachaData).pityCounts.fourStar}
              </div>
            </div>
          </div>
          <div className="flex mb-4 space-x-2">
            <Button
              className={getButtonColor(5, starFilter['5'])}
              onClick={() => handleStarFilterChange('5')}
              variant={starFilter['5'] ? 'default' : 'secondary'}
            >
              5 Star
            </Button>
            <Button
              className={getButtonColor(4, starFilter['4'])}
              onClick={() => handleStarFilterChange('4')}
              variant={starFilter['4'] ? 'default' : 'secondary'}
            >
              4 Star
            </Button>
            <Button
              className={getButtonColor(3, starFilter['3'])}
              onClick={() => handleStarFilterChange('3')}
              variant={starFilter['3'] ? 'default' : 'secondary'}
            >
              3 Star
            </Button>
          </div>
          <Table>
            <TableCaption>
              {noFiltersSelected ? (
                <div className="text-red-500">
                  Please select at least one rarity filter.
                </div>
              ) : (
                'A list of your gacha data.'
              )}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Pity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatePityCounts(selectedGachaData)
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
