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

//displays the product table from the database to the user
function runItemSearch(){
    var query = "SELECT item_id, productname, price FROM products";
    connection.query(query,function(err, res){
//        console.log(res);
        var table = new Table({
            head: ['Item Id', 'Product Name','Price']
            , colWidths: [10, 50,25]
        });

        for(var i=0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].productname,res[i].price]        
            );

       }//end of for loop 
       console.log(table.toString());
       //connection.end();
       //call to get the items user has selected to buy
       getUserItem();
    }); //end of connection 

} //end of function runItemSearch

function getUserItem(){
    inquirer
    .prompt([
        {    
            name: "item_id",
            type: "input",
            message: "Enter an item id you want to buy?"
        },
        {
            name: "quantity",
            type: "input",
            message: "How much quantity do you want to buy?"
        }    
    ]).then(function(answer){
        console.log(answer.item_id);
        console.log(answer.quantity);
        var itemid = parseInt(answer.item_id);
//        connection.query("SELECT * FROM top5000 WHERE ?", { song: answer.song }, function(err, res) {

        connection.query("SELECT stock_quantity from products where ?",{item_id: itemid},function(err,res){
            var qty = res[0].stock_quantity;
            if(qty >= answer.quantity){
                qty -= answer.quantity;
                connection.query("UPDATE products SET ? where ?",
                [{stock_quantity: qty},{item_id: answer.item_id}],
                function(err, res){
                    console.log(`Your order for item ${answer.item_id} for quantity ${answer.quantity} is placed`);
                });//end of product Update query
            }//end of if
            else{
                console.log("Not enough quantity for item");
            }
            //getMoreItems();
            //connection.end();
        }); // end of product lookup query
    }); //end of .then
}    

/**function getMoreItems(){
    inquirer.prompt([
        {
            name: "moreItem",
            type: "confirm",
            message: "Do you want to order more items?"
        }
    ]).then

}*/

