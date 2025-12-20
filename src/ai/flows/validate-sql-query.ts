// // 'use server';

// // /**
// //  * @fileOverview Validates a user's SQL query against the requirements of a specific quest.
// //  *
// //  * - validateSQLQuery - A function that validates the SQL query.
// //  * - ValidateSQLQueryInput - The input type for the validateSQLQuery function.
// //  * - ValidateSQLQueryOutput - The return type for the validateSQLQuery function.
// //  */

// // import { ai } from '@/ai/genkit';
// // import { z } from 'genkit';

// // const ValidateSQLQueryInputSchema = z.object({
// //   userQuery: z.string().describe("The SQL query written by the user."),
// //   questDescription: z.string().describe("The description of the quest/problem the user is trying to solve."),
// //   tableSchema: z.string().describe("The schema of the database table(s) relevant to the quest."),
// //   isCustomQuest: z.boolean().optional().describe("A flag to indicate if this is a custom quest based on user-uploaded data.")
// // });
// // export type ValidateSQLQueryInput = z.infer<typeof ValidateSQLQueryInputSchema>;


// // const ValidateSQLQueryOutputSchema = z.object({
// //   isCorrect: z.boolean().describe("Whether the user's query correctly solves the quest."),
// //   feedback: z.string().describe("Constructive feedback for the user. If the query is correct, provide a confirmation message. If incorrect, provide a hint or explain the mistake without giving the direct answer."),
// //   simulatedResult: z.string().optional().describe("If the query is correct and it is a custom quest, provide a sample result set in JSON array format. The result should be plausible based on the query and schema. Example: '[{\"column1\":\"value1\", \"column2\":123}]'"),
// // });
// // export type ValidateSQLQueryOutput = z.infer<typeof ValidateSQLQueryOutputSchema>;


// // export async function validateSQLQuery(input: ValidateSQLQueryInput): Promise<ValidateSQLQueryOutput> {
// //   return validateSQLQueryFlow(input);
// // }


// // const prompt = ai.definePrompt({
// //   name: 'validateSQLQueryPrompt',
// //   input: { schema: ValidateSQLQueryInputSchema },
// //   output: { schema: ValidateSQLQueryOutputSchema },
// //   prompt: `You are an expert SQL instructor. Your task is to validate a user's SQL query based on a specific quest's requirements.

// // Quest Description:
// // {{{questDescription}}}

// // Table Schema:
// // {{{tableSchema}}}

// // User's SQL Query:
// // \`\`\`sql
// // {{{userQuery}}}
// // \`\`\`

// // Analyze the user's query.
// // 1. Determine if it correctly and efficiently solves the problem described in the quest description. The query does not need to be an exact string match of a "perfect" answer, but it must be functionally correct.
// // 2. If the query is correct, set isCorrect to true and provide a positive feedback message.
// // 3. If the query is incorrect, set isCorrect to false and provide a concise, helpful hint that guides the user toward the correct solution. Do not give away the answer.
// // 4. If this is a custom quest (isCustomQuest is true) AND the query is correct, generate a small, realistic, simulated result set that the query would produce. This result MUST be a valid JSON array of objects. For example: '[{"name":"John Doe", "age":30}, {"name":"Jane Smith", "age":25}]'. If it's not a custom quest or the query is incorrect, leave simulatedResult empty.

// // Provide your response in JSON format.`,
// // });


// // const validateSQLQueryFlow = ai.defineFlow(
// //   {
// //     name: 'validateSQLQueryFlow',
// //     inputSchema: ValidateSQLQueryInputSchema,
// //     outputSchema: ValidateSQLQueryOutputSchema,
// //   },
// //   async (input) => {
// //     const { output } = await prompt(input);
// //     if (!output) {
// //       throw new Error('AI failed to validate the query.');
// //     }
// //     return output;
// //   }
// // );


// 'use server';

// import { ai } from '@/ai/genkit';
// import { z } from 'genkit';
// import { pool } from '@/lib/db';

// const ValidateSQLQueryInputSchema = z.object({
//   userQuery: z.string(),
//   correctQuery: z.string(),
//   questDescription: z.string(),
// });

// export type ValidateSQLQueryInput = z.infer<typeof ValidateSQLQueryInputSchema>;

// const ValidateSQLQueryOutputSchema = z.object({
//   isCorrect: z.boolean(),
//   feedback: z.string(),
//   simulatedResult: z.string().optional(),
// });

// // Fixed: Changed inputSchema to input and added output for type safety
// const hintPrompt = ai.definePrompt({
//   name: 'generateSQLHint',
//   input: { schema: z.object({
//     userQuery: z.string(),
//     errorMessage: z.string().optional(),
//     questDescription: z.string(),
//     isMismatch: z.boolean(),
//   })},
//   output: { format: 'text' },
//   prompt: `
//     You are an expert SQL tutor. 
//     The user is trying to solve this quest: {{questDescription}}
//     The user wrote this query: {{userQuery}}
//     {{#if errorMessage}}The MySQL error was: {{errorMessage}}{{/if}}
//     {{#if isMismatch}}The query ran but the data returned was not what the King requested.{{/if}}

