var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var connection = mysql.createConnection({
  host: "127.0.0.1",
  // Your port; if not 3306
  port: 3307,
  // Your username
  user: "NWTrainingUser",

  // Your password
  password: "NWKrupa123",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
  });      

/*
function connectDB(){
    connection.connect(function(err) {
        if (err) throw err;
      });      
}
*/

function endConnectDB(){
  // connection.end();
}

function runItemSearch(){
   // connectDB();
    inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
           "View Products for Sale",
           "View Low Inventory",
           "Add to Inventory",
           "Add New Product",
           "Exit"
        ]
    }).then(function(answer){
        switch(answer.action){
            case "View Products for Sale":
                allItemSearch();
                break;
            case "View Low Inventory":
                checkInventory();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                connection.end();
                break;
        } //end of switch
    }) //end of then function 
    //runItemSearch(); //execute the method
} //end of prompt
runItemSearch(); //execute the method


//display all items with stock quantity is more than 0
function allItemSearch(){
    var query = "SELECT item_id, productname, price, stock_quantity FROM products where stock_quantity <> 0";
    //Open database connection
    //connectDB();
    connection.query(query,function(err, res){
        var table = new Table({
            head: ['Item Id', 'Product Name','Price','Stock Quantity']
            , colWidths: [10, 50,25,10]
        });

        for(var i=0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].productname,res[i].price,res[i].stock_quantity]        
            );

       }//end of for loop 
       console.log(table.toString());
       //endConnectDB();
       runItemSearch();
       }); //end of connectionquery
}//End of allItemSearch

//checks fpr low inventory for all items and displays the rows of items with qty >= 5
function checkInventory(){
    var query = "SELECT item_id, productname, price, stock_quantity FROM products where stock_quantity <= 5";
    //Open database connection
    connection.query(query,function(err, res){

        var table = new Table({
            head: ['Item Id', 'Product Name','Price','Stock Quantity']
            , colWidths: [10, 50,25,10]
        });

        for(var i=0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].productname,res[i].price,res[i].stock_quantity]        
            );

       }//end of for loop 
       console.log(table.toString());
       runItemSearch(); //execute the method
    }); //end of connectionquery
}

//function to add inventory for a particular item
function addInventory(){
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "Enter the item id :",
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "Enter Quantity to add :",
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }
        }
    ]).then(function (answer){
        connection.query("SELECT stock_quantity from products where ?",{item_id: answer.item_id},function(err,res){
            var qty = parseInt(res[0].stock_quantity);
                qty += parseInt(answer.quantity);
                connection.query("UPDATE products SET ? where ?",
                [{stock_quantity: qty},{item_id: answer.item_id}],
                function(err, res){
                    console.log(`Quantity ${answer.quantity} is added to your item ${answer.item_id}`);
                    break;
                });//end of product Update query

        
        // connection.query("UPDATE products SET ? where ?",
        // [{stock_quantity: qty},{item_id: answer.item_id}],
        // function(err, res){
        //     console.log(`Quantity ${answer.quantity} is added to your item ${answer.item_id}`);

        runItemSearch(); //execute the method
        });//end of select query

    }); //end of then function    
} //end of add inventory function

//add new product to products table in database
function addNewProduct(){
    inquirer.prompt([
        {
            name: "productname",
            type: "input",
            message: "Enter new product name ",
            validate: function(value){
                if(value === "" || value === null)
                    return false;
                else
                    return true;
            } //end of validate
        },
        {
            name: "department_name",
            type: "input",
            message: "Enter department for new product ",
        },        
        {
            name: "price",
            type: "input",
            message: "Enter price for new product ",
        },
        {
            name: "stock_quantity",
            type: "input",
            message: "Enter stock quantity for new product",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        } 
    ]).then(function (answer){
        connection.query(
            "INSERT INTO products SET ?",
            {
              productname: answer.productname,
              department_name: answer.department_name,
              price: answer.price,
              stock_quantity: answer.stock_quantity
            },
            function(err, response) {
              if (err) throw err;
            });
    console.log("Row added to product table");
    runItemSearch(); //execute the method
    });//end of then function   
}