'use client';

import { useState, useEffect,useRef } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Sparkles,
  ArrowRight,
  Home,
  Eye,
} from 'lucide-react';
import { validateSQLQuery } from '@/ai/flows/validate-sql-query';
import { generateQuestFromTemplate } from '@/ai/flows/quest_generation';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { quests as defaultQuests } from '@/lib/quests';
import { getCompletedQuests, completeQuest } from '@/lib/progress';
import { Badge } from '@/components/ui/badge';

const SCHEMAS: Record<
  string,
  {
    table: string;
    columns: { name: string; type: string }[];
  }[]
> = {
  medieval_kingdom: [
    {
      table: 'DEPARTMENT',
      columns: [
        { name: 'Dnumber', type: 'INT' },
        { name: 'Dname', type: 'VARCHAR(50)' },
        { name: 'Mgr_ssn', type: 'CHAR(9)' },
        { name: 'Mgr_start_date', type: 'DATE' },
      ],
    },
    {
      table: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Ssn', type: 'CHAR(9)' },
        { name: 'Sex', type: 'CHAR(1)' },
        { name: 'Salary', type: 'INT' },
        { name: 'Super_ssn', type: 'CHAR(9)' },
        { name: 'Dno', type: 'INT' },
      ],
    },
    {
      table: 'PROJECT',
      columns: [
        { name: 'Pnumber', type: 'INT' },
        { name: 'Pname', type: 'VARCHAR(50)' },
        { name: 'Plocation', type: 'VARCHAR(50)' },
        { name: 'Dnum', type: 'INT' },
      ],
    },
    {
      table: 'WORKS_ON',
      columns: [
        { name: 'Essn', type: 'CHAR(9)' },
        { name: 'Pno', type: 'INT' },
        { name: 'Hours', type: 'DECIMAL(4,1)' },
      ],
    },
  ],

  bachchan_vault: [
    {
      table: 'ACTOR',
      columns: [
        { name: 'Act_id', type: 'INT' },
        { name: 'Act_Name', type: 'VARCHAR(50)' },
        { name: 'Act_Gender', type: 'CHAR(1)' },
      ],
    },
    {
      table: 'DIRECTOR',
      columns: [
        { name: 'Dir_id', type: 'INT' },
        { name: 'Dir_Name', type: 'VARCHAR(50)' },
        { name: 'Dir_Phone', type: 'VARCHAR(15)' },
      ],
    },
    {
      table: 'MOVIES',
      columns: [
        { name: 'Mov_id', type: 'INT' },
        { name: 'Mov_Title', type: 'VARCHAR(100)' },
        { name: 'Mov_Year', type: 'INT' },
        { name: 'Mov_Lang', type: 'VARCHAR(20)' },
        { name: 'Dir_id', type: 'INT' },
      ],
    },
    {
      table: 'MOVIE_CAST',
      columns: [
        { name: 'Act_id', type: 'INT' },
        { name: 'Mov_id', type: 'INT' },
        { name: 'Role', type: 'VARCHAR(50)' },
      ],
    },
    {
      table: 'RATING',
      columns: [
        { name: 'Mov_id', type: 'INT' },
        { name: 'Rev_Stars', type: 'INT' },
      ],
    },
  ],

  desi_traders: [
    {
      table: 'SALESMAN',
      columns: [
        { name: 'Salesman_id', type: 'INT' },
        { name: 'Name', type: 'VARCHAR(50)' },
        { name: 'City', type: 'VARCHAR(50)' },
        { name: 'Commission', type: 'DECIMAL(5,2)' },
      ],
    },
    {
      table: 'CUSTOMER',
      columns: [
        { name: 'Customer_id', type: 'INT' },
        { name: 'Cust_Name', type: 'VARCHAR(50)' },
        { name: 'City', type: 'VARCHAR(50)' },
        { name: 'Grade', type: 'INT' },
        { name: 'Salesman_id', type: 'INT' },
      ],
    },
    {
      table: 'ORDERS',
      columns: [
        { name: 'Ord_No', type: 'INT' },
        { name: 'Purchase_Amt', type: 'DECIMAL(10,2)' },
        { name: 'Ord_Date', type: 'DATE' },
        { name: 'Customer_id', type: 'INT' },
        { name: 'Salesman_id', type: 'INT' },
      ],
    },
  ],
};

interface QuestClientProps {
  questId: string;
}

