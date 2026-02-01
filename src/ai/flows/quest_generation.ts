'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* -------------------------------------------------- */
/* INPUT SCHEMA                                       */
/* -------------------------------------------------- */

const GenerateQuestInputSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  template: z.enum([
    'medieval_kingdom',
    'bachchan_vault',
    'desi_traders',
  ]),
});

export type GenerateQuestInput = z.infer<typeof GenerateQuestInputSchema>;

/* -------------------------------------------------- */
/* TEMPLATE CONTEXT                                   */
/* -------------------------------------------------- */

function getTemplateContext(template: string) {
  switch (template) {

    /* ================================================= */
    /* THEME 1: MEDIEVAL KINGDOM                         */
    /* ================================================= */

    case 'medieval_kingdom':
      return {
        theme: `
You are an expert SQL quest designer narrating a medieval fantasy kingdom set in Camelot.
Use language involving kings, knights, royal departments, arcane councils, and court projects.
`,
        schema: `
TABLE: DEPARTMENT(Dnumber, Dname, Mgr_ssn, Mgr_start_date)
TABLE: EMPLOYEES(Fname, Lname, Ssn, Sex, Salary, Super_ssn, Dno)
TABLE: PROJECT(Pnumber, Pname, Plocation, Dnum)
TABLE: WORKS_ON(Essn, Pno, Hours)

Relationships:
- EMPLOYEES.Dno → DEPARTMENT.Dnumber
- EMPLOYEES.Super_ssn → EMPLOYEES.Ssn
- PROJECT.Dnum → DEPARTMENT.Dnumber
- WORKS_ON.Essn → EMPLOYEES.Ssn
- WORKS_ON.Pno → PROJECT.Pnumber
`,
        seedData: `
DEPARTMENT:
(1, 'Royal Guard', '111111111', '1400-01-01')
(2, 'Arcane Council', '444444444', '1400-01-01')
(5, 'Research', '555555555', '1400-01-01')

EMPLOYEES:
('King', 'Arthur', '111111111', 'M', 90000, NULL, 1)
('Sir', 'Lancelot', '222222222', 'M', 60000, '111111111', 1)
('Sir', 'Gawain', '333333333', 'M', 45000, '222222222', 1)
('Lady', 'Guinevere', '444444444', 'F', 70000, '111111111', 2)
('Merlin', 'Ambrosius', '555555555', 'M', 80000, '444444444', 5)

PROJECT:
(10, 'Excalibur Forge', 'Camelot', 1)
(20, 'Mage Registry', 'Avalon', 2)
(30, 'Alchemy Lab', 'Houston', 5)

WORKS_ON:
('222222222', 10, 20.0)
('333333333', 10, 15.0)
('444444444', 20, 25.0)
`,
      };

    /* ================================================= */
    /* THEME 2: THE BACHCHAN VAULT                       */
    /* ================================================= */

    case 'bachchan_vault':
      return {
        theme: `
You are an expert SQL quest designer curating The Bachchan Vault — 
a legendary archive centered around Amitabh Bachchan’s film career.
Use film-industry language and treat Amitabh Bachchan as the central figure.
`,
        schema: `
TABLE: ACTOR(Act_id, Act_Name, Act_Gender)
TABLE: DIRECTOR(Dir_id, Dir_Name, Dir_Phone)
TABLE: MOVIES(Mov_id, Mov_Title, Mov_Year, Mov_Lang, Dir_id)
TABLE: MOVIE_CAST(Act_id, Mov_id, Role)
TABLE: RATING(Mov_id, Rev_Stars)

Relationships:
- MOVIES.Dir_id → DIRECTOR.Dir_id
- MOVIE_CAST.Act_id → ACTOR.Act_id
- MOVIE_CAST.Mov_id → MOVIES.Mov_id
- RATING.Mov_id → MOVIES.Mov_id
`,
        seedData: `
DIRECTOR:
(101, 'Yash Chopra', '9820098200')
(102, 'Ramesh Sippy', '9821198211')
(103, 'Shoojit Sircar', '9833398333')

ACTOR:
(201, 'Amitabh Bachchan', 'M')
(202, 'Shashi Kapoor', 'M')
(203, 'Taapsee Pannu', 'F')

MOVIES:
(301, 'Deewaar', 1975, 'Hindi', 101)
(302, 'Sholay', 1975, 'Hindi', 102)
(303, 'Pink', 2016, 'Hindi', 103)

MOVIE_CAST:
(201, 301, 'Vijay Verma')
(201, 302, 'Jai')
(201, 303, 'Deepak Sehgal')
(202, 301, 'Ravi Verma')
(203, 303, 'Minal Arora')

RATING:
(301, 5)
(302, 5)
(303, 4)
`,
      };

    /* ================================================= */
    /* THEME 3: DESI TRADERS                             */
    /* ================================================= */

    case 'desi_traders':
      return {
        theme: `
You are an expert SQL quest designer narrating a bustling Indian trading ecosystem.
Use practical business language involving salesmen, customers, cities, and orders.
`,
        schema: `
TABLE: SALESMAN(Salesman_id, Name, City, Commission)
TABLE: CUSTOMER(Customer_id, Cust_Name, City, Grade, Salesman_id)
TABLE: ORDERS(Ord_No, Purchase_Amt, Ord_Date, Customer_id, Salesman_id)

Relationships:
- CUSTOMER.Salesman_id → SALESMAN.Salesman_id
- ORDERS.Customer_id → CUSTOMER.Customer_id
- ORDERS.Salesman_id → SALESMAN.Salesman_id
`,
        seedData: `
SALESMAN:
(1000, 'Ramesh Gupta', 'Bangalore', 15.00)
(1001, 'Suresh Menon', 'Mumbai', 12.00)
(1002, 'Priya Sharma', 'Delhi', 11.00)

CUSTOMER:
(5001, 'Anjali', 'Bangalore', 200, 1000)
(5002, 'Rahul', 'Bangalore', 300, 1000)
(5003, 'Tina', 'Delhi', 100, 1002)

ORDERS:
(70001, 15000.00, '2023-10-05', 5001, 1000)
(70002, 5000.50, '2023-10-06', 5002, 1000)
`,
      };

    default:
      throw new Error('Unknown template');
  }
}

