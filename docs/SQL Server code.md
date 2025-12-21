-- Run in your SQL Workbench or terminal

CREATE DATABASE IF NOT EXISTS sql_playground;
USE sql_playground;

-- Drop in reverse order of dependencies to avoid FK errors
DROP TABLE IF EXISTS DEPENDENT;
DROP TABLE IF EXISTS WORKS_ON;
DROP TABLE IF EXISTS PROJECT;
DROP TABLE IF EXISTS DEPT_LOCATIONS;
DROP TABLE IF EXISTS EMPLOYEE;
DROP TABLE IF EXISTS DEPARTMENT;

-- 1. DEPARTMENT (Created first for FK references)
CREATE TABLE DEPARTMENT (
    Dname VARCHAR(50) NOT NULL,
    Dnumber INT PRIMARY KEY,
    Mgr_ssn CHAR(9),
    Mgr_start_date DATE,
    UNIQUE (Dname)
);

-- 2. EMPLOYEE
CREATE TABLE EMPLOYEE (
    Fname VARCHAR(15) NOT NULL,
    Minit CHAR(1),
    Lname VARCHAR(15) NOT NULL,
    Ssn CHAR(9) PRIMARY KEY,
    Bdate DATE,
    Address VARCHAR(30),
    Sex CHAR(1),
    Salary DECIMAL(10, 2),
    Super_ssn CHAR(9),
    Dno INT NOT NULL,
    FOREIGN KEY (Super_ssn) REFERENCES EMPLOYEE(Ssn),
    FOREIGN KEY (Dno) REFERENCES DEPARTMENT(Dnumber)
);

-- Circular FK: Assign Manager
ALTER TABLE DEPARTMENT ADD FOREIGN KEY (Mgr_ssn) REFERENCES EMPLOYEE(Ssn);

-- 3. DEPT_LOCATIONS
CREATE TABLE DEPT_LOCATIONS (
    Dnumber INT NOT NULL,
    Dlocation VARCHAR(15) NOT NULL,
    PRIMARY KEY (Dnumber, Dlocation),
    FOREIGN KEY (Dnumber) REFERENCES DEPARTMENT(Dnumber)
);

-- 4. PROJECT
CREATE TABLE PROJECT (
    Pname VARCHAR(15) NOT NULL,
    Pnumber INT PRIMARY KEY,
    Plocation VARCHAR(15),
    Dnum INT NOT NULL,
    FOREIGN KEY (Dnum) REFERENCES DEPARTMENT(Dnumber),
    UNIQUE (Pname)
);

-- 5. WORKS_ON (Many-to-Many relationship)
CREATE TABLE WORKS_ON (
    Essn CHAR(9) NOT NULL,
    Pno INT NOT NULL,
    Hours DECIMAL(3, 1),
    PRIMARY KEY (Essn, Pno),
    FOREIGN KEY (Essn) REFERENCES EMPLOYEE(Ssn),
    FOREIGN KEY (Pno) REFERENCES PROJECT(Pnumber)
);

-- 6. DEPENDENT
CREATE TABLE DEPENDENT (
    Essn CHAR(9) NOT NULL,
    Dependent_name VARCHAR(15) NOT NULL,
    Sex CHAR(1),
    Bdate DATE,
    Relationship VARCHAR(8),
    PRIMARY KEY (Essn, Dependent_name),
    FOREIGN KEY (Essn) REFERENCES EMPLOYEE(Ssn)
);

-- Seed Data for the new Complex Quests
INSERT INTO DEPARTMENT (Dname, Dnumber, Mgr_start_date) VALUES ('Headquarters', 1, '1981-06-19'), ('Research', 5, '1988-05-22');
INSERT INTO EMPLOYEE VALUES 
('James', 'E', 'Borg', '888665555', '1937-11-10', '450 Stone, Houston, TX', 'M', 55000, NULL, 1),
('Franklin', 'T', 'Wong', '333445555', '1955-12-08', '638 Voss, Houston, TX', 'M', 40000, '888665555', 5),
('Jennifer', 'S', 'Wallace', '987654321', '1941-06-20', '291 Berry, Bellaire, TX', 'F', 43000, '888665555', 1);

UPDATE DEPARTMENT SET Mgr_ssn = '888665555' WHERE Dnumber = 1;
UPDATE DEPARTMENT SET Mgr_ssn = '333445555' WHERE Dnumber = 5;

INSERT INTO PROJECT VALUES ('ProductX', 1, 'Bellaire', 5), ('Reorganization', 20, 'Houston', 1);
INSERT INTO WORKS_ON VALUES ('333445555', 1, 32.5), ('987654321', 20, 15.0);