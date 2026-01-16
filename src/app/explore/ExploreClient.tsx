//app/explore/ExploreClient.tsx - 
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Upload, Loader2, TableIcon, Wand, X, Puzzle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeCsvData } from '@/ai/flows/analyze-csv-data';
import { generateSqlQuestsFromSchema } from '@/ai/flows/generate-sql-quest-from-schema';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { addCustomQuests } from '@/lib/progress';
import { Badge } from '@/components/ui/badge';
import type { CsvAnalysis } from '@/lib/types/csv-analysis';

export default function ExploreClient() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [analyses, setAnalyses] = useState<CsvAnalysis[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FILE_SIZE_LIMIT_MB = 2;
  const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MB * 1024 * 1024;
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('csvAnalyses');
    }
  }, []);

  if (!mounted) return null;

  const handleAIError = (error: any) => {
    console.error('AI Error:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    const errorString = String(error).toLowerCase();
    
    if (errorString.includes('429') || errorString.includes('quota')) {
      errorMessage = 'The AI has exceeded its daily quota.';
    } else if (errorString.includes('503')) {
      errorMessage = 'The AI model is currently overloaded.';
    }
    
    toast({ variant: 'destructive', title: 'AI Operation Failed', description: errorMessage });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
        const newFiles = Array.from(selectedFiles);
        let validFiles = [...files];

        newFiles.forEach(file => {
            if (file.type !== 'text/csv') {
                toast({ variant: 'destructive', title: 'Invalid File', description: `'${file.name}' is not a CSV.` });
                return;
            }
            if (file.size > FILE_SIZE_LIMIT_BYTES) {
                toast({ variant: 'destructive', title: 'File Too Large', description: `'${file.name}' exceeds ${FILE_SIZE_LIMIT_MB}MB.` });
                return;
            }
            if (!validFiles.some(f => f.name === file.name)) {
              validFiles.push(file);
            }
        });
        
        setFiles(validFiles);
        setAnalyses([]); 
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeData = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setAnalyses([]);

    try {
        const analysisPromises = files.map(file => 
            new Promise<CsvAnalysis>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const dataUri = reader.result as string;
                    try {
                        const result = await analyzeCsvData({ csvDataUri: dataUri });
                        const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9]/g, '_');
                        resolve({
                            id: `${tableName}-${Date.now()}`,
                            columnSchema: result.columnSchema,
                            dataSummary: result.dataSummary,
                            tableName: tableName,
                            fileName: file.name,
                            sampleRowsCsv: result.sampleRowsCsv
                        });
                    } catch (error) { reject(error); }
                };
                reader.onerror = (error) => reject(error);
            })
        );
        
        const results = await Promise.all(analysisPromises);
        setAnalyses(results);
        localStorage.setItem('csvAnalyses', JSON.stringify(results));
    } catch (error: any) {
        handleAIError(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateQuest = async () => {
    if (analyses.length === 0) return;
    setIsGeneratingQuest(true);

    try {
        const tableSchema = analyses.map(a => `Table: ${a.tableName}\nColumns: ${a.columnSchema.map(c => `${c.columnName} (${c.dataType})`).join(', ')}`).join('\n\n');
        
        const response = await generateSqlQuestsFromSchema({
            tableSchema,
            topic: analyses.length > 1 ? 'Challenges involving JOINs between tables' : 'General SQL Challenges'
        });

        addCustomQuests(response.quests, analyses);
        toast({ title: 'Quests Generated!', description: 'Custom quests added to the Quests page.' });
        router.push('/quests?category=Custom+Quest');
    } catch (error: any) {
        handleAIError(error);
    } finally {
        setIsGeneratingQuest(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Explore Your Data</h1>
          <p className="text-muted-foreground">Upload CSVs to analyze schemas and generate custom challenges.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload & Analyze</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg bg-muted/20">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" multiple />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading}>
                    <FileUp className="mr-2 h-4 w-4" /> Select Files
                </Button>
                {files.length > 0 && (
                    <div className="w-full space-y-2">
                        {files.map(file => (
                            <div key={file.name} className="flex items-center justify-between p-2 rounded-md bg-background border text-sm">
                                <span>{file.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter(f => f !== file))}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
             <Button onClick={handleAnalyzeData} disabled={isLoading || files.length === 0} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
              Analyze Dataset(s)
            </Button>
          </CardContent>
        </Card>

        {analyses.length > 0 && (
          <div className="space-y-6">
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle>Analysis Complete</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button onClick={handleGenerateQuest} disabled={isGeneratingQuest}>
                        {isGeneratingQuest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                        Generate SQL Quests
                    </Button>
                     <Button variant="outline" onClick={() => router.push(`/normalization-puzzles?id=${analyses[0].id}`)}>
                        <Puzzle className="mr-2 h-4 w-4" /> Create Normalization Puzzle
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {analyses.map(analysis => (
                    <Card key={analysis.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TableIcon className="h-5 w-5" /> {analysis.tableName}
                            </CardTitle>
                            <Badge variant="secondary">{analysis.fileName}</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{analysis.dataSummary}</p>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Column</TableHead>
                                            <TableHead>Type</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analysis.columnSchema.map((col) => (
                                        <TableRow key={col.columnName}>
                                            <TableCell className="font-mono text-xs">{col.columnName}</TableCell>
                                            <TableCell className="text-xs">{col.dataType}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}