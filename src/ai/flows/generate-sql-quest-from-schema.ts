'use server';

/**
 * @fileOverview Generates a SQL quest from a given table schema.
 *
 * - generateSqlQuestFromSchema - A function that creates a SQL quest.
 */

import { ai } from '@/ai/genkit';
import { GenerateSqlQuestsFromSchemaInputSchema, GeneratedQuestSchema, type GenerateSqlQuestsFromSchemaInput } from '@/lib/types/quests';
import { z } from 'zod';

const GeneratedQuestsOutputSchema = z.object({
    quests: z.array(GeneratedQuestSchema).length(3).describe("An array of exactly three generated quests: one beginner, one intermediate, and one advanced.")
});
export type GeneratedQuestsOutput = z.infer<typeof GeneratedQuestsOutputSchema>;


export async function generateSqlQuestsFromSchema(input: GenerateSqlQuestsFromSchemaInput): Promise<GeneratedQuestsOutput> {
    return generateSqlQuestsFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateSqlQuestsFromSchemaPrompt',
    input: { schema: GenerateSqlQuestsFromSchemaInputSchema },
    output: { schema: GeneratedQuestsOutputSchema },
    prompt: `You are an expert SQL instructor who creates fun, themed quests for students. Your task is to generate a set of three SQL quests (Beginner, Intermediate, and Advanced) based on a given table schema and a topic.

Table Schema:
\`\`\`
{{{tableSchema}}}
\`\`\`

Quest Topic:
"{{{topic}}}"

Based on the schema and topic, generate one quest for each difficulty level:
1.  **Beginner:** A simple challenge, like a basic SELECT with a WHERE clause or a simple INSERT.
2.  **Intermediate:** A slightly more complex challenge, perhaps involving an UPDATE, a simple aggregation (COUNT, AVG), or more complex filtering.
3.  **Advanced:** A difficult challenge, like a JOIN with another (hypothetical) table, a GROUP BY with HAVING, or a subquery. For JOINs, you can invent a simple related table if it makes sense.

For each quest, generate:
1.  A creative title.
2.  A long description (1-2 sentences) that sets up a small story and clearly states the user's task.
3.  The difficulty level ('Beginner', 'Intermediate', 'Advanced').

Do not provide the SQL query itself in your response. Just provide the title, long description, and difficulty for each of the three quests.

Provide your response in the specified JSON format, with an array of three quest objects.`,
});


const generateSqlQuestsFlow = ai.defineFlow(
    {
        name: 'generateSqlQuestsFlow',
        inputSchema: GenerateSqlQuestsFromSchemaInputSchema,
        outputSchema: GeneratedQuestsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('AI failed to generate quests.');
        }
        return output;
    }
);
