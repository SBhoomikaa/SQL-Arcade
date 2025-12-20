
'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

function toTitleCase(str: string) {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const pathSegments = pathname.split('/').filter(Boolean);
  const isDashboard = pathSegments.length === 0;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/quests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <nav className="hidden items-center gap-2 text-lg font-semibold md:flex">
          {isDashboard ? (
            <span className="text-foreground">Dashboard</span>
          ) : (
            <>
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
              {pathSegments.map((segment, index) => (
                <React.Fragment key={segment}>
                  <span className="text-muted-foreground/50">/</span>
                  <Link
                    href={`/${pathSegments.slice(0, index + 1).join('/')}`}
                    className={`${
                      index === pathSegments.length - 1
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    } transition-colors hover:text-foreground`}
                  >
                    {toTitleCase(segment.replace(/-/g, ' '))}
                  </Link>
                </React.Fragment>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="relative ml-auto flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lessons..."
            className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[320px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
