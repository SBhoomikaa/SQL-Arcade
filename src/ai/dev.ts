import { config } from 'dotenv';
config();

import '@/ai/flows/adaptive-sql-difficulty.ts';
import '@/ai/flows/ai-tutor-assistance.ts';
import '@/ai/flows/natural-language-to-sql.ts';
import '@/ai/flows/validate-sql-query.ts';
import '@/ai/flows/analyze-csv-data.ts';
import '@/ai/flows/generate-sql-quest-from-schema.ts';
import '@/ai/flows/normalize-schema.ts';
