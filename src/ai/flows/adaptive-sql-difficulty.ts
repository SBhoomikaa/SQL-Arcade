'use server';

/**
 * @fileOverview Implements adaptive SQL difficulty adjustment based on student performance.
 *
 * Exports:
 * - `adjustSQLDifficulty`: Adjusts the difficulty of SQL challenges based on student performance.
 * - `AdaptiveSQLDifficultyInput`: Input type for `adjustSQLDifficulty`.
 * - `AdaptiveSQLDifficultyOutput`: Output type for `adjustSQLDifficulty`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveSQLDifficultyInputSchema = z.object({
  studentPerformance: z
    .number()
    .describe(
      'A numerical representation of the student performance (e.g., accuracy rate on previous exercises).' // e.g., accuracy rate on previous exercises
    ),
  currentDifficulty: z
    .string()
    .describe(
      'The current difficulty level of the SQL challenges (e.g., beginner, intermediate, advanced).' // e.g., beginner, intermediate, advanced
    ),
  topic: z.string().describe('The SQL topic the student is currently learning.'),
  attempts: z.number().describe('Number of attempts student has made on current problem'),
});
export type AdaptiveSQLDifficultyInput = z.infer<
  typeof AdaptiveSQLDifficultyInputSchema
>;

const AdaptiveSQLDifficultyOutputSchema = z.object({
  adjustedDifficulty: z
    .string()
    .describe(
      'The adjusted difficulty level of the SQL challenges (e.g., beginner, intermediate, advanced).' // e.g., beginner, intermediate, advanced
    ),
  hint: z.string().optional().describe('A hint to help the student.'),
  simplifiedExample: z
    .string()
    .optional()
    .describe('A simplified example related to the current topic.'),
});
export type AdaptiveSQLDifficultyOutput = z.infer<
  typeof AdaptiveSQLDifficultyOutputSchema
>;

export async function adjustSQLDifficulty(
  input: AdaptiveSQLDifficultyInput
): Promise<AdaptiveSQLDifficultyOutput> {
  return adaptiveSQLDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveSQLDifficultyPrompt',
  input: {schema: AdaptiveSQLDifficultyInputSchema},
  output: {schema: AdaptiveSQLDifficultyOutputSchema},
  prompt: `You are an AI SQL tutor. You adapt the difficulty of SQL challenges based on the student's performance. Current topic: {{{topic}}}. 

Student Performance: {{{studentPerformance}}}. Current Difficulty: {{{currentDifficulty}}}. Attempts: {{{attempts}}}.

Based on the student's performance, current difficulty and number of attempts, determine whether to adjust the difficulty.

If the student is struggling (low performance or many attempts), suggest a simpler example and a helpful hint. Do not provide the answer directly.

Output the adjusted difficulty, simplified example, and hint. The difficulty should remain the same if performance is adequate.

Ensure to provide the response in JSON format.`, // Enforce JSON format
});

const adaptiveSQLDifficultyFlow = ai.defineFlow(
  {
    name: 'adaptiveSQLDifficultyFlow',
    inputSchema: AdaptiveSQLDifficultyInputSchema,
    outputSchema: AdaptiveSQLDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
