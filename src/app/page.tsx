import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default function Home() {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
        Welcome to {siteConfig.title}!
      </h1>
      <p className="mt-4 text-md md:text-lg text-stone-500 dark:text-stone-400">
        This website is currently in development. Features may break or change.
        Please report bugs on{' '}
        <Link
          className="text-purple-700 dark:text-yellow-400 hover:underline font-medium"
          href={siteConfig.links.repo.web + '/issues'}
          target="_blank"
        >
          GitHub Issues
        </Link>
        .
      </p>
      <div className="mt-8 space-y-8">
        <div className="flex flex-col p-6 bg-white rounded-lg shadow-md dark:bg-neutral-800">
          <h2 className="text-2xl font-bold">Convene Counter</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Use this tool to track your convene history, analyze your pull data,
            and plan your future pulls more effectively.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/convene">Go to Convene Counter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
