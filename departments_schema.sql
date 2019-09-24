USE bamazon;

CREATE TABLE departments (
    department_id INTEGER(10) NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(75) NULL,
    over_head_costs DECIMAL(20, 2) NULL,
    index (department_id)
);

USE bamazon;

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Electronics", 1500.00),
("Kitchen", 1000.00),
("Bedroom", 2000.00),
("Automotive", 1700.00);

SELECT * FROM departments;