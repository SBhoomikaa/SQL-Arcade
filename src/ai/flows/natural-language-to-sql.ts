'use server';

/**
 * @fileOverview Converts natural language queries into SQL code.
 *
 * - naturalLanguageToSQL - A function that translates natural language into SQL.
 * - NaturalLanguageToSQLInput - The input type for the naturalLanguageToSQL function.
 * - NaturalLanguageToSQLOutput - The return type for the naturalLanguageToSQL function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageToSQLInputSchema = z.object({
  naturalLanguageQuery: z
    .string()
    .describe('The natural language query to convert to SQL.'),
  tableSchema: z
    .string()
    .describe(
      'The schema of the database table, including table name and column definitions.'
    ),
});
export type NaturalLanguageToSQLInput = z.infer<
  typeof NaturalLanguageToSQLInputSchema
>;

const NaturalLanguageToSQLOutputSchema = z.object({
  sqlQuery: z.string().describe('The generated SQL query.'),
});
export type NaturalLanguageToSQLOutput = z.infer<
  typeof NaturalLanguageToSQLOutputSchema
>;

export async function naturalLanguageToSQL(
  input: NaturalLanguageToSQLInput
): Promise<NaturalLanguageToSQLOutput> {
  return naturalLanguageToSQLFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageToSQLPrompt',
  input: {schema: NaturalLanguageToSQLInputSchema},
  output: {schema: NaturalLanguageToSQLOutputSchema},
  prompt: `You are an expert SQL translator. Convert the following natural language query into SQL code, based on the provided table schema.\n\nTable Schema:\n{{{tableSchema}}}\n\nNatural Language Query:\n{{{naturalLanguageQuery}}}\n\nSQL Query:`,
});

const naturalLanguageToSQLFlow = ai.defineFlow(
  {
    name: 'naturalLanguageToSQLFlow',
    inputSchema: NaturalLanguageToSQLInputSchema,
    outputSchema: NaturalLanguageToSQLOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
