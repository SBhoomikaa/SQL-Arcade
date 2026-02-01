/* ================================================= */
/* THEME 1: MEDIEVAL KINGDOM (Employees & Projects)  */
/* ================================================= */

DROP TABLE IF EXISTS WORKS_ON;
DROP TABLE IF EXISTS PROJECT;
DROP TABLE IF EXISTS EMPLOYEES;
DROP TABLE IF EXISTS DEPARTMENT;

CREATE TABLE DEPARTMENT (
    Dnumber INT PRIMARY KEY,
    Dname VARCHAR(50),
    Mgr_ssn CHAR(9),
    Mgr_start_date DATE
);

CREATE TABLE EMPLOYEES (
    Fname VARCHAR(20),
    Lname VARCHAR(20),
    Ssn CHAR(9) PRIMARY KEY,
    Sex CHAR(1),
    Salary INT,
    Super_ssn CHAR(9),
    Dno INT,
    CONSTRAINT fk_emp_dept FOREIGN KEY (Dno) REFERENCES DEPARTMENT(Dnumber),
    CONSTRAINT fk_emp_super FOREIGN KEY (Super_ssn) REFERENCES EMPLOYEES(Ssn)
);

CREATE TABLE PROJECT (
    Pnumber INT PRIMARY KEY,
    Pname VARCHAR(50),
    Plocation VARCHAR(50),
    Dnum INT,
    CONSTRAINT fk_proj_dept FOREIGN KEY (Dnum) REFERENCES DEPARTMENT(Dnumber)
);

CREATE TABLE WORKS_ON (
    Essn CHAR(9),
    Pno INT,
    Hours DECIMAL(4,1),
    PRIMARY KEY (Essn, Pno),
    CONSTRAINT fk_works_emp FOREIGN KEY (Essn) REFERENCES EMPLOYEES(Ssn),
    CONSTRAINT fk_works_proj FOREIGN KEY (Pno) REFERENCES PROJECT(Pnumber)
);

-- -------------------------
-- STEP 1: DEPARTMENTS (NO MANAGERS YET)
-- -------------------------
INSERT INTO DEPARTMENT (Dnumber, Dname, Mgr_ssn, Mgr_start_date) VALUES
(1, 'Royal Guard', NULL, NULL),
(2, 'Arcane Council', NULL, NULL),
(5, 'Research', NULL, NULL);

-- -------------------------
-- STEP 2: EMPLOYEES (TOP → DOWN)
-- -------------------------
INSERT INTO EMPLOYEES VALUES
('King', 'Arthur', '111111111', 'M', 90000, NULL, 1);

INSERT INTO EMPLOYEES VALUES
('Sir', 'Lancelot', '222222222', 'M', 60000, '111111111', 1),
('Sir', 'Gawain', '333333333', 'M', 45000, '222222222', 1),
('Lady', 'Guinevere', '444444444', 'F', 70000, '111111111', 2),
('Merlin', 'Ambrosius', '555555555', 'M', 80000, '444444444', 5);

-- -------------------------
-- STEP 3: ASSIGN MANAGERS
-- -------------------------
UPDATE DEPARTMENT SET Mgr_ssn='111111111', Mgr_start_date='1400-01-01' WHERE Dnumber=1;
UPDATE DEPARTMENT SET Mgr_ssn='444444444', Mgr_start_date='1400-01-01' WHERE Dnumber=2;
UPDATE DEPARTMENT SET Mgr_ssn='555555555', Mgr_start_date='1400-01-01' WHERE Dnumber=5;

-- -------------------------
-- STEP 4: PROJECTS
-- -------------------------
INSERT INTO PROJECT VALUES
(10, 'Excalibur Forge', 'Camelot', 1),
(20, 'Mage Registry', 'Avalon', 2),
(30, 'Alchemy Lab', 'Houston', 5);

-- -------------------------
-- STEP 5: WORKS_ON
-- -------------------------
INSERT INTO WORKS_ON VALUES
('222222222', 10, 20.0),
('333333333', 10, 15.0),
('444444444', 20, 25.0);




/* ================================================= */
/* THEME 2: THE BACHCHAN VAULT (Movies)              */
/* ================================================= */

DROP TABLE IF EXISTS RATING;
DROP TABLE IF EXISTS MOVIE_CAST;
DROP TABLE IF EXISTS MOVIES;
DROP TABLE IF EXISTS DIRECTOR;
DROP TABLE IF EXISTS ACTOR;

