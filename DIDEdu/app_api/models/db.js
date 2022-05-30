const mysql = require("mysql");

var dbURI = process.env.CLEARDB_DATABASE_URL;
const connection = mysql.createPool(dbURI);

connection.getConnection((error, connection) => {
    if(error){
        console.log('Error connecting to the MySQL Database.', error);
        return;
    }
    console.log('Mysql connection established sucessfully.');
});

module.exports = connection;