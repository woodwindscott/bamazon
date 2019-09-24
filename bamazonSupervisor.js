// Require third party packages
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

// Initialize variables
var newDepartmentName;
var newOverHeadCost;
var departmentSales = 0;
var currentDepartmentCosts = 0;
var currentDepartmentID;
var currentDepartmentName;

// Start the necessary steps to create the table from the constructor function
var table = new Table({
    head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'], 
    colWidths: [20, 20, 20, 20, 20]
});
 
// Creates connection to appropriate database
connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Care1self!",
    database: "bamazon"
});

// Initial connection to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as ID: " + connection.threadId + "\n");
    
    // Actual run of the program
    start();
})

// Start function...where it all begins
function start() {
    inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: ["View Product Sales by Department", 
                    "Create New Department",
                    "Exit"],
        }
    ]).then(function(answer) {

        // Based on the selection, the user experience will be routed in one of these directions
        switch (answer.choice) {
            case "View Product Sales by Department":
                viewProductSales();
                break;
            case "Create New Department":
                addNewDepartment();
                break;
            case "Exit":
                exit();
                break;
        }
    });
} // End start function

// Function to view product sales by department
function viewProductSales() {

    // Query terms - requires an inner join from the products table and departments table
    var queryTerms = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales ";
    queryTerms += "FROM departments ";
    queryTerms += "INNER JOIN products ON departments.department_name=products.department_name;";

    connection.query(queryTerms, function(err, result) {
            if (err) throw err;

            // Initialize variables
            departmentSales = 0;
            currentDepartmentCosts = 0;

            // For loop to iterate through the results
            for (var i=0; i < result.length; i++) {
                // Declare itemSales variable that will be utilized soon
                var itemSales;

                // This is necessary because sometimes the product_sales column is filled with the value of "null"...need to change to 0.
                if (result[i].product_sales === null) {
                    itemSales = 0;
                } else {
                    itemSales = result[i].product_sales;
                }


                if (i === 0) { // For the first iteration, we are going to assign currentDepartmentID and currentDepartmentName variables

                    // Reassign data to new variables
                    currentDepartmentID = result[i].department_id;
                    currentDepartmentName = result[i].department_name;
                    currentDepartmentCosts = result[i].over_head_costs;

                    // Calculate the total department sales
                    departmentSales += itemSales;

                // If it is not the first time through the for loop, we are checking to see if the last ID matches the one currently in the loop   
                } else if (currentDepartmentID === result[i].department_id) {
                    departmentSales += itemSales;
                    
                    if (i === (result.length -1)) {
                        // Last record -- Department total is calculated and ready to push to the table
                        pushToTable();
                    }
                
                // This means that we are moving to a new department and ready to push to the table
                } else {

                    // Push data to the table
                    pushToTable();

                    // Reset department sales to 0 and begin adding new item sales
                    departmentSales = 0;
                    departmentSales += itemSales;

                    // Reassign data to variables
                    currentDepartmentID = result[i].department_id;
                    currentDepartmentName = result[i].department_name;
                    currentDepartmentCosts = result[i].over_head_costs;

                    // In case this is the last record, we need to push to the table
                    if (i === (result.length - 1)) {
                    
                        // Push data to the table
                        pushToTable();
                    }
                }
            }
            // Prints the table now that the for loop has finished
            console.log(table.toString());

            // Route back to the start
            start();
    });
} // End viewProductSales function

// This function will be called multiple times to push the data to the table
function pushToTable() {
    table.push(
        [currentDepartmentID, 
        currentDepartmentName, 
        "$" + currentDepartmentCosts.toFixed(2), 
        "$" + departmentSales.toFixed(2),
        "$" + (departmentSales - currentDepartmentCosts).toFixed(2)]
    );
} // End pushToTable function

// This function allows the user to add a new department
function addNewDepartment() {
    inquirer.prompt([
        {
          type: "input",
          name: "departmentName",
          message: "What is the name of the department you wish to add?",
        },
        {
            type: "input",
            name: "overHeadCost",
            message: "What are the overhead costs?"
        }
    ]).then(function(answer) {

        // Query terms - INSERT
        var queryTerms = "INSERT INTO departments(department_name, over_head_costs) ";
        queryTerms += "VALUES (?, ?);";
        
        // Reassign data to variables
        newDepartmentName = answer.departmentName;
        newOverHeadCost = parseInt(answer.overHeadCost);

        connection.query(queryTerms, 
            [
                newDepartmentName,
                newOverHeadCost
            ], function(err, result) {
                if (err) throw err;
                console.log("\nCONGRATULATIONS! You just added the " + newDepartmentName + " department!\n");

                // Route back to the start
                start();
        });
    });
} // End addNewDepartment function

// Function to exit out of the program
function exit() {
    connection.end();
} // End exit function