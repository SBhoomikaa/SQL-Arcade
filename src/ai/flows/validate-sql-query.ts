'use server';

import { ensureSandboxDb } from '@/lib/sandbox_db';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { pool } from '@/lib/db';

const ValidateSQLQueryInputSchema = z.object({
  sandboxId: z.string(),
  userQuery: z.string(),
  correctQuery: z.string(),
  questDescription: z.string(),
  dbSchemaContext: z.string().optional(),
});

export type ValidateSQLQueryInput = z.infer<typeof ValidateSQLQueryInputSchema>;

const hintPrompt = ai.definePrompt({
  name: 'generateSQLHint',
  input: { schema: z.object({
    userQuery: z.string(),
    errorMessage: z.string().optional(),
    questDescription: z.string(),
    isMismatch: z.boolean(),
    dbSchemaContext: z.string().optional(),
  })},
  output: { format: 'text' },
  prompt: `
    You are an expert SQL tutor for the COMPANY database. 
    {{#if dbSchemaContext}}SCHEMA CONTEXT: {{dbSchemaContext}}{{/if}}
    
    The user is trying to solve: {{questDescription}}
    The user wrote: {{userQuery}}
    {{#if errorMessage}}The MySQL error was: {{errorMessage}}{{/if}}
    {{#if isMismatch}}The query ran but results do not match the expected output.{{/if}}

    Provide a short, 1-2 sentence hint. DO NOT provide the final SQL code.
  `,
});

// Helper: Fetches schema safely from the sandbox database
export async function getLiveTableContext(dbName: string, tableNames: string[]) {
  try {
    const schemaData = [];
    // Limit to 3 tables max to prevent timeouts
    for (const name of tableNames.slice(0, 3)) {
      const [columns]: any = await pool.execute(`
        SELECT COLUMN_NAME as name, DATA_TYPE as type 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [dbName, name]);
      
      if (columns && columns.length > 0) {
        schemaData.push({ tableName: name, columns });
      }
    }
    return schemaData;
  } catch (error) {
    console.error("Schema fetch error (non-fatal):", error);
    return []; // Return empty array so UI continues to load
  }
}

export async function validateSQLQuery(input: ValidateSQLQueryInput) {
  // 🔑 Ensure sandbox DB exists and is initialized
  const dbName = await ensureSandboxDb(input.sandboxId);

  const connection = await pool.getConnection();

  try {
    // 🔑 Switch to sandbox DB
    await connection.query(`USE \`${dbName}\``);

    await connection.beginTransaction();

    const [userRows] = await connection.execute(input.userQuery);
    await connection.rollback();
    await connection.beginTransaction();
    const [correctRows] = await connection.execute(input.correctQuery);
    await connection.rollback();
    

    let isCorrect = false;
    if (Array.isArray(userRows) && Array.isArray(correctRows)) {
      isCorrect = JSON.stringify(userRows) === JSON.stringify(correctRows);
    } 
    else {
      isCorrect = (userRows as any).affectedRows === (correctRows as any).affectedRows;
    }
    
    console.log('👤 User query:', input.userQuery);
    console.log('✅ Correct query:', input.correctQuery);
    console.log('👤 User result:', JSON.stringify(userRows));
    console.log('✅ Correct result:', JSON.stringify(correctRows));
    console.log('🔍 Are they equal?', isCorrect);

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: "Excellent! Your query matches the expected database output.",
        simulatedResult: JSON.stringify(userRows)
      };
    } else {
      const { text } = await hintPrompt({
        userQuery: input.userQuery,
        questDescription: input.questDescription,
        isMismatch: true,
        dbSchemaContext: input.dbSchemaContext
      });
      return { 
        isCorrect: false, 
        feedback: text, 
        simulatedResult: JSON.stringify(userRows) 
      };
    }
  } catch (error: any) {
    await connection.rollback();
    
    const { text } = await hintPrompt({
      userQuery: input.userQuery,
      errorMessage: error.message,
      questDescription: input.questDescription,
      isMismatch: false,
      dbSchemaContext: input.dbSchemaContext
    });

    return {
      isCorrect: false,
      feedback: `MySQL Error: ${error.message}. Hint: ${text}`,
      simulatedResult: JSON.stringify([{ error: error.message }])
    };
  } finally {
    connection.release();
  }
}