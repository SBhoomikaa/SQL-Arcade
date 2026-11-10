/*
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  Home,
  Database,
  Puzzle,
  FileUp,
  Sparkles,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/quests', label: 'SQL Quests', icon: Database },
  { href: '/normalization-puzzles', label: 'Normalization Puzzles', icon: Puzzle },
  { href: '/ai-tools', label: 'AI Tools', icon: Sparkles }
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold">SQL ARcade</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Help">
            <HelpCircle />
            <span>Help</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuButton size="lg" className="justify-start gap-2 px-2">
          <Avatar className="size-8">
            <AvatarImage src="https://picsum.photos/seed/avatar/40/40" />
            <AvatarFallback>DB</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-medium">DB Master</span>
            <span className="text-xs text-sidebar-foreground/70">
              Key Master
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
*/

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  Home,
  Database,
  Puzzle,
  Sparkles,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/quests', label: 'SQL Quests', icon: Database },
  { href: '/normalization-puzzles', label: 'Normalization Puzzles', icon: Puzzle },
  { href: '/ai-tools', label: 'AI Tools', icon: Sparkles }
];

type UserProfile = {
  name: string;
  completedQuestCount: number;
};

function getRank(completedCount: number) {
  if (completedCount >= 7) return 'Join Juggernaut';
  if (completedCount >= 5) return 'Key Master';
  if (completedCount >= 3) return 'Query Knight';
  if (completedCount >= 1) return 'Schema Squire';
  return 'Novice';
}

export function MainSidebar() {
  const pathname = usePathname();

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    completedQuestCount: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/student/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }

        const data = await response.json();
        const student = data.student;

        setProfile({
          name: student.name,
          completedQuestCount: student.completedQuests.length,
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }

    loadProfile();
  }, []);

  const rank = getRank(profile.completedQuestCount);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold">SQL ARcade</h1>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Help">
            <HelpCircle />
            <span>Help</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuButton size="lg" className="justify-start gap-2 px-2">
          <Avatar className="size-8">
            <AvatarImage src="https://picsum.photos/seed/avatar/40/40" />
            <AvatarFallback>
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start min-w-0">
            <span className="font-medium truncate">
              {profile.name || 'Loading...'}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {rank}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
