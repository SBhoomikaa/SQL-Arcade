'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Terminal, Sparkles, CheckCircle, XCircle, ArrowRight, Home, Eye } from 'lucide-react';
import { validateSQLQuery } from '@/ai/flows/validate-sql-query';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { quests as defaultQuests } from '@/lib/quests';
import { getCompletedQuests, completeQuest } from '@/lib/progress';
import { Badge } from '@/components/ui/badge';

interface QuestClientProps {
  questId: string;
}

export default function QuestClient({ questId }: QuestClientProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [quest, setQuest] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentQuest = defaultQuests.find(q => q.id === questId);
    if (currentQuest) {
      setQuest(currentQuest);
      setQuery('');
      setFeedback({
        type: 'info',
        title: 'Your Mission!',
        message: 'Your query output or a helpful hint will appear here once you run your query.',
      });
      
      const completed = getCompletedQuests();
      setIsCompleted(completed.includes(questId));
    }
    setIsLoading(false);
  }, [questId]);

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
        title: response.isCorrect ? 'Success!' : "Not quite right...",
        message: response.feedback
      });

      if (response.isCorrect && !isCompleted) {
        completeQuest(quest.id);
        setIsCompleted(true);
        
        // MongoDB Performance tracking call
        await fetch('/api/student/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questId: quest.id,
            questTitle: quest.title,
            difficulty: quest.difficulty,
          }),
        }).catch(err => console.error("Performance log error:", err));
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to execute query.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuest = defaultQuests.find(q => 
    q.category === quest?.category && 
    q.id !== quest?.id && 
    !getCompletedQuests().includes(q.id)
  );

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
      ) : !quest ? (
        <Card><CardHeader><CardTitle>Quest Not Found</CardTitle></CardHeader></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Challenge: {quest.title}</CardTitle>
                  <CardDescription className="mt-2">{quest.longDescription}</CardDescription>
                </div>
                {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader><CardTitle>SQL Editor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="-- Write your SQL query here..."
                  className="font-mono bg-muted/20 min-h-[150px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleRunQuery} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Run Query
                  </Button>
                  <Button variant="outline" onClick={() => setQuery(quest.initialQuery)}>Reset</Button>
                  <Button variant="secondary" onClick={() => setQuery(quest.correctQuery)}>
                    <Eye className="mr-2 h-4 w-4" /> Show Answer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                    <AlertTitle>{feedback.title}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                    {feedback.type === 'success' && (
                      <div className="mt-4 flex gap-2">
                        {nextQuest && (
                          <Button asChild size="sm">
                            <Link href={`/quests/${nextQuest.id}`}>Next Quest <ArrowRight className="ml-2 h-4 w-4"/></Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href="/"><Home className="mr-2 h-4 w-4" /> Dashboard</Link>
                        </Button>
                      </div>
                    )}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {queryResult && (
              <Card>
                <CardHeader><CardTitle>Query Result</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  {queryResult.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(queryResult[0]).map(h => <TableHead key={h}>{h}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResult.map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((v: any, j) => <TableCell key={j}>{String(v)}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : <p className="text-muted-foreground text-center py-4">No rows returned.</p>}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
             {/* Simplified Schema Cards */}
             {['DEPARTMENT', 'EMPLOYEES', 'PROJECT', 'WORKS_ON'].map(table => (
               <Card key={table}>
                 <CardHeader className="py-3"><CardTitle className="text-sm">Table: {table}</CardTitle></CardHeader>
                 <CardContent className="py-0 pb-3">
                   <p className="text-xs text-muted-foreground">Check the documentation for column details.</p>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}