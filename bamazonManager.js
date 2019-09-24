// Require third party packages
var inquirer = require("inquirer");
var mysql = require("mysql");

// Initialize variables
var addQuantity;
var quantityOnHand;
var newQuantityOnHand;
var itemID;
var itemName;
var addtoInventory = false;

var newProductName;
var newDepartmentName;
var newPrice;
var newStockQuantity;

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
          choices: ["View Products for Sale", 
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                    "Exit"],
        }
    ]).then(function(answer) {

        // Based on the selection, the user experience will be routed in one of these directions
        switch (answer.choice) {
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add to Inventory":
                changeInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                exit();
                break;
        }
    });
} // End start function

// Function to view products for sale
function viewProducts() {

    // Going to grab all of the products from the table
    var myQuery = "SELECT * FROM products";

    // Query to the database
    connection.query(myQuery, function(err, results) {
        if (err) throw err;

        // Begin the display of data

        console.log("\n---------------------------------------------------")

        // For loop to iterate through all of the records in the table
        for (var i = 0; i < results.length; i++) {

            // Display of data
            console.log("(" + results[i].item_id + ") " + 
            results[i].product_name + 
            " - " + results[i].department_name + " Department - $" +
            results[i].price + " - " +
            results[i].stock_quantity + " in stock.\n---------------------------------------------------");
        }
        console.log("\n");

        // Since this function is called two different times, we need to see if the purpose is to add inventory or just view the products
        // If we are not adding to the inventory, it takes us back to the start function
        if (!addtoInventory) {
            start();
        // If we are adding to the inventory, go to addInventory function
        } else {
            addtoInventory = false;
            addInventory();
        }
    });
} // End viewProducts function

// Function to view items with inventory values less than 5
function lowInventory() {
    
    // Query terms
    var myQuery = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(myQuery, function(err, results) {
        if (err) throw err;

        // If there are any items with low inventory, begin display of data
        if (results.length > 0) {
            console.log("\n---------------------------------------------------")

            // For loop to iterate through all resulting records
            for (var i = 0; i < results.length; i++) {
                console.log("(" + results[i].item_id + ") " + 
                results[i].product_name + 
                " - " + results[i].department_name + " Department - $" +
                results[i].price + " - " +
                results[i].stock_quantity + " in stock.\n---------------------------------------------------");
            }
            console.log("\n");

        // If there are no items with inventory levels below 5:
        } else {
            console.log("\nThere are no items with inventory below 5\n");
        }
        
        // Once finished, return to the start
        start();
    });
} // End lowInventory function

// Function that starts the change inventory option
function changeInventory() {
    // Change this variable to true to route properly through viewProducts function
    addtoInventory = true;
    viewProducts();
} //

// Function to add inventory to the table
function addInventory() {
    inquirer.prompt([
        {
          type: "input",
          name: "itemID",
          message: "What Item ID do you wish to add more inventory?",
        },
        {
            type: "input",
            name: "addQuantity",
            message: "How many would you like to add?"
        }
    ]).then(function(answer) {

        // Converting string responses to integers
        itemID = parseInt(answer.itemID);
        addQuantity = parseInt(answer.addQuantity);

        // Need to get current inventory before making a change
        getCurrentInventory();
    });
} // End addInventory function

// Function to grab current inventory data
function getCurrentInventory() {

    // Query to get the individual record from the table for the ID entered by the user
    var queryTerms = "SELECT * FROM products WHERE ?";
    connection.query(queryTerms, {item_id: itemID}, function(err, results) {
        if (err) throw err;

        // Reassigning to variables
        itemName = results[0].product_name;
        quantityOnHand = results[0].stock_quantity;

        // Next we will update the quantity in the table
        updateQuantity();
    });
} // End getCurrentInventory function

// Function to update the quantity as requested
function updateQuantity() {

    // Query to update the item ID inventory count
    var queryTerms = "UPDATE products SET ? WHERE ?";
    newQuantityOnHand = quantityOnHand + addQuantity;
    
    connection.query(queryTerms,
        [
            {stock_quantity: newQuantityOnHand},
            {item_id: itemID}
        ], function(err, result) {
            if (err) throw err;
            console.log("\nCONGRATULATIONS! You just added " + addQuantity + " " + itemName + "(s)\n");

            // Once complete, route back to the start
            start();
        });      
} // End updateQuantity function

// Function to add a new product to the table
function addNewProduct() {
    inquirer.prompt([
        {
          type: "input",
          name: "productName",
          message: "What is the name of the product you wish to add?",
        },
        {
            type: "input",
            name: "departmentName",
            message: "What department does this product belong in?"
        },
        {
            type: "input",
            name: "price",
            message: "How much are we selling this for?",
        },
        {
              type: "input",
              name: "quantity",
              message: "How many are we going to start off with?"
        }
    ]).then(function(answer) {

        // Query to add new record
        var queryTerms = "INSERT INTO products(product_name, department_name, price, stock_quantity) ";
        queryTerms += "VALUES (?, ?, ?, ?);";
        
        // Reassign to variables
        newProductName = answer.productName;
        newDepartmentName = answer.departmentName;
        newPrice = parseFloat(answer.price);
        newStockQuantity = parseInt(answer.quantity);

        connection.query(queryTerms, 
            [
                newProductName,
                newDepartmentName,
                newPrice,
                newStockQuantity
            ], function(err, result) {
                if (err) throw err;
                console.log("\nCONGRATULATIONS! You just added " + newStockQuantity + " " + newProductName + "(s).\n");

                // Once completed, route back to the start
                start();
        });
    });
} // End of addNewProduct function

// Function to exit the program
function exit() {
    connection.end();
} // End exit function