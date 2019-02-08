"use strict"

const sql = require("mysql")
const credentials = require ("./configuration.json").database.credentials

if (credentials.password == "" || credentials.password == "undefined"){
	console.warn("YOU SHOULD SET A PASSWORD ON DATABASE")
}

const mssqlCredentials = "mssql://" + 
	credentials.user + ":" +
	credentials.password + "@" +
	credentials.server + "/" + 
	credentials.database

const connection = sql.createConnection(mssqlCredentials);

connection.connect((error) => {
	if (error)
		console.error(`Failed to connect to database at ${mssqlCredentials}`)
	else
		console.log(`Connected to database at ${mssqlCredentials}`)
})

module.exports.queryCallback = (callback) => {
	connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
		if (error) throw error;
		callback(results)
	});
}

module.exports.query = connection.query