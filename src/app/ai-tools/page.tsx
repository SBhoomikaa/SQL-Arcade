
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { naturalLanguageToSQL } from '@/ai/flows/natural-language-to-sql';
import { useToast } from '@/hooks/use-toast';

const MOCK_SCHEMA = `CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  role VARCHAR(255),
  salary INT,
  department_id INT
);

CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(255)
);
`;

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

export default function AiToolsPage() {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSql = async () => {
    if (!naturalLanguageQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter a natural language query.',
      });
      return;
    }
    setIsLoading(true);
    setSqlQuery('');
    try {
      const response = await naturalLanguageToSQL({
        naturalLanguageQuery,
        tableSchema: MOCK_SCHEMA,
      });
      setSqlQuery(response.sqlQuery);
    } catch (error: any) {
      handleAIError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">AI Tools</h1>
          <p className="text-muted-foreground">
            Leverage AI to accelerate your SQL learning.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Natural Language to SQL</CardTitle>
            <CardDescription>
              Convert your plain English questions into SQL queries. This tool uses a sample schema for employees and departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea
                placeholder="e.g., Show me all employees earning more than 50,000"
                rows={4}
                value={naturalLanguageQuery}
                onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                disabled={isLoading}
              />
              <div className="relative">
                <Textarea
                  placeholder="Generated SQL will appear here..."
                  readOnly
                  rows={4}
                  className="font-code bg-muted/50"
                  value={sqlQuery}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <Button onClick={handleGenerateSql} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate SQL
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
