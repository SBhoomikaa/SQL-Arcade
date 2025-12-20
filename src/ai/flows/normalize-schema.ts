'use server';

/**
 * @fileOverview Analyzes a table schema for normalization opportunities up to 3NF.
 *
 * - normalizeSchema - A function that generates a normalization plan.
 * - NormalizeSchemaInput - The input type for the normalizeSchema function.
 * - NormalizeSchemaOutput - The return type for the normalizeSchema function.
 */

import { ai } from '@/ai/genkit';
import {
    NormalizeSchemaInputSchema,
    NormalizeSchemaOutputSchema,
    type NormalizeSchemaInput,
    type NormalizeSchemaOutput,
} from '@/lib/types/normalization';

export async function normalizeSchema(
  input: NormalizeSchemaInput
): Promise<NormalizeSchemaOutput> {
  return normalizeSchemaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'normalizeSchemaPrompt',
  input: { schema: NormalizeSchemaInputSchema },
  output: { schema: NormalizeSchemaOutputSchema },
  prompt: `You are an expert database designer. Your task is to analyze a given unnormalized table schema and produce a step-by-step guide to normalize it to the Third Normal Form (3NF).

You will be given the table name, its columns, and a summary of the data. Use this information to infer functional dependencies.

Table Name: {{{tableName}}}
Columns: {{#each columns}}{{this.name}} ({{this.type}}){{#unless @last}}, {{/unless}}{{/each}}
Data Summary: {{{dataSummary}}}

Follow these steps for your output:

1.  **Initial Analysis**:
    *   First, provide a brief, high-level analysis of the schema. Identify potential primary keys (composite keys are common in unnormalized data).
    *   Infer and state the likely functional dependencies. For example, if you see 'product_name' and 'product_price', you can infer that 'product_price' depends on 'product_name'.
    *   Mention any obvious normalization issues you see, like repeating groups or transitive dependencies.

2.  **Normalization Steps (1NF, 2NF, 3NF)**:
    *   For each normal form (1NF, 2NF, and 3NF), create a step object.
    *   **1NF**: Explain that the table is in 1NF if its columns are atomic. Based on the input, assume it is and state that. The 'tables' array for this step should just contain the original table structure. You must infer the primary key. It might be a composite key.
    *   **2NF**: Explain the concept of partial dependencies. Identify any in the 1NF schema and explain how you resolve them by splitting the table. The 'tables' array for this step should show the new set of tables.
    *   **3NF**: Explain the concept of transitive dependencies. Identify any in the 2NF schema and explain how you resolve them by splitting tables further. The 'tables' array should show the final, 3NF-compliant set of tables.

3.  **For each table in each step**:
    *   Define its name, columns, and primary key.
    *   In the 'dependencies' array for each table, list the functional dependencies present in that specific table as objects with 'dependent' and 'on' keys. For example: \`[{ "dependent": "product_price", "on": "product_name" }]\`.

Provide the final output in the specified JSON format. Ensure every table has a primary key defined.`,
});


const normalizeSchemaFlow = ai.defineFlow(
  {
    name: 'normalizeSchemaFlow',
    inputSchema: NormalizeSchemaInputSchema,
    outputSchema: NormalizeSchemaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
