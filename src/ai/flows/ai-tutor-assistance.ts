'use server';

/**
 * @fileOverview An AI tutor assistance flow for providing contextual help within the SQL Arcade environment.
 *
 * - aiTutorAssistance - A function that handles the AI tutoring process.
 * - AiTutorAssistanceInput - The input type for the aiTutorAssistance function.
 * - AiTutorAssistanceOutput - The return type for the aiTutorAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorAssistanceInputSchema = z.object({
  query: z.string().describe('The user query for SQL assistance.'),
  context: z.string().optional().describe('Additional context for the query, such as current lesson or challenge.'),
  notes: z.string().optional().describe('Curated notes related to the query.'),
  examples: z.string().optional().describe('Solved examples related to the query.'),
  textbooks: z.string().optional().describe('Relevant excerpts from DBMS textbooks.'),
});

export type AiTutorAssistanceInput = z.infer<typeof AiTutorAssistanceInputSchema>;

const AiTutorAssistanceOutputSchema = z.object({
  response: z.string().describe('The AI tutor response to the query.'),
});

export type AiTutorAssistanceOutput = z.infer<typeof AiTutorAssistanceOutputSchema>;

export async function aiTutorAssistance(input: AiTutorAssistanceInput): Promise<AiTutorAssistanceOutput> {
  return aiTutorAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorAssistancePrompt',
  input: {schema: AiTutorAssistanceInputSchema},
  output: {schema: AiTutorAssistanceOutputSchema},
  prompt: `You are an AI tutor assisting students with SQL concepts.

  You will use the provided notes, examples, and textbook excerpts to answer the student's query.

  Query: {{{query}}}

  Context: {{{context}}}

  Notes: {{{notes}}}

  Examples: {{{examples}}}

  Textbooks: {{{textbooks}}}

  Provide a clear and concise response that is aligned with the syllabus and helps the student understand the concept.
  `,
});

const aiTutorAssistanceFlow = ai.defineFlow(
  {
    name: 'aiTutorAssistanceFlow',
    inputSchema: AiTutorAssistanceInputSchema,
    outputSchema: AiTutorAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
