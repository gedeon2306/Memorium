const mysql = require('mysql');
const myConnection = require('express-myconnection');

const optiondb = {
    host     : 'localhost',
    user     : 'root',
    password : '',
    port     : 3306,
    database : 'memorium'
};

module.exports = myConnection(mysql, optiondb, "pool");