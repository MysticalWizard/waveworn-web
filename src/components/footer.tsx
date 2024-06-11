import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex border-t bg-background">
      <div className="p-4">
        <span className="text-xs sm:text-sm text-muted-foreground">
          &copy; {currentYear}{' '}
          <Link href="/" className="transition-all hover:text-primary">
            Wuthering Waves Tools
          </Link>
        </span>
      </div>
    </footer>
  );
}
