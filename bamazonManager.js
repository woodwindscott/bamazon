var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("table");

var addQuantity;
var quantityOnHand;
var newQuantityOnHand;
var itemID;
var itemName;
var totalPrice;
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

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as ID: " + connection.threadId + "\n");
    start();
})

// List a set of menu options:

// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

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
}

function viewProducts() {

    var myQuery = "SELECT * FROM products";
    connection.query(myQuery, function(err, results) {
        if (err) throw err;

        console.log("\n---------------------------------------------------")
        for (var i = 0; i < results.length; i++) {
            console.log("(" + results[i].item_id + ") " + 
            results[i].product_name + 
            " - " + results[i].department_name + " Department - $" +
            results[i].price + " - " +
            results[i].stock_quantity + " in stock.\n---------------------------------------------------");
        }
        console.log("\n");

        if (!addtoInventory) {
            start();
        } else {
            addtoInventory = false;
            addInventory();
        }

    });
}

function lowInventory() {
    
    var myQuery = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(myQuery, function(err, results) {
        if (err) throw err;

        if (results.length > 0) {
            console.log("\n---------------------------------------------------")
            for (var i = 0; i < results.length; i++) {
                console.log("(" + results[i].item_id + ") " + 
                results[i].product_name + 
                " - " + results[i].department_name + " Department - $" +
                results[i].price + " - " +
                results[i].stock_quantity + " in stock.\n---------------------------------------------------");
            }
            console.log("\n");
        } else {
            console.log("\nThere are no items with inventory below 5\n");
        }
        start();

    });

}

function changeInventory() {
    addtoInventory = true;
    viewProducts();
}

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
        itemID = parseInt(answer.itemID);
        addQuantity = parseInt(answer.addQuantity);

        getCurrentInventory();
    });
}

function getCurrentInventory() {
    var queryTerms = "SELECT * FROM products WHERE ?";
    connection.query(queryTerms, {item_id: itemID}, function(err, results) {
        if (err) throw err;

        itemName = results[0].product_name;
        quantityOnHand = results[0].stock_quantity;

        updateQuantity();
    });
}

function updateQuantity() {
    var queryTerms = "UPDATE products SET ? WHERE ?";
    newQuantityOnHand = quantityOnHand + addQuantity;
    
    connection.query(queryTerms,
        [
            {stock_quantity: newQuantityOnHand},
            {item_id: itemID}
        ], function(err, result) {
            if (err) throw err;
            console.log("\nCONGRATULATIONS! You just added " + addQuantity + " " + itemName + "(s)\n");

            start();
        });      
}

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

        var queryTerms = "INSERT INTO products(product_name, department_name, price, stock_quantity) ";
        queryTerms += "VALUES (?, ?, ?, ?);";
        
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

                start();
        });
    });
}

function exit() {
    connection.end();
}