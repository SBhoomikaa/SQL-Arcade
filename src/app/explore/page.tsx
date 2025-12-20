
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
import { FileUp, Upload, Loader2, TableIcon, Wand, X, Puzzle, Sparkles } from 'lucide-react';
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

// Function to store analyses in localStorage
const storeAnalyses = (analyses: CsvAnalysis[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('csvAnalyses', JSON.stringify(analyses));
  }
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


export default function ExplorePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [analyses, setAnalyses] = useState<CsvAnalysis[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FILE_SIZE_LIMIT_MB = 2;
  const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MB * 1024 * 1024;
  
  // On mount, clear previous analyses from local storage for a fresh start
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('csvAnalyses');
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
        const newFiles = Array.from(selectedFiles);
        let validFiles = [...files];
        let errorOccurred = false;

        newFiles.forEach(file => {
            if (file.type !== 'text/csv') {
                toast({ variant: 'destructive', title: 'Invalid File Type', description: `'${file.name}' is not a CSV file.` });
                errorOccurred = true;
                return;
            }
            if (file.size > FILE_SIZE_LIMIT_BYTES) {
                toast({ variant: 'destructive', title: 'File Too Large', description: `'${file.name}' is larger than ${FILE_SIZE_LIMIT_MB}MB.` });
                errorOccurred = true;
                return;
            }
            if (!validFiles.some(f => f.name === file.name && f.size === file.size)) {
              validFiles.push(file);
            }
        });
        
        setFiles(validFiles);
        setAnalyses([]); // Reset analyses when files change
    }
     // Reset the file input to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
    setAnalyses(analyses.filter(analysis => analysis.fileName !== fileToRemove.name));
  };


  const handleAnalyzeData = async () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Files Selected',
        description: 'Please select one or more CSV files to analyze.',
      });
      return;
    }

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
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = (error) => reject(error);
            })
        );
        
        const results = await Promise.all(analysisPromises);
        setAnalyses(results);
        storeAnalyses(results); // Store successful analyses in localStorage

    } catch (error: any) {
        handleAIError(error, toast);
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
        
        toast({
            title: 'Quests Generated!',
            description: 'Your new custom quests have been added to the SQL Quests page.',
        });

        router.push('/quests?category=Custom+Quest');

    } catch (error: any) {
        handleAIError(error, toast);
    } finally {
        setIsGeneratingQuest(false);
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Explore Your Data</h1>
          <p className="text-muted-foreground">
            Upload one or more CSV datasets to analyze schemas and generate custom SQL quests or normalization puzzles.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload & Analyze</CardTitle>
            <CardDescription>Select one or more CSV files (max 2MB each) from your computer to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Upload className="h-8 w-8 text-secondary-foreground" />
                </div>
                 <div className="flex-1 space-y-2 text-center">
                    <h3 className="font-semibold">
                        {files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}
                    </h3>
                    <input ref={fileInputRef} type="file" id="csv-upload" accept=".csv" onChange={handleFileChange} className="hidden" multiple />
                    <Button onClick={handleUploadClick} variant="outline" disabled={isLoading}>
                        <FileUp className="mr-2 h-4 w-4" />
                        Select Files
                    </Button>
                </div>
                {files.length > 0 && (
                    <div className="w-full space-y-2">
                        {files.map(file => (
                            <div key={file.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                                <span>{file.name} <span className="text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span></span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
             <Button onClick={handleAnalyzeData} disabled={isLoading || files.length === 0}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand className="mr-2 h-4 w-4" />
              )}
              Analyze Dataset(s)
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
            <Card className="flex items-center justify-center p-12">
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">AI is analyzing your data...</p>
            </Card>
        )}

        {analyses.length > 0 && (
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Complete</CardTitle>
                    <CardDescription>
                        The AI has detected schemas for your uploaded data. You can now generate a set of quests or select a dataset to create a normalization puzzle.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button onClick={handleGenerateQuest} disabled={isGeneratingQuest}>
                        {isGeneratingQuest ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand className="mr-2 h-4 w-4" />
                        )}
                        Generate SQL Quests
                    </Button>
                     <Button variant="secondary" onClick={() => router.push(`/normalization-puzzles?id=${analyses[0].id}`)}>
                        <Puzzle className="mr-2 h-4 w-4" />
                        Create Normalization Puzzle
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {analyses.map(analysis => (
                    <Card key={analysis.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TableIcon />
                                Schema: {analysis.tableName}
                            </CardTitle>
                            <CardDescription>
                                <Badge variant="outline">{analysis.fileName}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{analysis.dataSummary}</p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Column Name</TableHead>
                                    <TableHead>Data Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysis.columnSchema.map((col) => (
                                    <TableRow key={col.columnName}>
                                        <TableCell className="font-medium">{col.columnName}</TableCell>
                                        <TableCell>{col.dataType}</TableCell>
                                        <TableCell>{col.description}</TableCell>
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
      </div>
    </MainLayout>
  );
