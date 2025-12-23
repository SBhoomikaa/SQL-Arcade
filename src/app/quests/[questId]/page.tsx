'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

type Feedback = {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

export default function QuestPage() {
  const params = useParams();
  const questId = params.questId as string;
  const { toast } = useToast();

  const [quest, setQuest] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load Quest Data
  useEffect(() => {
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

  const findNextQuest = () => {
    if (!quest) return null;
    const completed = getCompletedQuests();
    const questsInCategory = defaultQuests
      .filter(q => q.category === quest.category && !completed.includes(q.id) && q.id !== quest.id)
      .sort((a, b) => {
        const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        return difficulties.indexOf(a.difficulty) - difficulties.indexOf(b.difficulty);
      });
    return questsInCategory.length > 0 ? questsInCategory[0] : null;
  };

  const handleShowAnswer = () => {
    if (!quest) return;
    if (query === quest.correctQuery) {
      setQuery('');
    } else {
      setQuery(quest.correctQuery);
    }
  };

  const handleRunQuery = async () => {
    if (!quest) return;
    setIsSubmitting(true);
    setFeedback(null);
    setQueryResult(null);

    try {
      // Generate or retrieve sandboxId from localStorage
      let sandboxId = localStorage.getItem('userSandboxId');
      if (!sandboxId) {
        sandboxId = `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        title: response.isCorrect ? 'Success!' : "That's not quite right. Here's a hint:",
        message: response.feedback
      });

      if (response.isCorrect && !isCompleted) {
        completeQuest(quest.id);
        setIsCompleted(true);
      }
    } catch (error: any) {
      console.error('Query execution error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Failed to execute query.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackIcon = () => {
    if (!feedback) return <Terminal className="h-4 w-4" />;
    switch (feedback.type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    if (!feedback) return 'default';
    return feedback.type === 'success' ? 'default' : 'destructive';
  };

  const resultHeaders = queryResult && Array.isArray(queryResult) && queryResult.length > 0 ? Object.keys(queryResult[0]) : [];
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
                    placeholder="-- Write your SQL query here..."
                    className="bg-transparent border-0 focus-visible:ring-0 p-0 font-code"
                    rows={5}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleRunQuery} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Run Query
                  </Button>
                  <Button variant="outline" onClick={() => setQuery(quest.initialQuery)} disabled={isSubmitting}>
                    Reset
                  </Button>
                  <Button variant="secondary" onClick={handleShowAnswer} disabled={isSubmitting}>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Answer
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
                      <CardDescription>The output of your query.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(queryResult) && queryResult.length > 0 ? (
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
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          Query executed successfully. No rows returned.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>DEPARTMENT</CardDescription>
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
                    <TableRow>
                      <TableCell className="font-medium">Dnumber</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dname</TableCell>
                      <TableCell>VARCHAR(50)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mgr_ssn</TableCell>
                      <TableCell>CHAR(9)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mgr_start_date</TableCell>
                      <TableCell>DATE</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>EMPLOYEES</CardDescription>
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
                    <TableRow>
                      <TableCell className="font-medium">Fname</TableCell>
                      <TableCell>VARCHAR(20)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lname</TableCell>
                      <TableCell>VARCHAR(20)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Ssn</TableCell>
                      <TableCell>CHAR(9)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sex</TableCell>
                      <TableCell>CHAR(1)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Salary</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Super_ssn</TableCell>
                      <TableCell>CHAR(9)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dno</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>PROJECT</CardDescription>
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
                    <TableRow>
                      <TableCell className="font-medium">Pnumber</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Pname</TableCell>
                      <TableCell>VARCHAR(50)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Plocation</TableCell>
                      <TableCell>VARCHAR(50)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dnum</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>WORKS_ON</CardDescription>
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
                    <TableRow>
                      <TableCell className="font-medium">Essn</TableCell>
                      <TableCell>CHAR(9)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Pno</TableCell>
                      <TableCell>INT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hours</TableCell>
                      <TableCell>DECIMAL(4,1)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  );
}