export default function QuestClient({ questId }: QuestClientProps) {
  // ✅ split quest + template from URL
  const [baseQuestId, templateKey = 'medieval_kingdom'] = questId.split('__');

  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [quest, setQuest] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Make sure to add this ref at the top of your component (outside the useEffect)
const hasFetched = useRef(false);

useEffect(() => {
  setMounted(true);
  
  const loadQuest = async () => {
    // 1. Strict Mode Guard: Prevent parallel triggers
    if (hasFetched.current) return;
    
    const baseQuest = defaultQuests.find(q => q.id === baseQuestId);
    if (!baseQuest) {
      setIsLoading(false);
      return;
    }

    // 2. Cache Key: Unique to this quest and template
    const cacheKey = `sql_quest_${baseQuestId}_${templateKey}`;

    try {
      // 3. Check Cache
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setQuest(JSON.parse(cached));
        setIsLoading(false);
        hasFetched.current = true; // Mark as done so it doesn't try again
        return;
      }

      // If no cache, mark as fetching to block the second Strict Mode call
      hasFetched.current = true;

      // ✅ AI generation uses TEMPLATE FROM URL
      const generated = await generateQuestFromTemplate({
        title: baseQuest.title,
        shortDescription: baseQuest.description,
        difficulty: baseQuest.difficulty,
        template: templateKey,
      });

      const fullQuestData = {
        ...baseQuest,
        longDescription: generated.longDescription,
        correctQuery: generated.correctQuery,
        initialQuery: '',
      };

      // 4. Save to Cache
      sessionStorage.setItem(cacheKey, JSON.stringify(fullQuestData));

      setQuest(fullQuestData);

      setQuery('');
      setFeedback({
        type: 'info',
        title: 'Your Mission!',
        message:
          'Your query output or a helpful hint will appear here once you run your query.',
      });

      const completed = getCompletedQuests();
      setIsCompleted(completed.includes(baseQuestId));
    } catch (err) {
      // Reset ref on error so user can try again
      hasFetched.current = false;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate quest.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadQuest();
}, [baseQuestId, templateKey, toast]);

  if (!mounted) return null;

  const handleRunQuery = async () => {
    if (!quest) return;
    setIsSubmitting(true);
    setFeedback(null);
    setQueryResult(null);

    try {
      let sandboxId = localStorage.getItem('userSandboxId');
      if (!sandboxId) {
        sandboxId = `sandbox-${Date.now()}`;
        localStorage.setItem('userSandboxId', sandboxId);
      }

      const response = await validateSQLQuery({
        sandboxId,
        userQuery: query,
        correctQuery: quest.correctQuery,
        questDescription: quest.longDescription,
      });

      setQueryResult(JSON.parse(response.simulatedResult || '[]'));
      setFeedback({
        type: response.isCorrect ? 'success' : 'error',
        title: response.isCorrect ? 'Success!' : 'Not quite right...',
        message: response.feedback,
      });

      if (response.isCorrect && !isCompleted) {
        completeQuest(quest.id);
        setIsCompleted(true);

        await fetch('/api/student/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questId: quest.id,
            questTitle: quest.title,
            difficulty: quest.difficulty,
          }),
        }).catch(() => {});
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to execute query.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuest = defaultQuests.find(
    q =>
      q.category === quest?.category &&
      q.id !== quest?.id &&
      !getCompletedQuests().includes(q.id)
  );

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      ) : !quest ? (
        <Card>
          <CardHeader>
            <CardTitle>Quest Not Found</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Challenge: {quest.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {quest.longDescription}
                  </CardDescription>
                </div>
                {isCompleted && (
                  <Badge className="bg-green-500">Completed</Badge>
                )}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SQL Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="-- Write your SQL query here..."
                  className="font-mono bg-muted/20 min-h-[150px]"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleRunQuery} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Run Query
                  </Button>
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Reset
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setQuery(quest.correctQuery)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Show Answer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert
                    variant={feedback.type === 'error' ? 'destructive' : 'default'}
                  >
                    <AlertTitle>{feedback.title}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>

                    {feedback.type === 'success' && (
                      <div className="mt-4 flex gap-2">
                        {nextQuest && (
                          <Button asChild size="sm">
                            <Link href={`/quests/${nextQuest.id}__${templateKey}`}>
                              Next Quest <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                      </div>
                    )}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {queryResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Query Result</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {queryResult.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(queryResult[0]).map(h => (
                            <TableHead key={h}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResult.map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((v: any, j) => (
                              <TableCell key={j}>{String(v)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No rows returned.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          {/* RIGHT COLUMN: DATABASE SCHEMA */}
<div className="lg:col-span-2 space-y-6">
  {(SCHEMAS[templateKey] || []).map(schema => (
    <Card key={schema.table}>
      <CardHeader>
        <CardTitle>Database Schema</CardTitle>
        <CardDescription>{schema.table}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.columns.map(col => (
              <TableRow key={col.name}>
                <TableCell className="font-medium">
                  {col.name}
                </TableCell>
                <TableCell>{col.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ))}
</div>

        </div>
        
      )}
    </MainLayout>
  );
}
