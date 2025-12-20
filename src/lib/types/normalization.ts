import { z } from 'zod';

const DependencySchema = z.object({
    dependent: z.string().describe("The column that is functionally dependent."),
    on: z.string().describe("The column or set of columns (comma-separated if multiple) that determines the dependent column."),
});

const TableSchemaDef = z.object({
    name: z.string().describe("The name of the table."),
    columns: z.array(z.string()).describe("An array of column names in the table."),
    primaryKey: z.array(z.string()).describe("The column(s) that form the primary key."),
    dependencies: z.array(DependencySchema).describe("An array of objects representing the functional dependencies within this table."),
});

const NormalizationStepSchema = z.object({
    title: z.string().describe("The title of this normalization step (e.g., '1st Normal Form (1NF)')."),
    explanation: z.string().describe("A detailed explanation of what this normal form is and what changes (if any) were made to achieve it for the given schema."),
    tables: z.array(TableSchemaDef).describe("An array of table schemas representing the state of the database after this step."),
});

export const NormalizeSchemaInputSchema = z.object({
  tableName: z.string().describe("The name of the table to analyze."),
  columns: z.array(z.object({ name: z.string(), type: z.string() })).describe("An array of column names and their data types."),
  dataSummary: z.string().describe("A summary of the data, which may provide context about relationships between columns."),
});
export type NormalizeSchemaInput = z.infer<typeof NormalizeSchemaInputSchema>;


export const NormalizeSchemaOutputSchema = z.object({
  analysis: z.string().describe("An initial high-level analysis of potential normalization issues, such as repeating groups or dependencies."),
  steps: z.array(NormalizationStepSchema).describe("An array of normalization steps to get to 3NF."),
});
export type NormalizeSchemaOutput = z.infer<typeof NormalizeSchemaOutputSchema>;
