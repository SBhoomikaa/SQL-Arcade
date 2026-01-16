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
import { Badge } from '@/components/ui/badge';

const defaultAnalysis: CsvAnalysis = {
    id: 'default-projects',
    fileName: 'Default Example',
    tableName: 'Projects',
    dataSummary: 'A table tracking employees assigned to projects with unnormalized dependencies.',
    columnSchema: [
        { columnName: 'ProjectID', dataType: 'INTEGER', description: 'ID of the project.' },
        { columnName: 'ProjectName', dataType: 'VARCHAR(255)', description: 'Name of the project.' },
        { columnName: 'EmployeeID', dataType: 'INTEGER', description: 'ID of the employee.' },
        { columnName: 'EmployeeName', dataType: 'VARCHAR(255)', description: 'Name of the employee.' },
        { columnName: 'Department', dataType: 'VARCHAR(255)', description: 'Department of the employee.' },
        { columnName: 'HoursWorked', dataType: 'INTEGER', description: 'Hours worked.' },
    ],
    sampleRowsCsv: `ProjectID,ProjectName,EmployeeID,EmployeeName,Department,HoursWorked
P101,Data Migration,E501,Alice,Engineering,120
P101,Data Migration,E502,Bob,Engineering,80
P102,Cloud Upgrade,E501,Alice,Engineering,200`
};

export default function NormalizationPuzzleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [availableAnalyses, setAvailableAnalyses] = useState<CsvAnalysis[]>([defaultAnalysis]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CsvAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [puzzle, setPuzzle] = useState<NormalizeSchemaOutput | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('csvAnalyses');
    const analyses = stored ? [defaultAnalysis, ...JSON.parse(stored)] : [defaultAnalysis];
    setAvailableAnalyses(analyses);
    
    const found = analyses.find(a => a.id === selectedId);
    setSelectedAnalysis(found || defaultAnalysis);
  }, [selectedId]);

  if (!mounted) return null;

  const handleGeneratePuzzle = async () => {
    if (!selectedAnalysis) return;
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
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate normalization steps.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Normalization Puzzle</h1>
          <p className="text-muted-foreground">Transform unnormalized data into a clean 3NF relational schema.</p>
        </div>

        <Alert className="bg-blue-50/50 border-blue-200">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">The Goal: 3rd Normal Form (3NF)</AlertTitle>
            <AlertDescription className="text-blue-700">
                Ensure every non-key column depends <strong>only</strong> on the primary key, eliminating transitive dependencies and redundancy.
            </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Select Dataset</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={(id) => router.push(`/normalization-puzzles?id=${id}`)} value={selectedAnalysis?.id}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a dataset..." />
              </SelectTrigger>
              <SelectContent>
                {availableAnalyses.map(analysis => (
                  <SelectItem key={analysis.id} value={analysis.id}>{analysis.fileName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGeneratePuzzle} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Start Normalization
            </Button>
          </CardContent>
        </Card>

        {puzzle && selectedAnalysis && (
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analysis: {selectedAnalysis.tableName}</CardTitle>
                    <CardDescription>{puzzle.analysis}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    {selectedAnalysis.columnSchema.map(c => <TableHead key={c.columnName}>{c.columnName}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    {selectedAnalysis.columnSchema.map(c => <TableCell key={c.columnName} className="text-xs">{c.dataType}</TableCell>)}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {puzzle.steps.map((step, index) => (
                <div key={index} className="space-y-4">
                    <div className="flex justify-center"><ArrowDown className="text-muted-foreground animate-bounce" /></div>
                    <Card className={index === puzzle.steps.length - 1 ? "border-green-500/50 bg-green-50/10" : ""}>
                        <CardHeader>
                            <CardTitle className="text-lg">Step {index + 1}: {step.title}</CardTitle>
                            <CardDescription>{step.explanation}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            {step.tables.map((table) => (
                                <div key={table.name} className="space-y-2">
                                    <h4 className="font-mono text-sm font-bold">{table.name}</h4>
                                    <div className="rounded-md border bg-background">
                                        <Table>
                                            <TableBody>
                                                {table.columns.map(col => (
                                                    <TableRow key={col}>
                                                        <TableCell className="py-2 text-sm">
                                                            {col} {table.primaryKey.includes(col) && <Badge className="ml-2 scale-75">PK</Badge>}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}