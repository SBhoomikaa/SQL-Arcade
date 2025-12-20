import { z } from 'zod';

export type QuestSchema = {
  tableName: string;
  columns: { name: string; type: string }[];
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  initialQuery: string;
  correctQuery: string;
  successMessage: string;
  schema: QuestSchema[]; // Changed to an array
  resultData: Record<string, any>[];
  isCustom?: boolean; // Flag for custom quests
};


// Schema for the AI flow that generates quests
export const GenerateSqlQuestsFromSchemaInputSchema = z.object({
  tableSchema: z.string().describe('The schema of the database table, including table name and column definitions.'),
  topic: z.string().describe('The SQL topic for the quest (e.g., "Filtering with WHERE", "Basic Aggregations").'),
});
export type GenerateSqlQuestsFromSchemaInput = z.infer<typeof GenerateSqlQuestsFromSchemaInputSchema>;


export const GeneratedQuestSchema = z.object({
  title: z.string().describe("A creative and engaging title for the SQL quest."),
  longDescription: z.string().describe("A detailed description of the quest's story and what the user needs to accomplish. This should be 1-2 sentences long."),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The difficulty level of the generated quest."),
});
export type GeneratedQuest = z.infer<typeof GeneratedQuestSchema>;
