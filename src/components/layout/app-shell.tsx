
'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './main-layout';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isExcluded =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/teacher');

  if (isExcluded) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
