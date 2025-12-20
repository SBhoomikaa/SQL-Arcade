
'use client';

import { MainLayout } from '@/components/layout/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Puzzle,
  FileText,
  BadgeCent,
  TrendingUp,
  BookOpenCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getCompletedQuests, getBadges, getCustomQuests } from '@/lib/progress';
import { quests as defaultQuests } from '@/lib/quests';
import type { Quest } from '@/lib/types/quests';

const getRank = (completedCount: number) => {
  if (completedCount >= 7) return 'Join Juggernaut';
  if (completedCount >= 5) return 'Key Master';
  if (completedCount >= 3) return 'Query Knight';
  if (completedCount >= 1) return 'Schema Squire';
  return 'Data Novice';
}

export default function Dashboard() {
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>(defaultQuests);
  const [badgesEarned, setBadgesEarned] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (typeof window !== 'undefined') {
        const completed = getCompletedQuests();
        const customQuests = getCustomQuests();
        // Sort all quests by difficulty to ensure a logical progression
        const combinedQuests = [...defaultQuests, ...customQuests].sort((a, b) => {
            const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
            return difficulties.indexOf(a.difficulty) - difficulties.indexOf(b.difficulty);
        });
        setAllQuests(combinedQuests);
        setCompletedQuests(completed);
        setBadgesEarned(getBadges());
      }
    };
    
    // Listen for progress updates from other pages
    window.addEventListener('progressUpdated', updateProgress);

    // Initial load
    updateProgress();

    // Cleanup
    return () => {
      window.removeEventListener('progressUpdated', updateProgress);
    };
  }, []);

  const calculateProgress = (category: string) => {
    const categoryQuests = allQuests.filter(q => q.category === category);
    if (categoryQuests.length === 0) return 0;
    const completedInCategory = categoryQuests.filter(q => completedQuests.includes(q.id));
    return Math.round((completedInCategory.length / categoryQuests.length) * 100);
  }

  const findNextQuest = (): Quest | null => {
    return allQuests.find(quest => !completedQuests.includes(quest.id)) || null;
  }

  const nextQuest = findNextQuest();

  const modules = [
    {
      title: 'SQL Basics Quests',
      description: 'Master the fundamental SQL commands.',
      icon: Database,
      progress: calculateProgress('SQL Basics'),
      href: '/quests?category=SQL+Basics',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      category: 'SQL Basics'
    },
    {
      title: 'Constraint Challenges',
      description: 'Learn about keys, uniqueness, and checks.',
      icon: FileText,
      progress: calculateProgress('Constraints'),
      href: '/quests?category=Constraints',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      category: 'Constraints'
    },
    {
      title: 'Normalization Puzzles',
      description: 'Organize data and eliminate anomalies.',
      icon: Puzzle,
      progress: 0, // Progress for puzzles is not tracked via quests
      href: '/normalization-puzzles',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      category: 'Puzzles'
    },
  ];

  const stats = [
    { title: 'Quests Completed', value: `${completedQuests.length} / ${allQuests.length}`, icon: BookOpenCheck },
    { title: 'Current Rank', value: getRank(completedQuests.length), icon: TrendingUp },
    { title: 'Badges Earned', value: badgesEarned.toString(), icon: BadgeCent },
  ];


  return (
    <MainLayout>
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Welcome back, {getRank(completedQuests.length)}!</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Ready to cure some sick databases? Your next challenge awaits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {nextQuest ? (
                <>
                  <div>
                    <h3 className="font-semibold">Next Up: {nextQuest.title}</h3>
                    <p className="text-sm text-primary-foreground/70">
                      {nextQuest.description}
                    </p>
                  </div>
                  <Button asChild variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shrink-0">
                    <Link href={`/quests/${nextQuest.id}`}>
                      Continue Quest
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Check className="text-accent" /> All Quests Completed!
                    </h3>
                    <p className="text-sm text-primary-foreground/70">
                      You are a true SQL Master. Create your own challenges in the Explore tab!
                    </p>
                  </div>
                  <Button asChild variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shrink-0">
                    <Link href="/quests">
                      Review Quests
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Card key={mod.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mod.bgColor} ${mod.color}`}>
                    <mod.icon className="h-6 w-6" />
                  </div>
                   <Badge variant={mod.progress > 0 ? 'default' : 'outline'}>
                    {mod.progress > 0 ? (mod.progress === 100 ? 'Completed' : 'In Progress') : 'Not Started'}
                   </Badge>
                </div>
              </CardHeader>
              <CardContent>
                 <Link href={mod.href}>
                  <h3 className="font-semibold hover:underline">{mod.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {mod.description}
                </p>
                {mod.category !== 'Puzzles' ? (
                  <>
                    <Progress value={mod.progress} className="mt-4 h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{mod.progress}% complete</p>
                  </>
                ) : (
                   <p className="text-xs text-muted-foreground mt-2 italic">Generate custom puzzles from your own data!</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