CREATE TABLE ACTOR (
    Act_id INT PRIMARY KEY,
    Act_Name VARCHAR(50),
    Act_Gender CHAR(1)
);

CREATE TABLE DIRECTOR (
    Dir_id INT PRIMARY KEY,
    Dir_Name VARCHAR(50),
    Dir_Phone VARCHAR(15)
);

CREATE TABLE MOVIES (
    Mov_id INT PRIMARY KEY,
    Mov_Title VARCHAR(100),
    Mov_Year INT,
    Mov_Lang VARCHAR(20),
    Dir_id INT,
    FOREIGN KEY (Dir_id) REFERENCES DIRECTOR(Dir_id)
);

CREATE TABLE MOVIE_CAST (
    Act_id INT,
    Mov_id INT,
    Role VARCHAR(50),
    PRIMARY KEY (Act_id, Mov_id),
    FOREIGN KEY (Act_id) REFERENCES ACTOR(Act_id),
    FOREIGN KEY (Mov_id) REFERENCES MOVIES(Mov_id)
);

CREATE TABLE RATING (
    Mov_id INT PRIMARY KEY,
    Rev_Stars INT,
    FOREIGN KEY (Mov_id) REFERENCES MOVIES(Mov_id)
);

-- Data
INSERT INTO DIRECTOR VALUES
(101, 'Yash Chopra', '9820098200'),
(102, 'Ramesh Sippy', '9821198211'),
(103, 'Shoojit Sircar', '9833398333');

INSERT INTO ACTOR VALUES
(201, 'Amitabh Bachchan', 'M'),
(202, 'Shashi Kapoor', 'M'),
(203, 'Taapsee Pannu', 'F');

INSERT INTO MOVIES VALUES
(301, 'Deewaar', 1975, 'Hindi', 101),
(302, 'Sholay', 1975, 'Hindi', 102),
(303, 'Pink', 2016, 'Hindi', 103);

INSERT INTO MOVIE_CAST VALUES
(201, 301, 'Vijay Verma'),
(201, 302, 'Jai'),
(201, 303, 'Deepak Sehgal'),
(202, 301, 'Ravi Verma'),
(203, 303, 'Minal Arora');

INSERT INTO RATING VALUES
(301, 5),
(302, 5),
(303, 4);



/* ================================================= */
/* THEME 3: DESI TRADERS (Orders/Sales)              */
/* ================================================= */

DROP TABLE IF EXISTS ORDERS;
DROP TABLE IF EXISTS CUSTOMER;
DROP TABLE IF EXISTS SALESMAN;

CREATE TABLE SALESMAN (
    Salesman_id INT PRIMARY KEY,
    Name VARCHAR(50),
    City VARCHAR(50),
    Commission DECIMAL(5,2)
);

CREATE TABLE CUSTOMER (
    Customer_id INT PRIMARY KEY,
    Cust_Name VARCHAR(50),
    City VARCHAR(50),
    Grade INT,
    Salesman_id INT,
    FOREIGN KEY (Salesman_id) REFERENCES SALESMAN(Salesman_id) ON DELETE CASCADE
);

CREATE TABLE ORDERS (
    Ord_No INT PRIMARY KEY,
    Purchase_Amt DECIMAL(10,2),
    Ord_Date DATE,
    Customer_id INT,
    Salesman_id INT,
    FOREIGN KEY (Customer_id) REFERENCES CUSTOMER(Customer_id),
    FOREIGN KEY (Salesman_id) REFERENCES SALESMAN(Salesman_id) ON DELETE CASCADE
);

-- Data
INSERT INTO SALESMAN VALUES
(1000, 'Ramesh Gupta', 'Bangalore', 15.00),
(1001, 'Suresh Menon', 'Mumbai', 12.00),
(1002, 'Priya Sharma', 'Delhi', 11.00);

INSERT INTO CUSTOMER VALUES
(5001, 'Anjali', 'Bangalore', 200, 1000),
(5002, 'Rahul', 'Bangalore', 300, 1000),
(5003, 'Tina', 'Delhi', 100, 1002);

INSERT INTO ORDERS VALUES
(70001, 15000.00, '2023-10-05', 5001, 1000),
(70002, 5000.50, '2023-10-06', 5002, 1000);