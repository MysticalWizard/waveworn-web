'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const API_SERVER_URL = 'https://gmserver-api.aki-game2.net/gacha/record/query';
const CONVENE_TYPES = [
  'Featured Resonator',
  'Featured Weapon',
  'Standard Resonator',
  'Standard Weapon',
  'Beginner',
  "Beginner's Choice",
  'Giveback Custom',
];

interface GachaItem {
  qualityLevel: number;
  name: string;
  time: string;
  pity?: number;
}

interface StarFilters {
  [key: string]: boolean;
}

interface SummaryStats {
  totalPulls: number;
  totalAstrite: number;
  totalFiveStars: number;
  totalFourStars: number;
  avgFiveStarPity: number;
  avgFourStarPity: number;
}

const getButtonColor = (star: number, selected: boolean): string => {
  if (!selected) return '';
  const colors: Record<number, string> = {
    3: 'bg-blue-500 hover:bg-blue-500/90 dark:hover:bg-blue-500/90',
    4: 'bg-purple-500 hover:bg-purple-500/90 dark:hover:bg-purple-500/90',
    5: 'bg-yellow-500 hover:bg-yellow-500/90 dark:hover:bg-yellow-500/90',
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

export default function ConvenePage() {
  const [gachaData, setGachaData] = useState<GachaItem[][]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [starFilters, setStarFilters] = useState<Record<number, StarFilters>>(
    {},
  );
  const [expandedConveneRecord, setExpandedConveneRecord] = useState<
    Record<number, boolean>
  >({});
  const [hasLocalData, setHasLocalData] = useState(false);

  const fetchGachaData = useCallback(
    async (
      queryParams: Record<string, any>,
      cardPoolType: number,
    ): Promise<GachaItem[]> => {
      const response = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardPoolId: queryParams.resources_id,
          cardPoolType,
          languageCode: 'en',
          playerId: queryParams.player_id,
          recordId: queryParams.record_id,
          serverId: queryParams.svr_id,
        }),
      });
      const result = await response.json();
      return result.data;
    },
    [],
  );

  const fetchAllGachaData = useCallback(
    async (queryParams: Record<string, any>) => {
      setIsFetching(true);
      try {
        const data = await Promise.all(
          Array.from({ length: 6 }, (_, i) =>
            fetchGachaData(queryParams, i + 1),
          ),
        );
        setGachaData(data);
        setStarFilters(
          Object.fromEntries(
            data.map((_, index) => [
              index,
              { '3': false, '4': true, '5': true },
            ]),
          ),
        );
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
      fetchAllGachaData(JSON.parse(savedQueryParams));
      setHasLocalData(true);
    }
  }, [fetchAllGachaData]);

  const calculatePityCounts = useCallback(
    (
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
            fiveStarPity++;
            itemWithPity.pity = fiveStarPity;
            fiveStarPity = fourStarPity = 0;
          } else if (item.qualityLevel === 4) {
            fourStarPity++;
            itemWithPity.pity = fourStarPity;
            fourStarPity = 0;
            fiveStarPity++;
          } else {
            itemWithPity.pity = 1;
            fourStarPity++;
            fiveStarPity++;
          }
          return itemWithPity;
        })
        .reverse();
      return {
        items: itemsWithPity,
        pityCounts: { fiveStar: fiveStarPity, fourStar: fourStarPity },
      };
    },
    [],
  );

  const handleStarFilterChange = useCallback(
    (index: number, star: keyof StarFilters) => {
      setStarFilters((prev) => ({
        ...prev,
        [index]: { ...prev[index], [star]: !prev[index][star] },
      }));
    },
    [],
  );

  const handleExpandCollapse = useCallback((index: number) => {
    setExpandedConveneRecord((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const summaryStats = useMemo<SummaryStats>(() => {
    let totalPulls = 0,
      totalAstrite = 0,
      totalFiveStars = 0,
      totalFourStars = 0,
      fiveStarPitySum = 0,
      fourStarPitySum = 0;
    gachaData.forEach((poolData) => {
      const { items } = calculatePityCounts(poolData);
      totalPulls += items.length;
      totalAstrite += items.length * 160;
      const fiveStars = items.filter((item) => item.qualityLevel === 5);
      const fourStars = items.filter((item) => item.qualityLevel === 4);
      totalFiveStars += fiveStars.length;
      totalFourStars += fourStars.length;
      fiveStarPitySum += fiveStars.reduce(
        (sum, item) => sum + (item.pity ?? 0),
        0,
      );
      fourStarPitySum += fourStars.reduce(
        (sum, item) => sum + (item.pity ?? 0),
        0,
      );
    });
    return {
      totalPulls,
      totalAstrite,
      totalFiveStars,
      totalFourStars,
      avgFiveStarPity: totalFiveStars ? fiveStarPitySum / totalFiveStars : 0,
      avgFourStarPity: totalFourStars ? fourStarPitySum / totalFourStars : 0,
    };
  }, [gachaData, calculatePityCounts]);

  return (
    <div className="flex flex-col shrink">
      <div className="pb-4">
        <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
          Convene Counter
        </h1>
        <p>Track your convene history!</p>
      </div>
      <div className="space-x-4">
        <Button>
          <Link href="/convene/import">
            {hasLocalData ? 'Reimport Convenes' : 'Import Convenes'}
          </Link>
        </Button>
        <Button variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {gachaData.length > 0 ? (
        <div className="mt-4 md:mt-8">
          <h2 className="mb-2 text-xl font-bold md:text-2xl">Gacha Data</h2>
          <div className="grid grid-cols-1 gap-4 mb-4 grid-flow-dense sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard summaryStats={summaryStats} />
            {gachaData.map((poolData, index) => (
              <GachaCard
                key={`pool-type-${CONVENE_TYPES[index]}`}
                poolData={poolData}
                index={index}
                conveneType={CONVENE_TYPES[index]}
                starFilters={starFilters[index]}
                expandedConveneRecord={expandedConveneRecord[index]}
                onStarFilterChange={handleStarFilterChange}
                onExpandCollapse={handleExpandCollapse}
                calculatePityCounts={calculatePityCounts}
              />
            ))}
          </div>
          <div className="flex justify-center mt-4 md:mt-8">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variant="secondary"
            >
              Back to Top
            </Button>
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

interface SummaryCardProps {
  summaryStats: SummaryStats;
}

function SummaryCard({ summaryStats }: SummaryCardProps) {
  return (
    <Card className="col-span-1 sm:col-span-2 lg:col-span-3" id="summary">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          Summary of your pulls across all banners.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Total pulls: {summaryStats.totalPulls}</p>
        <p>Total astrite spent: {summaryStats.totalAstrite}</p>
        <p className={getTextColor(5)}>
          Total 5-star pulls: {summaryStats.totalFiveStars} (Avg pity:{' '}
          {summaryStats.avgFiveStarPity.toFixed(2)})
        </p>
        <p className={getTextColor(4)}>
          Total 4-star pulls: {summaryStats.totalFourStars} (Avg pity:{' '}
          {summaryStats.avgFourStarPity.toFixed(2)})
        </p>
      </CardContent>
    </Card>
  );
}

interface GachaCardProps {
  poolData: GachaItem[];
  index: number;
  conveneType: string;
  starFilters: StarFilters;
  expandedConveneRecord: boolean;
  onStarFilterChange: (index: number, star: keyof StarFilters) => void;
  onExpandCollapse: (index: number) => void;
  calculatePityCounts: (data: GachaItem[]) => {
    items: GachaItem[];
    pityCounts: { fiveStar: number; fourStar: number };
  };
}

function GachaCard({
  poolData,
  index,
  conveneType,
  starFilters,
  expandedConveneRecord,
  onStarFilterChange,
  onExpandCollapse,
  calculatePityCounts,
}: GachaCardProps) {
  const { items, pityCounts } = calculatePityCounts(poolData);
  const totalConveneCount = items.length;
  const totalAstriteSpent = totalConveneCount * 160;

  return (
    <Card key={`pool-type-${index}`} id={conveneType}>
      <CardHeader>
        <CardTitle>{conveneType}</CardTitle>
        <CardDescription>
          Pull details for {conveneType} convene.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Total pulls: {totalConveneCount} (Astrite: {totalAstriteSpent})
        </p>
        <p className={getTextColor(5)}>5-star pity: {pityCounts.fiveStar}</p>
        <p className={getTextColor(4)}>4-star pity: {pityCounts.fourStar}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={() => onExpandCollapse(index)}
          variant={expandedConveneRecord ? 'secondary' : 'default'}
          size="sm"
        >
          {expandedConveneRecord ? 'Collapse' : 'Expand'}
        </Button>
        {expandedConveneRecord && (
          <>
            <div className="flex my-4 space-x-2">
              {[5, 4, 3].map((star) => (
                <Button
                  key={star}
                  className={getButtonColor(star, starFilters[star.toString()])}
                  onClick={() => onStarFilterChange(index, star.toString())}
                  variant={
                    starFilters[star.toString()] ? 'default' : 'secondary'
                  }
                >
                  {star} Star
                </Button>
              ))}
            </div>
            <GachaTable items={items} starFilters={starFilters} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}

interface GachaTableProps {
  items: GachaItem[];
  starFilters: StarFilters;
}

function GachaTable({ items, starFilters }: GachaTableProps) {
  const filteredItems = items.filter(
    (item) => starFilters[item.qualityLevel.toString()],
  );
  const noFiltersSelected = !Object.values(starFilters).some(Boolean);

  return (
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
        {filteredItems.map((item, idx) => (
          <TableRow key={`gacha-item-${item.name}-${item.time}-${idx}`}>
            <TableCell
              className={`font-medium ${getTextColor(item.qualityLevel)}`}
            >
              {item.name}
            </TableCell>
            <TableCell>{item.time}</TableCell>
            <TableCell className="text-right">{item.pity ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
