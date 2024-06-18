'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function Nav({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLElement>>) {
  const [open, setOpen] = React.useState(false);

  const pathname = usePathname();
  const navItems = [{ href: '/convene', label: 'Convene Tracker' }];

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={cn(
          'hidden md:flex items-center space-x-4 lg:space-x-6 select-none',
          className,
        )}
        {...props}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="relative aspect-square">
            <Image src="/icon.png" width={32} height={32} alt="" />
          </div>
          <span>{siteConfig.title}</span>
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm transition-colors hover:text-primary',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through the application using the links below.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <SheetClose asChild>
              <Link
                href="/"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === '/' ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                Home
              </Link>
            </SheetClose>
            {navItems.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="relative aspect-square">
                  <Image src="/icon.png" width={32} height={32} alt="" />
                </div>
                <span>{siteConfig.title}</span>
              </Link>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
