'use client';

import { useEffect, useState, useCallback } from 'react';
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

const conveneType = [
  'Featured Resonator',
  'Featured Weapon',
  'Standard Resonator',
  'Standard Weapon',
  'Beginner Convene',
  "Beginner's Choice",
  'Giveback Custom',
];

export default function Page() {
  const [gachaData, setGachaData] = useState<GachaItem[][]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [starFilters, setStarFilters] = useState<
    Record<number, Record<string, boolean>>
  >({});
  const [expandedConveneRecord, setExpandedConveneRecord] = useState<
    Record<number, boolean>
  >({});

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
        const initialFilters: Record<number, Record<string, boolean>> = {};
        data.forEach((_, index) => {
          initialFilters[index] = { '3': false, '4': true, '5': true };
        });
        setStarFilters(initialFilters);
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

        // Reset pity counter for the pulled item's rarity and all lower rarities
        if (item.qualityLevel === 5) {
          itemWithPity.pity = fiveStarPity;
          fiveStarPity = 0;
          fourStarPity = 0;
        } else if (item.qualityLevel === 4) {
          itemWithPity.pity = fourStarPity;
          fourStarPity = 0;
          fiveStarPity++;
        } else {
          itemWithPity.pity = 0;
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

  const handleStarFilterChange = (
    index: number,
    star: keyof Record<string, boolean>,
  ) => {
    setStarFilters((prevFilters) => ({
      ...prevFilters,
      [index]: {
        ...prevFilters[index],
        [star]: !prevFilters[index][star],
      },
    }));
  };

  const handleExpandCollapse = (index: number) => {
    setExpandedConveneRecord((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const noFiltersSelected = (index: number) =>
    !Object.values(starFilters[index]).some(Boolean);

  const calculateSummaryStats = () => {
    let totalPulls = 0;
    let totalAsterite = 0;
    let totalFiveStars = 0;
    let totalFourStars = 0;
    let fiveStarPitySum = 0;
    let fourStarPitySum = 0;

    gachaData.forEach((poolData) => {
      const { items } = calculatePityCounts(poolData);
      totalPulls += items.length;
      totalAsterite += items.length * 160;
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

    const avgFiveStarPity = totalFiveStars
      ? fiveStarPitySum / totalFiveStars
      : 0;
    const avgFourStarPity = totalFourStars
      ? fourStarPitySum / totalFourStars
      : 0;

    return {
      totalPulls,
      totalAsterite,
      totalFiveStars,
      totalFourStars,
      avgFiveStarPity,
      avgFourStarPity,
    };
  };

  const summaryStats = calculateSummaryStats();

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
          <Link href="/convene/import">Import Convenes</Link>
        </Button>
        <Button variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {gachaData.length > 0 ? (
        <div className="mt-4 md:mt-8">
          <h2 className="mb-2 text-xl font-bold md:text-2xl">Gacha Data</h2>
          <div className="grid grid-cols-1 gap-4 mb-4 grid-flow-dense sm:grid-cols-2 lg:grid-cols-3">
            <Card
              className="col-span-1 sm:col-span-2 lg:col-span-3"
              id="summary"
            >
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Summary of your pulls across all banners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Total pulls: {summaryStats.totalPulls}</p>
                <p>Total asterite spent: {summaryStats.totalAsterite}</p>
                <p>
                  Total 5-star pulls: {summaryStats.totalFiveStars} (Avg pity:{' '}
                  {summaryStats.avgFiveStarPity.toFixed(2)})
                </p>
                <p>
                  Total 4-star pulls: {summaryStats.totalFourStars} (Avg pity:{' '}
                  {summaryStats.avgFourStarPity.toFixed(2)})
                </p>
              </CardContent>
              {/* <CardFooter>
                <Button>Details</Button>
              </CardFooter> */}
            </Card>

            {gachaData.map((poolData, index) => {
              const { items, pityCounts } = calculatePityCounts(poolData);
              const totalConveneCount = items.length;
              const totalAsteriteSpent = totalConveneCount * 160;
              return (
                <Card key={`pool-type-${index}`} id={`pool-type-${index + 1}`}>
                  <CardHeader>
                    <CardTitle>{conveneType[index]}</CardTitle>
                    <CardDescription>
                      Pull details for {conveneType[index]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Total pulls: {totalConveneCount} (Asterite:{' '}
                      {totalAsteriteSpent})
                    </p>
                    <p>5-star pity: {pityCounts.fiveStar}</p>
                    <p>4-star pity: {pityCounts.fourStar}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button
                      onClick={() => handleExpandCollapse(index)}
                      variant={
                        expandedConveneRecord[index] ? 'secondary' : 'default'
                      }
                      size="sm"
                    >
                      {expandedConveneRecord[index] ? 'Collapse' : 'Expand'}
                    </Button>
                    {expandedConveneRecord[index] && (
                      <>
                        <div className="flex my-4 space-x-2">
                          <Button
                            className={getButtonColor(
                              5,
                              starFilters[index]['5'],
                            )}
                            onClick={() => handleStarFilterChange(index, '5')}
                            variant={
                              starFilters[index]['5'] ? 'default' : 'secondary'
                            }
                          >
                            5 Star
                          </Button>
                          <Button
                            className={getButtonColor(
                              4,
                              starFilters[index]['4'],
                            )}
                            onClick={() => handleStarFilterChange(index, '4')}
                            variant={
                              starFilters[index]['4'] ? 'default' : 'secondary'
                            }
                          >
                            4 Star
                          </Button>
                          <Button
                            className={getButtonColor(
                              3,
                              starFilters[index]['3'],
                            )}
                            onClick={() => handleStarFilterChange(index, '3')}
                            variant={
                              starFilters[index]['3'] ? 'default' : 'secondary'
                            }
                          >
                            3 Star
                          </Button>
                        </div>
                        <Table>
                          <TableCaption>
                            {noFiltersSelected(index) ? (
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
                            {items
                              .filter(
                                (item) =>
                                  starFilters[index][
                                    item.qualityLevel.toString() as keyof Record<
                                      string,
                                      boolean
                                    >
                                  ],
                              )
                              .map((item, idx) => (
                                <TableRow
                                  key={`gacha-item-${item.name}-${item.time}-${idx}`}
                                >
                                  <TableCell
                                    className={`font-medium ${getTextColor(
                                      item.qualityLevel,
                                    )}`}
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
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
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
