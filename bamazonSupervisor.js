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

function getDepartmentInfo(){
    inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "Select one of the options",
        choices: ["View Product Sales by Department",
                    "Create a new Department",
                    "Exit"]
    }).then(function(answer){
        switch(answer.action){
            case "View Product Sales by Department":
                 getDepartmentDetails();
                break;
            case "Create a new Department":
                addDepartment();
                break;
            case "Exit":
                connection.end();
            break;
        }
    });    
}
getDepartmentInfo();

//Get the total profit for each department based on the sales made by each dept - overhead cost from 
function getDepartmentDetails(){
    var query = `select department_id, departments.department_name, departments.over_head_cost, 
    IFNULL(sum(products.product_sales), 0) as sales, (IFNULL(sum(products.product_sales),0) - departments.over_head_cost) as total_profit 
    from products RIGHT JOIN departments 
    ON products.department_name = departments.department_name
    group by departments.department_name 
    order by departments.department_id;`;
    //Open database connection 
    //connectDB();
    connection.query(query,function(err, res){
        var table = new Table({
            head: ['Department Id', 'Department Name','Over Head Cost','Product Sale','Total Profit']
            , colWidths: [10, 40,15,15, 15]
        });

        for(var i=0; i < res.length; i++){
            table.push(
                [res[i].department_id,res[i].department_name,res[i].over_head_cost,res[i].sales, res[i].total_profit]        
            );

       }//end of for loop 
       console.log(table.toString());
       //endConnectDB();
       getDepartmentInfo();
       }); //end of connectionquery
}//end of getDepartmentDetails

function addDepartment(){
    inquirer.prompt([
        {
            name: "departmentname",
            type: "input",
            message: "Enter the Department Name :",
            validate: function(value) {
                if(value === "" || value === null)
                    return false;
                else
                    return true;
            }//end of validate
        },
        {
            name: "overheadcost",
            type: "input",
            message: "Enter Overhead Cost :",
            validate: function(value) {
                if (isNaN(value) === false && value > 0)  {
                return true;
                }
                return false;
            }
        }
    ]).then(function (answer){
        
        connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: answer.departmentname,
                over_head_cost: answer.overheadcost
            },
            function(err, response) {
                if (err) throw err;
              });
        console.log("New Department created");
        getDepartmentInfo();
    }); //END OF THEN FUNCTION

}//end of addDepartment
