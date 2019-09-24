// Require third party packages
var inquirer = require("inquirer");
var mysql = require("mysql");

// Initialize variables
var purchaseQuantity;
var quantityOnHand;
var itemID;
var totalPrice;
var totalSales;
var newSales;
var lastItemID;

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
          choices: ["Purchase Items", 
                    "Exit"],
        }
    ]).then(function(answer) {

        // Based on the selection, the user experience will be routed in one of these directions
        switch (answer.choice) {
            case "Purchase Items":
                displayItems();
                break;
            case "Exit":
                exit();
                break;
        }
    });
} // End start function

// Function to loop through items in the products table to display each item
function displayItems() {

    // Going to grab all of the products from the table
    var queryTerms = "SELECT * FROM products";

    // Query to the database
    connection.query(queryTerms, function(err, results) {
        if (err) throw err;

        // This is necessary to make sure that a user doesn't select an item ID that is beyond the scope of the data
        lastItemID = results[results.length-1].item_id;

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

        // Then routes to the main prompt asking questions about the pending purchase
        mainPrompt();

    });
} // End displayItems function

// Function to handle the main prompt - which item and how many do you wish to purchase
function mainPrompt() {
    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "Please enter the item ID of the item you would like to purchase.",
        },
        {
            type: "input",
            name: "quantity",
            message: "How many would you like to purchase?"
        }
    ]).then(function(answer) {
       
        // Necessary to turn the string into an integer for future calculations
        purchaseQuantity = parseInt(answer.quantity);
        itemID = answer.itemID;

        // Error checking...looking to see if it the item ID selected is in range
        if (itemID < 1 || itemID > lastItemID) {
            console.log("\n**** You did not enter a valid Item ID. Please try again.\n");
            start();
        } else {
            purchaseItem();
        }
    });
} // End mainPrompt function

// Function to handle the purchase of an item
function purchaseItem() {

    // Defining query terms to select the item being purchased
    var queryTerms = "SELECT * FROM products WHERE ?";
    connection.query(queryTerms, {item_id: itemID}, function(err, results) {
        if (err) throw err;

        // Reassigning data into new variables
        quantityOnHand = results[0].stock_quantity;
        totalPrice = (purchaseQuantity * results[0].price).toFixed(2);
        newSales = totalPrice;

        // Getting data from the individual record to handle total product sales
        // Sometimes the product sales are recorded as "null" in the table, so this is error handling for that.
        if (results[0].product_sales === null) {
            totalSales = 0;
        } else {
            totalSales = (results[0].product_sales).toFixed(2);
        }

        // If the item being purchased fits within the inventory...
        if (purchaseQuantity <= quantityOnHand) {
            console.log("\nYou ordered " + purchaseQuantity + " " + results[0].product_name + "(s)." +
            "\nYour total is $" + totalPrice + " + tax.\n");
            updateQuantity();
        // Otherwise reroute to the beginning
        } else {
            console.log("\n**** Insufficient quantity on hand.  Please try again.\n");  
            start();          
        }
    });
} // End purchaseItem function

// Function to handle the updated quantity of the individual product after it has sold
function updateQuantity() {

    // Query to update the item's quantity based on the item ID
    var queryTerms = "UPDATE products SET ? WHERE ?";
    var newQuantityOnHand = quantityOnHand - purchaseQuantity;
    
    connection.query(queryTerms,
        [
            {stock_quantity: newQuantityOnHand},
            {item_id: itemID}
        ], function(err, result) {
            if (err) throw err;
        });      

    // After that update is done, we need to update the total sales column
    updateTotalSales();
} // End updateQuantity function

// Function to update the total sales column with additional sale
function updateTotalSales() {

    // Query to update total sales based on product id
    var queryTerms = "UPDATE products SET ? WHERE ?";

    // parseFloat is required to make sure the math is handled with decimal values, not string
    var grandTotalSales = parseFloat(newSales) + parseFloat(totalSales);

    connection.query(queryTerms,
        [
            {product_sales: grandTotalSales},
            {item_id: itemID}
        ], function(err, result) {
            if (err) throw err;
        });

    // Back to the start of the program
    start();
} // End updateTotalSales function

// Function to exit out of the program
function exit() {
    connection.end();
} // End exit function