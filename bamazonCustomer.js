var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("table");

var purchaseQuantity;
var quantityOnHand;
var itemID;
var itemsLength;
var totalPrice;

// Creates connection to appropriate database
connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Care1self!",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as ID: " + connection.threadId + "\n");
    // start();
    displayItems();
})


function displayItems() {

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        itemsLength = results.length;

        console.log("\n---------------------------------------------------")
        for (var i = 0; i < results.length; i++) {
            console.log("(" + results[i].item_id + ") " + 
            results[i].product_name + 
            " - " + results[i].department_name + " Department - $" +
            results[i].price + " - " +
            results[i].stock_quantity + " in stock.\n---------------------------------------------------");
        }
        console.log("\n");
        mainPrompt();

    });
}

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
       
        purchaseQuantity = parseInt(answer.quantity);
        itemID = answer.itemID;

        if (itemID < 1 || itemID > itemsLength) {
            console.log("\n**** Please enter a valid Item ID\n");
            displayItems();
        } else {
            purchaseItem();
        }
    });
}

function purchaseItem() {
    var queryTerms = "SELECT * FROM products WHERE ?";
    connection.query(queryTerms, {item_id: itemID}, function(err, results) {
        if (err) throw err;

        quantityOnHand = results[0].stock_quantity;
        totalPrice = (purchaseQuantity * results[0].price).toFixed(2);

        if (purchaseQuantity <= quantityOnHand) {
            console.log("\nYou ordered " + purchaseQuantity + " " + results[0].product_name + "(s)." +
            "\nYour total is $" + totalPrice + " + tax.\n");
            updateQuantity();

        } else {
            console.log("\n**** Insufficient quantity on hand.  Try again.\n");  
            displayItems();          
        }

    });
}

function updateQuantity() {
    var queryTerms = "UPDATE products SET ? WHERE ?";
    var newQuantityOnHand = quantityOnHand - purchaseQuantity;
    
    connection.query(queryTerms,
        [
            {stock_quantity: newQuantityOnHand},
            {item_id: itemID}
        ], function(err, result) {
            if (err) throw err;
        });      

    exit();
}

function exit() {
    connection.end();
}