import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex border-t bg-background">
      <div className="p-4">
        <span className="text-xs sm:text-sm text-muted-foreground">
          <div>
            &copy; {currentYear}{' '}
            <Link href="/" className="transition-all hover:text-primary">
              {siteConfig.name}
            </Link>{' '}
            by{' '}
            <Link
              href={siteConfig.links.github}
              className="transition-all hover:text-primary"
            >
              MysticalWizard
            </Link>
          </div>
          <div>
            This site is not affiliated with or endorsed by{' '}
            <Link
              href="https://kurogames.com/"
              className="transition-all hover:text-primary"
            >
              Guangzhou Kuro Technology Co., Ltd.
            </Link>
          </div>
          <div>
            <Link
              href="https://wutheringwaves.kurogames.com/"
              className="transition-all hover:text-primary"
            >
              Wuthering Waves
            </Link>
            , along with all associated game content and materials, are
            trademarks and copyrights owned by{' '}
            <Link
              href="https://kurogames.com/"
              className="transition-all hover:text-primary"
            >
              Guangzhou Kuro Technology Co., Ltd.
            </Link>
          </div>
        </span>
      </div>
    </footer>
  );
}
