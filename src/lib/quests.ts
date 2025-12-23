import type { Quest } from './types/quests';

export const quests: Quest[] = [
  // --- SECTION 1: BASICS ---
  {
    id: 'select-basics',
    title: 'The SELECT Statement',
    description: 'Learn to retrieve data from a table.',
    longDescription:
      "The kingdom's scribe has recorded all the royal employees in a table, but the records are magically sealed. Use your SQL knowledge to unseal them! Write a query to select all columns and all rows from the `EMPLOYEES` table.",
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: 'SELECT * FROM EMPLOYEES;',
    correctQuery: 'SELECT * FROM EMPLOYEES',
    successMessage:
      'You have successfully retrieved all employee records. Great job!',
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Ssn', type: 'CHAR(9)' },
        { name: 'Sex', type: 'CHAR(1)' },
        { name: 'Salary', type: 'INT' },
        { name: 'Super_ssn', type: 'CHAR(9)' },
        { name: 'Dno', type: 'INT' },
      ],
    }],
    resultData: [
      { Fname: 'King', Lname: 'Arthur', Ssn: '111111111', Sex: 'M', Salary: 90000, Super_ssn: null, Dno: 1 },
      { Fname: 'Sir', Lname: 'Lancelot', Ssn: '222222222', Sex: 'M', Salary: 60000, Super_ssn: '111111111', Dno: 1 },
      { Fname: 'Sir', Lname: 'Gawain', Ssn: '333333333', Sex: 'M', Salary: 45000, Super_ssn: '222222222', Dno: 1 },
      { Fname: 'Lady', Lname: 'Guinevere', Ssn: '444444444', Sex: 'F', Salary: 70000, Super_ssn: '111111111', Dno: 2 },
      { Fname: 'Merlin', Lname: 'Ambrosius', Ssn: '555555555', Sex: 'M', Salary: 80000, Super_ssn: '444444444', Dno: 5 },
      { Fname: 'Franklin', Lname: 'Wong', Ssn: '666666666', Sex: 'M', Salary: 42000, Super_ssn: '555555555', Dno: 5 },
    ],
  },
  {
    id: 'where-clause',
    title: 'The WHERE Clause',
    description: 'Filter records based on a condition.',
    longDescription:
      'The royal treasurer wants a list of all employees who earn more than 70,000 gold pieces. Use the WHERE clause to filter the `EMPLOYEES` table and find these high-earners.',
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: 'SELECT Fname, Lname FROM EMPLOYEES\nWHERE Salary > 70000;',
    correctQuery: 'SELECT Fname, Lname FROM EMPLOYEES WHERE Salary > 70000',
    successMessage: 'Excellent! You have successfully filtered the records.',
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Salary', type: 'INT' },
      ],
    }],
    resultData: [
      { Fname: 'King', Lname: 'Arthur' },
      { Fname: 'Merlin', Lname: 'Ambrosius' },
    ],
  },
  {
    id: 'insert-knight',
    title: 'INSERT Knight',
    description: 'Master adding new rows of data.',
    longDescription: 'A new knight, Sir Galahad, has joined the Round Table! His salary is 55,000, SSN is 777777777, he reports to Sir Lancelot (222222222), and works in department 1. Your task is to insert a new record for him into the `EMPLOYEES` table.',
    difficulty: 'Beginner',
    category: 'SQL Basics',
    initialQuery: "INSERT INTO EMPLOYEES (Fname, Lname, Ssn, Sex, Salary, Super_ssn, Dno)\nVALUES ('Sir', 'Galahad', '777777777', 'M', 55000, '222222222', 1);",
    correctQuery: "INSERT INTO EMPLOYEES (Fname, Lname, Ssn, Sex, Salary, Super_ssn, Dno) VALUES ('Sir', 'Galahad', '777777777', 'M', 55000, '222222222', 1)",
    successMessage: 'Well done! Sir Galahad has been successfully added to the records.',
     schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Ssn', type: 'CHAR(9)' },
        { name: 'Sex', type: 'CHAR(1)' },
        { name: 'Salary', type: 'INT' },
        { name: 'Super_ssn', type: 'CHAR(9)' },
        { name: 'Dno', type: 'INT' },
      ],
    }],
    resultData: [],
  },

  // --- SECTION 2: INTERMEDIATE CONCEPTS ---
  {
    id: 'logical-knights',
    title: 'Logic of the Knights',
    description: 'Use AND to combine multiple conditions.',
    longDescription: "The King needs a specific knight for a dangerous mission. Find all employees in department 1 (Royal Guard) who earn less than 65,000 gold pieces.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT * FROM EMPLOYEES\nWHERE Dno = 1 AND Salary < 65000;",
    correctQuery: "SELECT * FROM EMPLOYEES WHERE Dno = 1 AND Salary < 65000",
    successMessage: "You've found the perfect candidate for the mission!",
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Salary', type: 'INT' },
        { name: 'Dno', type: 'INT' },
      ],
    }],
    resultData: [
      { Fname: 'Sir', Lname: 'Lancelot', Ssn: '222222222', Sex: 'M', Salary: 60000, Super_ssn: '111111111', Dno: 1 },
      { Fname: 'Sir', Lname: 'Gawain', Ssn: '333333333', Sex: 'M', Salary: 45000, Super_ssn: '222222222', Dno: 1 },
    ],
  },
   {
    id: 'update-wizard',
    title: 'UPDATE Wizard',
    description: 'Become a wizard of data modification.',
    longDescription: "Merlin's exceptional service has earned him a raise! Update his salary in the `EMPLOYEES` table to 85,000.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "UPDATE EMPLOYEES\nSET Salary = 85000\nWHERE Ssn = '555555555';",
    correctQuery: "UPDATE EMPLOYEES SET Salary = 85000 WHERE Ssn = '555555555'",
    successMessage: "Merlin is pleased! You've successfully updated his salary.",
     schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Ssn', type: 'CHAR(9)' },
        { name: 'Salary', type: 'INT' },
      ],
    }],
    resultData: [],
  },
  {
    id: 'order-treasure',
    title: 'The Wealthiest',
    description: 'Sort results using ORDER BY.',
    longDescription: "The King wants to see his payroll in order. Select all employees and order them by their `Salary` in descending order (highest salary first).",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT * FROM EMPLOYEES\nORDER BY Salary DESC;",
    correctQuery: "SELECT * FROM EMPLOYEES ORDER BY Salary DESC",
    successMessage: "The list is now perfectly ordered from richest to poorest.",
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Salary', type: 'INT' },
      ],
    }],
    resultData: [
      { Fname: 'King', Lname: 'Arthur', Ssn: '111111111', Sex: 'M', Salary: 90000, Super_ssn: null, Dno: 1 },
      { Fname: 'Merlin', Lname: 'Ambrosius', Ssn: '555555555', Sex: 'M', Salary: 80000, Super_ssn: '444444444', Dno: 5 },
      { Fname: 'Lady', Lname: 'Guinevere', Ssn: '444444444', Sex: 'F', Salary: 70000, Super_ssn: '111111111', Dno: 2 },
      { Fname: 'Sir', Lname: 'Lancelot', Ssn: '222222222', Sex: 'M', Salary: 60000, Super_ssn: '111111111', Dno: 1 },
      { Fname: 'Sir', Lname: 'Gawain', Ssn: '333333333', Sex: 'M', Salary: 45000, Super_ssn: '222222222', Dno: 1 },
      { Fname: 'Franklin', Lname: 'Wong', Ssn: '666666666', Sex: 'M', Salary: 42000, Super_ssn: '555555555', Dno: 5 },
    ],
  },
  {
    id: 'count-staff',
    title: 'The Royal Headcount',
    description: 'Use COUNT to aggregate data.',
    longDescription: "The King has lost track of how many people work in the castle. Use the COUNT function to return the total number of rows in the `EMPLOYEES` table.",
    difficulty: 'Intermediate',
    category: 'SQL Basics',
    initialQuery: "SELECT COUNT(*) as total_staff FROM EMPLOYEES;",
    correctQuery: "SELECT COUNT(*) as total_staff FROM EMPLOYEES",
    successMessage: "You've successfully counted the staff!",
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
      ],
    }],
    resultData: [
        { total_staff: 6 }
    ],
  },
  {
    id: 'join-juggler',
    title: 'The JOIN Juggler',
    description: 'Combine rows from two or more tables.',
    longDescription: "Let's see the department for each employee. Combine the `EMPLOYEES` and `DEPARTMENT` tables to show each employee's first and last name along with their department's name. The tables are linked by `Dno` and `Dnumber`.",
    difficulty: 'Advanced',
    category: 'SQL Basics',
    initialQuery: "SELECT e.Fname, e.Lname, d.Dname\nFROM EMPLOYEES e\nJOIN DEPARTMENT d ON e.Dno = d.Dnumber;",
    correctQuery: "SELECT e.Fname, e.Lname, d.Dname FROM EMPLOYEES e JOIN DEPARTMENT d ON e.Dno = d.Dnumber",
    successMessage: "Fantastic! You've successfully joined the tables and revealed the department for each employee.",
    schema: [
      {
        tableName: 'EMPLOYEES',
        columns: [
            { name: 'Fname', type: 'VARCHAR(20)' },
            { name: 'Lname', type: 'VARCHAR(20)' },
            { name: 'Dno', type: 'INT' },
        ],
      },
      {
        tableName: 'DEPARTMENT',
        columns: [
            { name: 'Dnumber', type: 'INT' },
            { name: 'Dname', type: 'VARCHAR(50)' },
        ],
      }
    ],
    resultData: [
      { Fname: 'King', Lname: 'Arthur', Dname: 'Royal Guard' },
      { Fname: 'Sir', Lname: 'Lancelot', Dname: 'Royal Guard' },
      { Fname: 'Sir', Lname: 'Gawain', Dname: 'Royal Guard' },
      { Fname: 'Lady', Lname: 'Guinevere', Dname: 'Arcane Council' },
      { Fname: 'Merlin', Lname: 'Ambrosius', Dname: 'Research' },
      { Fname: 'Franklin', Lname: 'Wong', Dname: 'Research' },
    ],
  },
  {
    id: 'group-by-roles',
    title: 'Department Salary Analysis',
    description: 'Group data and calculate averages.',
    longDescription: "The King wants to know the average salary for each department in the kingdom. Use GROUP BY to group the employees by `Dno` and calculate the average `Salary` for each group.",
    difficulty: 'Advanced',
    category: 'SQL Basics',
    initialQuery: "SELECT Dno, AVG(Salary) as avg_salary\nFROM EMPLOYEES\nGROUP BY Dno;",
    correctQuery: "SELECT Dno, AVG(Salary) as avg_salary FROM EMPLOYEES GROUP BY Dno",
    successMessage: "Insightful! You've successfully analyzed the salary distribution.",
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Dno', type: 'INT' },
        { name: 'Salary', type: 'INT' },
      ],
    }],
    resultData: [
        { Dno: 1, avg_salary: 65000 },
        { Dno: 2, avg_salary: 70000 },
        { Dno: 5, avg_salary: 61000 }
    ],
  },

  // --- SECTION 3: ADVANCED ---
  {
    id: 'subquery-superstar',
    title: 'Nested Query Quest',
    description: 'Use a subquery to filter data.',
    longDescription: "The King wants to identify the elite earners. Select the first and last names of all employees whose salary is greater than the average salary of all employees. You will need to use a subquery to calculate the average first.",
    difficulty: 'Advanced',
    category: 'SQL Advanced',
    initialQuery: "SELECT Fname, Lname FROM EMPLOYEES\nWHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEES);",
    correctQuery: "SELECT Fname, Lname FROM EMPLOYEES WHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEES)",
    successMessage: "You've successfully identified the top earners using a subquery!",
    schema: [{
      tableName: 'EMPLOYEES',
      columns: [
        { name: 'Fname', type: 'VARCHAR(20)' },
        { name: 'Lname', type: 'VARCHAR(20)' },
        { name: 'Salary', type: 'INT' },
      ],
    }],
    resultData: [
        { Fname: 'King', Lname: 'Arthur' },
        { Fname: 'Lady', Lname: 'Guinevere' },
        { Fname: 'Merlin', Lname: 'Ambrosius' }
    ],
  },
  {
    id: 'triple-join-projects',
    title: 'Project Personnel Analysis',
    description: 'Join three tables to analyze project contributions.',
    longDescription: "The board needs a report on project locations. Retrieve the Employee's Last Name, the Project Name they are working on, and their total Hours, but only for projects located in 'Houston'.",
    difficulty: 'Advanced',
    category: 'Relational Joins',
    initialQuery: "SELECT e.Lname, p.Pname, w.Hours\nFROM EMPLOYEES e\nJOIN WORKS_ON w ON e.Ssn = w.Essn\nJOIN PROJECT p ON w.Pno = p.Pnumber\nWHERE p.Plocation = 'Houston';",
    correctQuery: "SELECT e.Lname, p.Pname, w.Hours FROM EMPLOYEES e JOIN WORKS_ON w ON e.Ssn = w.Essn JOIN PROJECT p ON w.Pno = p.Pnumber WHERE p.Plocation = 'Houston'",
    successMessage: "Masterful! You successfully traversed a Many-to-Many relationship.",
    schema: [
      { tableName: 'EMPLOYEES', columns: [{ name: 'Lname', type: 'VARCHAR(20)' }, { name: 'Ssn', type: 'CHAR(9)' }] },
      { tableName: 'PROJECT', columns: [{ name: 'Pname', type: 'VARCHAR(50)' }, { name: 'Pnumber', type: 'INT' }, { name: 'Plocation', type: 'VARCHAR(50)' }] },
      { tableName: 'WORKS_ON', columns: [{ name: 'Essn', type: 'CHAR(9)' }, { name: 'Pno', type: 'INT' }, { name: 'Hours', type: 'DECIMAL(4,1)' }] }
    ],
    resultData: [
      { Lname: 'Ambrosius', Pname: 'Alchemy Lab', Hours: 30.0 },
      { Lname: 'Wong', Pname: 'Alchemy Lab', Hours: 10.0 }
    ]
  },
  {
    id: 'self-join-managers',
    title: 'The Supervisor Search',
    description: 'Use a self-join to identify managers.',
    longDescription: "Every knight needs a leader. Retrieve the First Name of every employee along with the First Name of their direct supervisor. Use a self-join on the EMPLOYEES table.",
    difficulty: 'Advanced',
    category: 'Relational Joins',
    initialQuery: "SELECT e.Fname as Employee, s.Fname as Supervisor\nFROM EMPLOYEES e\nJOIN EMPLOYEES s ON e.Super_ssn = s.Ssn;",
    correctQuery: "SELECT e.Fname as Employee, s.Fname as Supervisor FROM EMPLOYEES e JOIN EMPLOYEES s ON e.Super_ssn = s.Ssn",
    successMessage: "Correct! Self-joins are essential for hierarchical data.",
    schema: [{ tableName: 'EMPLOYEES', columns: [{ name: 'Fname', type: 'VARCHAR(20)' }, { name: 'Super_ssn', type: 'CHAR(9)' }, { name: 'Ssn', type: 'CHAR(9)' }] }],
    resultData: [
      { Employee: 'Sir', Supervisor: 'King' },
      { Employee: 'Sir', Supervisor: 'Sir' },
      { Employee: 'Lady', Supervisor: 'King' },
      { Employee: 'Merlin', Supervisor: 'Lady' },
      { Employee: 'Franklin', Supervisor: 'Merlin' }
    ]
  },
  {
    id: 'nested-department-avg',
    title: 'Departmental Elite',
    description: 'Complex subquery with departmental grouping.',
    longDescription: "Find the names of employees who earn more than the average salary of the 'Research' department (Dnumber 5).",
    difficulty: 'Advanced',
    category: 'SQL Advanced',
    initialQuery: "SELECT Fname, Lname FROM EMPLOYEES\nWHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEES WHERE Dno = 5);",
    correctQuery: "SELECT Fname, Lname FROM EMPLOYEES WHERE Salary > (SELECT AVG(Salary) FROM EMPLOYEES WHERE Dno = 5)",
    successMessage: "Excellent! You've combined aggregation with a filtered subquery.",
    schema: [{ tableName: 'EMPLOYEES', columns: [{ name: 'Fname', type: 'VARCHAR(20)' }, { name: 'Lname', type: 'VARCHAR(20)' }, { name: 'Salary', type: 'INT' }, { name: 'Dno', type: 'INT' }] }],
    resultData: [
      { Fname: 'King', Lname: 'Arthur' },
      { Fname: 'Lady', Lname: 'Guinevere' },
      { Fname: 'Merlin', Lname: 'Ambrosius' }
    ]
  }
];