'use server';

/**
 * @fileOverview An AI flow to analyze a CSV file and extract its schema and a summary.
 *
 * - analyzeCsvData - A function that takes a CSV file as a data URI and returns its analysis.
 * - AnalyzeCsvDataInput - The input type for the analyzeCsvData function.
 * - AnalyzeCsvDataOutput - The return type for the analyzeCsvData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeCsvDataInputSchema = z.object({
  csvDataUri: z
    .string()
    .describe(
      "A CSV file represented as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:text/csv;base64,<encoded_data>'."
    ),
});
export type AnalyzeCsvDataInput = z.infer<typeof AnalyzeCsvDataInputSchema>;

const AnalyzeCsvDataOutputSchema = z.object({
  columnSchema: z.array(
    z.object({
      columnName: z.string().describe('The name of the column.'),
      dataType: z
        .string()
        .describe(
          'The inferred SQL data type for the column (e.g., VARCHAR(255), INTEGER, DATE).'
        ),
      description: z.string().describe('A brief description of the column.'),
    })
  ).describe('An array of objects, each representing a column in the CSV.'),
  dataSummary: z.string().describe('A brief summary of the data in the CSV file.'),
  sampleRowsCsv: z.string().describe('A few sample rows from the dataset, formatted as a CSV string with a header.')
});
export type AnalyzeCsvDataOutput = z.infer<typeof AnalyzeCsvDataOutputSchema>;

export async function analyzeCsvData(
  input: AnalyzeCsvDataInput
): Promise<AnalyzeCsvDataOutput> {
  return analyzeCsvDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCsvDataPrompt',
  input: { schema: AnalyzeCsvDataInputSchema },
  output: { schema: AnalyzeCsvDataOutputSchema },
  prompt: `You are a data analysis expert. Analyze the provided CSV data.

Your task is to:
1.  Infer the table schema from the CSV header and data. For each column, determine a suitable SQL data type (e.g., VARCHAR(255), INTEGER, DATE, etc.) and write a brief, one-sentence description of what the column represents.
2.  Provide a concise, one-paragraph summary of the overall dataset.
3.  Extract the header and the first 3 rows of data as sample rows, formatted as a single CSV string.

Here is the CSV data:
{{media url=csvDataUri}}

Provide your response in the specified JSON format.`,
});

const analyzeCsvDataFlow = ai.defineFlow(
  {
    name: 'analyzeCsvDataFlow',
    inputSchema: AnalyzeCsvDataInputSchema,
    outputSchema: AnalyzeCsvDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'googleai/gemini-2.5-flash'});
    if (!output) {
      throw new Error('AI failed to produce a valid analysis.');
    }
    return output;
  }
);
