'use server';

/**
 * @fileOverview Generates a performance report for a student based on their completed quests.
 *
 * Exports:
 * - `generateStudentReport`: Generates a brief report on a student's SQL skills.
 * - `GenerateStudentReportInput`: Input type for `generateStudentReport`.
 * - `GenerateStudentReportOutput`: Output type for `generateStudentReport`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestInfoSchema = z.object({
    title: z.string(),
    category: z.string(),
    difficulty: z.string(),
});

const GenerateStudentReportInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  completedQuestTitles: z.array(z.string()).describe("An array of the titles of quests the student has completed."),
  allQuestTitles: z.array(QuestInfoSchema).describe("An array of all available quests with their title, category, and difficulty."),
});
export type GenerateStudentReportInput = z.infer<typeof GenerateStudentReportInputSchema>;


const GenerateStudentReportOutputSchema = z.object({
  report: z.string().describe("A brief, insightful performance report on the student's progress, strengths, weaknesses, and suggested next steps. The report should be formatted in simple HTML using tags like <h4>, <ul>, <li>, and <strong>."),
});
export type GenerateStudentReportOutput = z.infer<typeof GenerateStudentReportOutputSchema>;


export async function generateStudentReport(
  input: GenerateStudentReportInput
): Promise<GenerateStudentReportOutput> {
  return generateStudentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentReportPrompt',
  input: {schema: GenerateStudentReportInputSchema},
  output: {schema: GenerateStudentReportOutputSchema},
  prompt: `You are an expert educational analyst for a SQL learning platform.
Your task is to generate a performance report for a student named {{{studentName}}}.

You will be given a list of all available quests and a list of the quests the student has completed.

All Available Quests (Title, Category, Difficulty):
{{#each allQuestTitles}}
- {{this.title}} ({{this.difficulty}}, {{this.category}})
{{/each}}

Quests Completed by {{{studentName}}}:
{{#each completedQuestTitles}}
- {{this}}
{{/each}}

Based on this information, generate a brief performance report in simple HTML format.
The report MUST use only the following HTML tags: <h4> for titles, <ul> for lists, <li> for list items, and <strong> for emphasis.

The report should include:
1.  A <h4> titled "Overall Summary" followed by a brief summary.
2.  A <h4> titled "Strengths" followed by a <ul> list of strengths.
3.  A <h4> titled "Areas for Improvement" followed by a <ul> list of weaknesses or areas to explore.
4.  A <h4> titled "Suggested Next Step" followed by a recommendation.

Keep the report concise, professional, and encouraging.
`,
});

const generateStudentReportFlow = ai.defineFlow(
  {
    name: 'generateStudentReportFlow',
    inputSchema: GenerateStudentReportInputSchema,
    outputSchema: GenerateStudentReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI failed to generate a student report.');
    }
    return output;
  }
);
