/**
 * User file. Shows the user the list of items available in our app
 * Gives a user option to select the items he wants to order
 * Asks for Quantity to be ordered
 * Checks if enough quantities available, places a order
 * If not enough quantities, displays a message to user. 
 * Prompts the user to order more items
 * When the user places a order, we update the stock quantity and product_sales in the database 
 */

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
  runItemSearch();
});

var itemArray;

//displays the product table from the database to the user
function runItemSearch(){
    inquirer
    .prompt([
        {    
            name: "user_choice",
            type: "list",
            message: "Welcome to BAmazon",
            choices: [
                    "Show products",
                    "Exit"
            ]
        }   
    ]).then(function(answer){
        switch(answer.user_choice){
            case "Exit":
                connection.end();
                break;
            default:
                showProducts();
                break;
        }
    });
} //end of function runItemSearch

//list of items available for display to user
function showProducts(){
    var query = "SELECT item_id, productname, price FROM products";
    connection.query(query,function(err, res){
//        console.log(res);
        var table = new Table({
            head: ['Item Id', 'Product Name','Price']
            , colWidths: [20, 50,30]
        });
        itemArray = new Array();
        for(var i=0; i < res.length; i++){
            //store the product names so we can display the user the list of item to order
            itemArray.push(res[i].productname);
            table.push(
                [res[i].item_id,res[i].productname,res[i].price]        
            );

       }//end of for loop 
       console.log(table.toString());
       //connection.end();
       //call to get the items user has selected to buy
       getUserItem();
    }); //end of connection 
}

//Prompt for user to select a item to place a order. Update the stock_quantity and product_sales in database after the order is placed
function getUserItem(){
    inquirer
    .prompt([
        {    
            name: "item_id",
            type: "list",
            message: "Select the item you want to buy?",
            choices: itemArray
        },
        {
            name: "quantity",
            type: "input",
            message: "How much quantity do you want to buy?"
        }    
    ]).then(function(answer){
        var itemName = answer.item_id;

        connection.query("SELECT stock_quantity, price, product_sales from products where ?",{productname: itemName},function(err,res){
            var qty = res[0].stock_quantity;
            var sales = res[0].product_sales;
            var price = parseFloat(res[0].price);
            if(qty >= answer.quantity){
                qty -= answer.quantity;
                sales = parseFloat(sales + (answer.quantity*price));
//                console.log(sales);
                connection.query("UPDATE products SET ?,? where ?",
                [{stock_quantity: qty},{product_sales: sales},{productname: answer.item_id}],
                function(err, res){
                    console.log(`Your order of ${answer.quantity} ${answer.item_id}  is placed`);
//                    console.log(res);
                    runItemSearch();
                });//end of product Update query
            }//end of if
            else{
                console.log("Not enough quantity for item");
                runItemSearch();
            }
        }); // end of product lookup query
    }); //end of .then
}    


