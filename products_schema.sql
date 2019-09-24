DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INTEGER(10) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(75) NOT NULL,
    department_name VARCHAR(75) NULL,
    price DECIMAL(10, 2) NULL,
    stock_quantity INTEGER(10) NULL,
    index (item_id)
);

USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("TV", "Electronics", 449.99, 15), 
("XBox", "Electronics", 249.99, 30),
("iPhone XR", "Electronics", 699.99, 20),
("Large Skillet", "Kitchen", 14.99, 35),
("Food Processor", "Kitchen", 29.99, 42),
("Instant Pot", "Kitchen", 149.99, 8),
("Queen Bedding Set", "Bedroom", 69.99, 50),
("King Bedding Set", "Bedroom", 79.99, 41),
("Dresser", "Bedroom", 189.99, 10),
("Jumper Cables", "Automotive", 14.99, 50)

SELECT * FROM products;