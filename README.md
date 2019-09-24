# bamazon
Homework #12 - MySQL Integration

# Resources
GitHub Repo - https://github.com/woodwindscott/bamazon

Video Link - Full Demo: https://drive.google.com/file/d/1JBuQa_kBOkQEN6x-xMTgwEccQOq2ngyW/view

# User Instructions
## What to enter in the command line

1. `node bamazonCustomer.js`

   * This will allow users to display all of the products available and purchase any item listed.

2. `node bamazonManager.js`

   * This will allow users to complete multiple actions:

     * List all of the items currently for sale
     * View items with an inventory level below 5
     * Add inventory to items already in the products table
     * Add a new item that is not currently listed

3. `node bamazonSupervisor.js`

   * This will allow the user to complete two different actions:

       * View product sales by department and list the profit/loss for each department
       * Add a brand new department

*******************************************************

# Notes about the development process

## Technologies Used

1. Javascript
2. Node.js
3. NPM Modules:

    * inquirer
    * mysql
    * cli-table

## How the code is structured

For each of the different options (Customer, Manager, Supervisor), we start with the home screen which lists all of the options.  Each of those options are coded under separate functions.  Some of these options require multiple functions to complete (ie. gather data about an item in one function and modify the data in another function).

## Problems encountered

1. When I created the tables, I should have set the default value to product_sales as 0. Instead, if I don't assign a value, it is automatically given the value "null", which requires some error checking as I cannot add a number and null together. Foreseeing that problem would have saved some lines of code.

2. I need to add more data validation, but since inquirer can't validate data against the information coming from the database, I had to add some functionality in so that a user cannot enter an item ID that does not exist.

3. The biggest challenge was with the Supervisor application.  I still do not feel that I used the most elegant solution, but grouping the individual item sales into department sales was a problem.  I got it to work, but I fear that a much larger data set (products table) would cause problems with the solution I provided.

# Future Development

I would like to look into more data validation on the inquirer side as well as checking data coming from the database.  In particular, I fear that if the departments weren't grouped together, I would have a much harder time calculating the total department sales from individual items for sale. In addition, it would be nice if when adding a new product from the Manager screen, it would create a new department in the department table if it doesn't already exist.