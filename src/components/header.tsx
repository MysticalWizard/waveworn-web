import { ModeToggle } from './mode-toggle';
import { Nav } from './nav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 flex justify-center md:px-4">
      <div className="flex items-center w-full max-w-screen-desktop">
        <Nav />
        <div className="flex items-center justify-end flex-1 space-x-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
