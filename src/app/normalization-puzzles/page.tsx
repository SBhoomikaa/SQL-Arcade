
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, Sparkles, Loader2, Info, BookOpen, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { normalizeSchema } from '@/ai/flows/normalize-schema';
import type { NormalizeSchemaOutput, TableSchemaDef } from '@/lib/types/normalization';
import type { CsvAnalysis } from '@/lib/types/csv-analysis';

// Function to retrieve analyses from localStorage
const getStoredAnalyses = (): CsvAnalysis[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem('csvAnalyses');
  return stored ? JSON.parse(stored) : [];
};

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

const defaultAnalysis: CsvAnalysis = {
    id: 'default-projects',
    fileName: 'Default Example',
    tableName: 'Projects',
    dataSummary: 'A table tracking employees assigned to projects. It contains project details, employee details, and hours worked. The data is unnormalized and contains repeating groups and other dependencies.',
    columnSchema: [
        { columnName: 'ProjectID', dataType: 'INTEGER', description: 'ID of the project.' },
        { columnName: 'ProjectName', dataType: 'VARCHAR(255)', description: 'Name of the project.' },
        { columnName: 'EmployeeID', dataType: 'INTEGER', description: 'ID of the employee.' },
        { columnName: 'EmployeeName', dataType: 'VARCHAR(255)', description: 'Name of the employee.' },
        { columnName: 'Department', dataType: 'VARCHAR(255)', description: 'Department of the employee.' },
        { columnName: 'HoursWorked', dataType: 'INTEGER', description: 'Hours worked by the employee on the project.' },
    ],
    sampleRowsCsv: `ProjectID,ProjectName,EmployeeID,EmployeeName,Department,HoursWorked
P101,Data Migration,E501,Alice,Engineering,120
P101,Data Migration,E502,Bob,Engineering,80
P102,Cloud Upgrade,E501,Alice,Engineering,200
P103,UI Redesign,E503,Charlie,Design,150`
};


const SampleDataTable = ({ csvData }: { csvData: string }) => {
    if (!csvData) return null;
    const [header, ...rows] = csvData.split('\n');
    const headers = header.split(',');
    const data = rows.map(row => row.split(','));

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow key={i}>
                        {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const TableSchemaView = ({ table }: { table: TableSchemaDef }) => (
    <div key={table.name}>
        <h3 className="font-semibold mb-2">Table: `{table.name}`</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Primary Key</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {table.columns.map((colName) => (
                    <TableRow key={colName}>
                        <TableCell>{colName}</TableCell>
                        <TableCell>
                            {table.primaryKey.includes(colName) ? <Check className="h-4 w-4 text-primary" /> : ''}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {table.dependencies.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
                <h4 className="font-semibold text-foreground">Functional Dependencies:</h4>
                <ul className="list-disc pl-5">
                    {table.dependencies.map((dep, depIdx) => (
                        <li key={depIdx}>{`'${dep.dependent}' depends on '${dep.on}'`}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);


export default function NormalizationPuzzlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const { toast } = useToast();

  const [availableAnalyses, setAvailableAnalyses] = useState<CsvAnalysis[]>([defaultAnalysis]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CsvAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [puzzle, setPuzzle] = useState<NormalizeSchemaOutput | null>(null);

  useEffect(() => {
    const stored = getStoredAnalyses();
    const allAnalyses = [defaultAnalysis, ...stored];
    setAvailableAnalyses(allAnalyses);
    
    if (selectedId) {
      const found = allAnalyses.find(a => a.id === selectedId);
      setSelectedAnalysis(found || defaultAnalysis);
    } else {
        setSelectedAnalysis(defaultAnalysis);
    }
  }, [selectedId]);

  const handleAnalysisSelect = (id: string) => {
    router.push(`/normalization-puzzles?id=${id}`);
  };

  const handleGeneratePuzzle = async () => {
    if (!selectedAnalysis) {
      toast({
        variant: 'destructive',
        title: 'No Dataset Selected',
        description: 'Please select a dataset to generate a puzzle for.',
      });
      return;
    }
    setIsLoading(true);
    setPuzzle(null);

    try {
      const result = await normalizeSchema({
        tableName: selectedAnalysis.tableName,
        columns: selectedAnalysis.columnSchema.map(c => ({ name: c.columnName, type: c.dataType })),
        dataSummary: selectedAnalysis.dataSummary,
      });
      setPuzzle(result);
    } catch (error: any) {
      handleAIError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">The Database Normalization Puzzle</h1>
          <p className="text-muted-foreground">
            Organize columns and tables to minimize data redundancy and improve data integrity.
          </p>
        </div>

        <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>The Goal: 3rd Normal Form (3NF)</AlertTitle>
            <AlertDescription>
                A table is in 3NF if it is in 2NF and all its attributes are not transitively dependent on the primary key. In simpler terms, this means every non-key column depends *only* on the primary key, not on another non-key column. This process prevents data redundancy and improves data integrity.
            </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Select a Dataset</CardTitle>
            <CardDescription>
              Choose the default example or one of the datasets you previously analyzed to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {availableAnalyses.length > 0 ? (
              <>
                <Select onValueChange={handleAnalysisSelect} value={selectedAnalysis?.id}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Select a dataset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAnalyses.map(analysis => (
                      <SelectItem key={analysis.id} value={analysis.id}>
                        {analysis.fileName} {analysis.id !== 'default-projects' ? `(${analysis.tableName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleGeneratePuzzle} disabled={!selectedAnalysis || isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Puzzle
                </Button>
              </>
            ) : (
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>No Custom Datasets Found</AlertTitle>
                <AlertDescription>
                  You can still use the default example, or go to the{' '}
                  <a href="/explore" className="font-semibold underline">
                    Explore Datasets
                  </a>{' '}
                  page to upload a CSV and analyze it.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {isLoading && (
            <Card className="flex items-center justify-center p-12">
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">AI is crafting your puzzle...</p>
            </Card>
        )}

        {puzzle && selectedAnalysis && (
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Starting Point: The Unnormalized Table</CardTitle>
                    <CardDescription>{puzzle.analysis}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <h3 className="font-semibold">Unnormalized Table: `{selectedAnalysis.tableName}`</h3>
                    {selectedAnalysis.sampleRowsCsv ? <SampleDataTable csvData={selectedAnalysis.sampleRowsCsv} /> : <p className="text-sm text-muted-foreground">No sample data available.</p>}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center text-center">
                <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>

            {puzzle.steps.map((step, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>Step {index + 1}: {step.title}</CardTitle>
                        <CardDescription>{step.explanation}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                         {index === puzzle.steps.length - 1 && (
                            <Alert variant='default' className='bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'>
                                <Sparkles className="h-4 w-4 text-green-500" />
                                <AlertTitle>This is the final, normalized solution!</AlertTitle>
                                <AlertDescription>This design avoids data redundancy and prevents update anomalies. Each piece of information is stored in exactly one place.</AlertDescription>
                            </Alert>
                         )}
                        <div className={`grid gap-6 ${step.tables.length > 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                            {step.tables.map((table) => (
                                <TableSchemaView key={table.name} table={table} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