/* -------------------------------------------------- */
/* AI PROMPT                                          */
/* -------------------------------------------------- */

// 1. Update the Schema to remove 'template' - the AI doesn't need it inside the prompt
const GenerateQuestPromptSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

const generateQuestPrompt = ai.definePrompt({
  name: 'generateSQLQuestFromTemplate',
  // Use the specific schema for the AI content
  input: { 
    schema: GenerateQuestPromptSchema,
    templateContext: z.any() // Allow the context to be passed in
  },
  output: {
    schema: z.object({
      longDescription: z.string(),
      correctQuery: z.string(),
    }),
  },
  prompt: `
{{templateContext.theme}}

DATABASE SCHEMA:
{{templateContext.schema}}

SEED DATA:
{{templateContext.seedData}}

QUEST TITLE:
{{title}}

SHORT DESCRIPTION:
{{shortDescription}}

DIFFICULTY:
{{difficulty}}

INSTRUCTIONS: The english needs to be simple and the text needs to generated in such a way that it can be executed in a single query(no questions with multiple query solutions).Keep the schema in mind
`,
});

export async function generateQuestFromTemplate(input: GenerateQuestInput) {
  // 1. Logic: Select the context locally
  const templateContext = getTemplateContext(input.template);

  // 2. Execution: Only pass the specific fields the prompt template needs
  const { output } = await generateQuestPrompt({
    title: input.title,
    shortDescription: input.shortDescription,
    difficulty: input.difficulty,
    templateContext,
  });

  if (!output) throw new Error('AI failed to generate quest');

  return {
    longDescription: output.longDescription.trim(),
    correctQuery: output.correctQuery.trim(),
  };
}