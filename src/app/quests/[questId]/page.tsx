
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { Loader2, Terminal, Sparkles, CheckCircle, XCircle, ArrowRight, Home } from 'lucide-react';
import { validateSQLQuery } from '@/ai/flows/validate-sql-query';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { quests as defaultQuests } from '@/lib/quests';
import type { Quest } from '@/lib/types/quests';
import { getCompletedQuests, completeQuest, getCustomQuests } from '@/lib/progress';
import { Badge } from '@/components/ui/badge';

type Feedback = {
  type: 'success' | 'error' | 'hint' | 'info';
  title: string;
  message: string;
};

type QueryResult = Record<string, any>[] | null;

const handleAIError = (error: any, toast: ReturnType<typeof useToast>['toast']) => {
    console.error('AI Error:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Convert the whole error to a string and check for keywords.
    const errorString = String(error).toLowerCase();
    
    if (errorString.includes('429') || errorString.includes('quota')) {
      errorMessage = 'The AI has exceeded its daily quota. Please try again tomorrow.';
    } else if (errorString.includes('503') || errorString.includes('overloaded')) {
      errorMessage = 'The AI model is currently overloaded. Please try again in a moment.';
    }
    
    toast({
      variant: 'destructive',
      title: 'AI Operation Failed',
      description: errorMessage,
    });
};

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;

  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Combine default quests with custom quests from localStorage
    const customQuests = getCustomQuests();
    const combinedQuests = [...defaultQuests, ...customQuests];
    setAllQuests(combinedQuests);

    if (!questId) {
      setIsLoading(false);
      return;
    }

    const currentQuest = combinedQuests.find(q => q.id === questId);
    
    if (currentQuest) {
      setQuest(currentQuest);
      setQuery(currentQuest.initialQuery);
      setFeedback({
        type: 'info',
        title: 'Your Mission!',
        message: 'Your query output or a helpful hint will appear here once you run your query.',
      });
      setQueryResult(null);
      
      const completed = getCompletedQuests();
      setIsCompleted(completed.includes(questId));

    } 
    setIsLoading(false);
  }, [questId]);


  const findNextQuest = (): Quest | null => {
    if (!quest) return null;

    const completed = getCompletedQuests();
    const questsInCategory = allQuests
        .filter(q => q.category === quest.category && !completed.includes(q.id) && q.id !== quest.id)
        .sort((a, b) => {
            const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
            return difficulties.indexOf(a.difficulty) - difficulties.indexOf(b.difficulty);
        });

    return questsInCategory.length > 0 ? questsInCategory[0] : null;
};

  const handleRunQuery = async () => {
    if (!quest) return;

    setIsSubmitting(true);
    setFeedback(null);
    setQueryResult(null);

    try {
      const response = await validateSQLQuery({
        userQuery: query,
        correctQuery: quest.correctQuery, // Pass the master query here
        questDescription: quest.longDescription,
      });

      if (response.isCorrect) {
        setFeedback({ type: 'success', title: 'Success!', message: response.feedback });
        setQueryResult(JSON.parse(response.simulatedResult || '[]'));
        if (!isCompleted) {
          completeQuest(quest.id);
          setIsCompleted(true);
        }
      } else {
        setFeedback({ type: 'error', title: "Not quite...", message: response.feedback });
        if (response.simulatedResult) setQueryResult(JSON.parse(response.simulatedResult));
      }
    } catch (error: any) {
       handleAIError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackIcon = () => {
    if (!feedback) return <Terminal className="h-4 w-4" />;
    switch (feedback.type) {
        case 'success': return <CheckCircle className="h-4 w-4" />;
        case 'error': return <XCircle className="h-4 w-4" />;
        case 'hint': return <Sparkles className="h-4 w-4" />;
        default: return <Terminal className="h-4 w-4" />;
    }
  }

  const getAlertVariant = () => {
    if (!feedback) return 'default';
    return feedback.type === 'success' ? 'default' : 'destructive';
  }
  
  const resultHeaders = queryResult && queryResult.length > 0 ? Object.keys(queryResult[0]) : [];
  const nextQuest = findNextQuest();


  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !quest ? (
        <Card>
          <CardHeader>
            <CardTitle>Quest Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The quest you are looking for does not exist or is no longer available. Please check the URL or go back to the quests page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="text-2xl font-semibold leading-none tracking-tight">Challenge: {quest.title}</div>
                  {isCompleted && <Badge>Completed</Badge>}
                </div>
                <CardDescription>{quest.longDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quest.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SQL Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-code text-sm border rounded-lg p-4 bg-muted/20">
                  <Textarea
                    placeholder="SELECT * FROM employees;"
                    className="bg-transparent border-0 focus-visible:ring-0 p-0 font-code"
                    rows={5}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRunQuery} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Run Query
                  </Button>
                  <Button variant="outline" onClick={() => setQuery(quest.initialQuery)} disabled={isSubmitting}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Alert variant={getAlertVariant()}>
                    {getFeedbackIcon()}
                    <AlertTitle>{feedback.title}</AlertTitle>
                    <AlertDescription>
                        {feedback.message}
                    </AlertDescription>
                     {feedback.type === 'success' && (
                        <div className="mt-4 flex gap-2">
                            {nextQuest && (
                                <Button asChild>
                                    <Link href={`/quests/${nextQuest.id}`}>
                                        Next Quest <ArrowRight className="ml-2"/>
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href="/">
                                    <Home className="mr-2" /> Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    )}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {queryResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Query Result</CardTitle>
                      <CardDescription>The output of your successful query.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {resultHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResult.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {resultHeaders.map(header => <TableCell key={header}>{String(row[header])}</TableCell>)}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2 space-y-6">
             {quest.schema.map((schemaItem, index) => (
              <Card key={`${schemaItem.tableName}-${index}`}>
                <CardHeader>
                  <CardTitle>Database Schema</CardTitle>
                  <CardDescription>Table: {schemaItem.tableName}</CardDescription>
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
                      {schemaItem.columns.map(col => (
                        <TableRow key={col.name}>
                          <TableCell className="font-medium">{col.name}</TableCell>
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