//     Provide a short, 1-2 sentence hint. DO NOT provide the final SQL answer. 
//     Explain the logic or the specific syntax mistake.
//   `,
// });

// export async function validateSQLQuery(input: ValidateSQLQueryInput) {
//   const connection = await pool.getConnection();
  
//   try {
//     // Start transaction so user queries (like INSERT) don't persist
//     await connection.beginTransaction();

//     // 1. Execute User Query
//     const [userRows] = await connection.execute(input.userQuery);
    
//     // 2. Execute the Master "Correct" Query to compare
//     const [correctRows] = await connection.execute(input.correctQuery);
    
//     // Always rollback to keep the database state clean
//     await connection.rollback();

//     // 3. Compare results
//     const isCorrect = JSON.stringify(userRows) === JSON.stringify(correctRows);

//     if (isCorrect) {
//       return {
//         isCorrect: true,
//         feedback: "Correct! The kingdom's records match your results.",
//         simulatedResult: JSON.stringify(userRows)
//       };
//     } else {
//       // Logic error: Query ran but result is wrong. Get hint from AI.
//       const { text } = await hintPrompt({
//         userQuery: input.userQuery,
//         questDescription: input.questDescription,
//         isMismatch: true
//       });
//       return { 
//         isCorrect: false, 
//         feedback: text, 
//         simulatedResult: JSON.stringify(userRows) 
//       };
//     }

//   } catch (error: any) {
//     await connection.rollback();
    
//     // Syntax Error: Get hint from AI based on the real MySQL error
//     const { text } = await hintPrompt({
//       userQuery: input.userQuery,
//       errorMessage: error.message,
//       questDescription: input.questDescription,
//       isMismatch: false
//     });

//     return {
//       isCorrect: false,
//       feedback: `MySQL Error: ${error.message}. Hint: ${text}`,
//       simulatedResult: JSON.stringify([{ error: error.message }])
//     };
//   } finally {
//     connection.release();
//   }
// }


'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { pool } from '@/lib/db';

const ValidateSQLQueryInputSchema = z.object({
  userQuery: z.string(),
  correctQuery: z.string(),
  questDescription: z.string(),
});

export type ValidateSQLQueryInput = z.infer<typeof ValidateSQLQueryInputSchema>;

// The AI now has the full "COMPANY" schema context
const hintPrompt = ai.definePrompt({
  name: 'generateSQLHint',
  input: { schema: z.object({
    userQuery: z.string(),
    errorMessage: z.string().optional(),
    questDescription: z.string(),
    isMismatch: z.boolean(),
  })},
  output: { format: 'text' },
  prompt: `
    You are an expert SQL tutor for the "COMPANY" database. 
    
    DATABASE SCHEMA CONTEXT:
    - EMPLOYEE (Fname, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno)
    - DEPARTMENT (Dname, Dnumber, Mgr_ssn, Mgr_start_date)
    - DEPT_LOCATIONS (Dnumber, Dlocation)
    - PROJECT (Pname, Pnumber, Plocation, Dnum)
    - WORKS_ON (Essn, Pno, Hours)
    - DEPENDENT (Essn, Dependent_name, Sex, Bdate, Relationship)

    The user is trying to solve: {{questDescription}}
    The user wrote: {{userQuery}}
    {{#if errorMessage}}The MySQL error was: {{errorMessage}}{{/if}}
    {{#if isMismatch}}The query ran but the results were incorrect.{{/if}}

    Provide a short, 1-2 sentence hint. Focus on the relationships (JOINs) or specific columns. 
    DO NOT provide the final SQL code.
  `,
});

export async function validateSQLQuery(input: ValidateSQLQueryInput) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Execute User Query
    const [userRows] = await connection.execute(input.userQuery);
    
    // 2. Execute Correct Query
    const [correctRows] = await connection.execute(input.correctQuery);
    
    await connection.rollback();

    // 3. Compare Results
    const isCorrect = JSON.stringify(userRows) === JSON.stringify(correctRows);

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: "Excellent! You've mastered the complex relationships of the Company database.",
        simulatedResult: JSON.stringify(userRows)
      };
    } else {
      const { text } = await hintPrompt({
        userQuery: input.userQuery,
        questDescription: input.questDescription,
        isMismatch: true
      });
      return { isCorrect: false, feedback: text, simulatedResult: JSON.stringify(userRows) };
    }

  } catch (error: any) {
    await connection.rollback();
    
    const { text } = await hintPrompt({
      userQuery: input.userQuery,
      errorMessage: error.message,
      questDescription: input.questDescription,
      isMismatch: false
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