import type { Quest } from './types/quests';

export const quests: Quest[] = [
  // --- SECTION 1: BASICS ---
  {
    id: 'select-basics',
    title: 'The SELECT Statement',
    description: 'Learn to retrieve data from a table.',
    longDescription:
      "The kingdom's scribe has recorded all the royal employees in a table, but the records are magically sealed. Use your SQL knowledge to unseal them! Write a query to select all columns and all rows from the `employees` table.",
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: 'SELECT * FROM employees;',
    correctQuery: 'SELECT * FROM employees',
    successMessage:
      'You have successfully retrieved all employee records. Great job!',
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
      { id: 1, name: 'King Arthur', role: 'King', salary: 100000 },
      { id: 2, name: 'Merlin', role: 'Wizard', salary: 80000 },
      { id: 3, name: 'Lancelot', role: 'Knight', salary: 60000 },
      { id: 4, name: 'Guenevere', role: 'Queen', salary: 90000 },
    ],
  },
  {
    id: 'where-clause',
    title: 'The WHERE Clause',
    description: 'Filter records based on a condition.',
    longDescription:
      'The royal treasurer wants a list of all employees who earn more than 70,000 gold pieces. Use the WHERE clause to filter the `employees` table and find these high-earners.',
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: 'SELECT name, role, salary FROM employees\nWHERE salary > 70000;',
    correctQuery: 'SELECT name, role, salary FROM employees WHERE salary > 70000',
    successMessage: 'Excellent! You have successfully filtered the records.',
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
      { name: 'King Arthur', role: 'King', salary: 100000 },
      { name: 'Merlin', role: 'Wizard', salary: 80000 },
      { name: 'Guenevere', role: 'Queen', salary: 90000 },
    ],
  },
  {
    id: 'insert-knight',
    title: 'INSERT Knight',
    description: 'Master adding new rows of data.',
    longDescription: 'A new knight, Sir Galahad, has joined the Round Table! His salary is 55,000. Your task is to insert a new record for him into the `employees` table. His ID should be 5.',
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: "INSERT INTO employees (id, name, role, salary)\nVALUES (5, 'Sir Galahad', 'Knight', 55000);",
    correctQuery: "INSERT INTO employees (id, name, role, salary) VALUES (5, 'Sir Galahad', 'Knight', 55000)",
    successMessage: 'Well done! Sir Galahad has been successfully added to the records.',
     schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { id: 5, name: 'Sir Galahad', role: 'Knight', salary: 55000 }
    ],
  },

  // --- SECTION 2: INTERMEDIATE CONCEPTS ---
  {
    id: 'logical-knights',
    title: 'Logic of the Knights',
    description: 'Use AND to combine multiple conditions.',
    longDescription: "The King needs a specific knight for a dangerous mission. Find all employees who have the role of 'Knight' AND earn less than 65,000 gold pieces.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT * FROM employees\nWHERE role = 'Knight' AND salary < 65000;",
    correctQuery: "SELECT * FROM employees WHERE role = 'Knight' AND salary < 65000",
    successMessage: "You've found the perfect candidate for the mission!",
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
      { id: 3, name: 'Lancelot', role: 'Knight', salary: 60000 },
    ],
  },
   {
    id: 'update-wizard',
    title: 'UPDATE Wizard',
    description: 'Become a wizard of data modification.',
    longDescription: "Merlin's exceptional service has earned him a raise! Update his salary in the `employees` table to 85,000.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "UPDATE employees\nSET salary = 85000\nWHERE name = 'Merlin';",
    correctQuery: "UPDATE employees SET salary = 85000 WHERE name = 'Merlin'",
    successMessage: "Merlin is pleased! You've successfully updated his salary.",
     schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { name: 'Merlin', role: 'Wizard', salary: 85000 }
    ],
  },
  {
    id: 'order-treasure',
    title: 'The Wealthiest',
    description: 'Sort results using ORDER BY.',
    longDescription: "The King wants to see his payroll in order. Select all employees and order them by their `salary` in descending order (highest salary first).",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT * FROM employees\nORDER BY salary DESC;",
    correctQuery: "SELECT * FROM employees ORDER BY salary DESC",
    successMessage: "The list is now perfectly ordered from richest to poorest.",
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
      { id: 1, name: 'King Arthur', role: 'King', salary: 100000 },
      { id: 4, name: 'Guenevere', role: 'Queen', salary: 90000 },
      { id: 2, name: 'Merlin', role: 'Wizard', salary: 85000 },
      { id: 3, name: 'Lancelot', role: 'Knight', salary: 60000 },
    ],
  },
  {
    id: 'key-master',
    title: 'The Key Master',
    description: 'Understand Primary and Foreign Keys.',
    longDescription: "This is a conceptual quest. A primary key uniquely identifies each record in a table. A foreign key is a key used to link two tables together. Your task is to identify the primary key in the `employees` table.",
    difficulty: 'Intermediate',
    category: 'Constraints',
    initialQuery: "SELECT 'id' as primary_key;",
    correctQuery: "SELECT 'id' as primary_key",
    successMessage: "Correct! The 'id' column is the primary key as it uniquely identifies each employee.",
     schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { primary_key: 'id' }
    ],
  },
  {
    id: 'unique-names',
    title: 'The Uniqueness Charm',
    description: 'Ensure all values in a column are different.',
    longDescription: 'The kingdom is expanding and we need to ensure every new `department` has a unique name. Your task is to add a UNIQUE constraint to the `name` column of the `departments` table. This will prevent duplicate department names from ever being created.',
    difficulty: 'Intermediate',
    category: 'Constraints',
    initialQuery: 'ALTER TABLE departments\nADD CONSTRAINT uq_department_name UNIQUE (name);',
    correctQuery: 'ALTER TABLE departments ADD CONSTRAINT uq_department_name UNIQUE (name)',
    successMessage: "A powerful charm! You've ensured all department names will be unique, preventing confusion in the kingdom.",
    schema: [{
        tableName: 'departments',
        columns: [
            { name: 'id', type: 'INTEGER' },
            { name: 'name', type: 'TEXT' },
        ],
    }],
    resultData: [
        { 'status': 'Constraint added successfully' }
    ],
  },

  // --- SECTION 3: ADVANCED JOINS & AGGREGATION ---
  {
    id: 'count-staff',
    title: 'The Royal Headcount',
    description: 'Use COUNT to aggregate data.',
    longDescription: "The King has lost track of how many people work in the castle. Use the COUNT function to return the total number of rows in the `employees` table.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT COUNT(*) as total_staff FROM employees;",
    correctQuery: "SELECT COUNT(*) as total_staff FROM employees",
    successMessage: "You've successfully counted the staff!",
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { total_staff: 5 }
    ],
  },
  {
    id: 'join-juggler',
    title: 'The JOIN Juggler',
    description: 'Combine rows from two or more tables.',
    longDescription: "Let's see the department for each employee. Combine the `employees` and `departments` tables to show each employee's name and their department's name. The tables are linked by `department_id`.",
    difficulty: 'Advanced',
    category: 'SQL Basics',
    initialQuery: "SELECT e.name, d.name as department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.id;",
    correctQuery: "SELECT e.name, d.name as department_name FROM employees e JOIN departments d ON e.department_id = d.id",
    successMessage: "Fantastic! You've successfully joined the tables and revealed the department for each employee.",
    schema: [
      {
        tableName: 'employees',
        columns: [
            { name: 'id', type: 'INTEGER' },
            { name: 'name', type: 'TEXT' },
            { name: 'role', type: 'TEXT' },
            { name: 'salary', type: 'INTEGER' },
            { name: 'department_id', type: 'INTEGER' },
        ],
      },
      {
        tableName: 'departments',
        columns: [
            { name: 'id', type: 'INTEGER' },
            { name: 'name', type: 'TEXT' },
        ],
      }
    ],
    resultData: [
      { name: 'King Arthur', department_name: 'Royalty' },
      { name: 'Merlin', department_name: 'Magic' },
      { name: 'Lancelot', department_name: 'Knights' },
      { name: 'Guenevere', department_name: 'Royalty' },
    ],
  },
  {
    id: 'group-by-roles',
    title: 'Role Roll Call',
    description: 'Group data and calculate averages.',
    longDescription: "The King wants to know the average salary for each role in the kingdom. Use GROUP BY to group the employees by `role` and calculate the average `salary` for each group.",
    difficulty: 'Advanced',
    category: 'SQL Basics',
    initialQuery: "SELECT role, AVG(salary) as avg_salary\nFROM employees\nGROUP BY role;",
    correctQuery: "SELECT role, AVG(salary) as avg_salary FROM employees GROUP BY role",
    successMessage: "Insightful! You've successfully analyzed the salary distribution.",
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { role: 'King', avg_salary: 100000 },
        { role: 'Wizard', avg_salary: 85000 },
        { role: 'Knight', avg_salary: 60000 },
        { role: 'Queen', avg_salary: 90000 }
    ],
  },

  // --- SECTION 4: MASTER CLASS (NESTED & CORRELATED) ---
  {
    id: 'subquery-superstar',
    title: 'Nested Query Quest',
    description: 'Use a subquery to filter data.',
    longDescription: "The King wants to identify the elite earners. Select the names of all employees whose salary is greater than the average salary of all employees. You will need to use a subquery to calculate the average first.",
    difficulty: 'Advanced',
    category: 'SQL Advanced',
    initialQuery: "SELECT name FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);",
    correctQuery: "SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
    successMessage: "You've successfully identified the top earners using a subquery!",
    schema: [{
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
      ],
    }],
    resultData: [
        { name: 'King Arthur' },
        { name: 'Guenevere' },
        { name: 'Merlin' }
    ],
  },
  {
    id: 'correlated-champion',
    title: 'Correlated Query Champion',
    description: 'Use a correlated subquery for row-dependent checks.',
    longDescription: "Fairness is key! Find the employees who earn more than the average salary *of their specific department*. This requires a correlated subquery where the inner query references the outer query's department.",
    difficulty: 'Advanced',
    category: 'SQL Advanced',
    initialQuery: "SELECT e.name, e.salary\nFROM employees e\nWHERE e.salary > (\n    SELECT AVG(salary)\n    FROM employees e2\n    WHERE e2.department_id = e.department_id\n);",
    correctQuery: "SELECT e.name, e.salary FROM employees e WHERE e.salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department_id = e.department_id)",
    successMessage: "Incredible! You've mastered one of the hardest concepts: correlated subqueries.",
    schema: [
        {
          tableName: 'employees',
          columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'TEXT' },
              { name: 'role', type: 'TEXT' },
              { name: 'salary', type: 'INTEGER' },
              { name: 'department_id', type: 'INTEGER' },
          ],
        },
        {
          tableName: 'departments',
          columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'TEXT' },
          ],
        }
      ],
    resultData: [
        { name: 'King Arthur', salary: 100000 },
        { name: 'Lancelot', salary: 60000 }
    ],
  },


  {
    id: 'triple-join-projects',
    title: 'Project Personnel Analysis',
    description: 'Join three tables to analyze project contributions.',
    longDescription: "The board needs a report on project locations. Retrieve the Employee's Last Name, the Project Name they are working on, and their total Hours, but only for projects located in 'Houston'.",
    difficulty: 'Advanced',
    category: 'Relational Joins',
    initialQuery: "SELECT e.Lname, p.Pname, w.Hours\nFROM EMPLOYEE e\nJOIN WORKS_ON w ON e.Ssn = w.Essn\nJOIN PROJECT p ON w.Pno = p.Pnumber\nWHERE p.Plocation = 'Houston';",
    correctQuery: "SELECT e.Lname, p.Pname, w.Hours FROM EMPLOYEE e JOIN WORKS_ON w ON e.Ssn = w.Essn JOIN PROJECT p ON w.Pno = p.Pnumber WHERE p.Plocation = 'Houston'",
    successMessage: "Masterful! You successfully traversed a Many-to-Many relationship.",
    schema: [
      { tableName: 'EMPLOYEE', columns: [{ name: 'Lname', type: 'VARCHAR' }] },
      { tableName: 'PROJECT', columns: [{ name: 'Pname', type: 'VARCHAR' }, { name: 'Plocation', type: 'VARCHAR' }] },
      { tableName: 'WORKS_ON', columns: [{ name: 'Hours', type: 'DECIMAL' }] }
    ],
    resultData: [{ Lname: 'Wallace', Pname: 'Reorganization', Hours: 15.0 }]
  },
  {
    id: 'self-join-managers',
    title: 'The Supervisor Search',
    description: 'Use a self-join to identify managers.',
    longDescription: "Every knight needs a leader. Retrieve the First Name of every employee along with the First Name of their direct supervisor. Use a self-join on the EMPLOYEE table.",
    difficulty: 'Advanced',
    category: 'Relational Joins',
    initialQuery: "SELECT e.Fname as Employee, s.Fname as Supervisor\nFROM EMPLOYEE e\nJOIN EMPLOYEE s ON e.Super_ssn = s.Ssn;",
    correctQuery: "SELECT e.Fname as Employee, s.Fname as Supervisor FROM EMPLOYEE e JOIN EMPLOYEE s ON e.Super_ssn = s.Ssn",
    successMessage: "Correct! Self-joins are essential for hierarchical data.",
    schema: [{ tableName: 'EMPLOYEE', columns: [{ name: 'Fname', type: 'VARCHAR' }, { name: 'Super_ssn', type: 'CHAR' }] }],
    resultData: [
      { Employee: 'Franklin', Supervisor: 'James' },
      { Employee: 'Jennifer', Supervisor: 'James' }
    ]
  },
  {
    id: 'nested-department-avg',
    title: 'Departmental Elite',
    description: 'Complex subquery with departmental grouping.',
    longDescription: "Find the names of employees who earn more than the average salary of the 'Research' department (Dnumber 5).",
    difficulty: 'Advanced',
    category: 'SQL Advanced',
    initialQuery: "SELECT Fname, Lname FROM EMPLOYEE\nWHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEE WHERE Dno = 5);",
    correctQuery: "SELECT Fname, Lname FROM EMPLOYEE WHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEE WHERE Dno = 5)",
    successMessage: "Excellent! You've combined aggregation with a filtered subquery.",
    schema: [{ tableName: 'EMPLOYEE', columns: [{ name: 'Fname', type: 'VARCHAR' }, { name: 'Salary', type: 'DECIMAL' }] }],
    resultData: [{ Fname: 'James', Lname: 'Borg' }, { Fname: 'Jennifer', Lname: 'Wallace' }]
  }
];