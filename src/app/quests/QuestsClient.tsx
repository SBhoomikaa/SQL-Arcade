'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { quests as defaultQuests } from '@/lib/quests';
import { getCustomQuests } from '@/lib/progress';
import type { Quest } from '@/lib/types/quests';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function QuestsClient() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');

  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- TEMPLATE SELECTION ---------- */
  const [selectedTemplate, setSelectedTemplate] =
    useState('medieval_kingdom');

  const fetchProgress = useCallback(async () => {
    const token = localStorage.getItem('authToken');

    const customQuests = getCustomQuests();
    setAllQuests([...defaultQuests, ...customQuests]);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.student) {
        const ids = data.student.completedQuests.map(
          (q: any) => q.questId
        );
        setCompletedQuests(ids);
      }
    } catch (error) {
      console.error('Failed to sync quests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
    window.addEventListener('progressUpdated', fetchProgress);
    return () => {
      window.removeEventListener('progressUpdated', fetchProgress);
    };
  }, [fetchProgress]);

  const filteredQuests = allQuests.filter((quest) => {
    const searchMatch = searchQuery
      ? quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const categoryMatch = categoryQuery
      ? quest.category === categoryQuery
      : true;

    return searchMatch && categoryMatch;
  });

  const getPageTitle = () => {
    if (categoryQuery) return `SQL Quests: ${categoryQuery}`;
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    return 'SQL Quests';
  };

  const getPageDescription = () => {
    if (categoryQuery) {
      return `Showing ${filteredQuests.length} quests in the "${categoryQuery}" category.`;
    }
    if (searchQuery) {
      return `Found ${filteredQuests.length} quests matching your search.`;
    }
    return 'Embark on quests to master SQL commands, constraints, and more.';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>

        {/* ---------- TEMPLATE DROPDOWN ---------- */}
        <div className="w-64">
          <Select
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SQL template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medieval_kingdom">
                Medieval Kingdom (Employees)
              </SelectItem>
              <SelectItem value="bachchan_vault">
                Bachchan Vault (Movies)
              </SelectItem>
              <SelectItem value="desi_traders">
                Desi Traders (Sales)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ---------- QUEST GRID ---------- */}
      {filteredQuests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id);

            const resolvedQuestId = `${quest.id}__${selectedTemplate}`;

            return (
              <Card
                key={quest.id}
                className={`flex flex-col ${
                  isCompleted ? 'bg-muted/50' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="flex items-center gap-2">
                      {isCompleted && (
                        <CheckCircle className="text-green-500" />
                      )}
                      {quest.title}
                    </CardTitle>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        variant={
                          quest.difficulty === 'Beginner'
                            ? 'secondary'
                            : quest.difficulty === 'Intermediate'
                            ? 'outline'
                            : 'default'
                        }
                      >
                        {quest.difficulty}
                      </Badge>

                      {quest.isCustom && (
                        <Badge variant="destructive">Custom</Badge>
                      )}
                      {isCompleted && (
                        <Badge
                          variant="default"
                          className="bg-green-600"
                        >
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{quest.category}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {quest.description}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={isCompleted ? 'secondary' : 'default'}
                  >
                    <Link href={`/quests/${resolvedQuestId}`}>
                      {isCompleted ? 'Retry Quest' : 'Start Quest'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold">No Quests Found</h3>
            <p className="text-muted-foreground mt-2">
              We couldn't find any quests matching your criteria.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/quests">View All Quests</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
