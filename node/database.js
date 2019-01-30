"use strict"

const sql = require("mssql")
const credentials = require ("./configuration.json").credentials

const mssqlCredentials = "mssql://" + 
	credentials.user + ":" +
	credentials.password + "@" +
	credentials.server + "/" + 
	credentials.project

exports.query = () => {
	async () => {
		try {
			await sql.connect(mssqlCredentials)
			console.log("Connected to database")
			const result = sql.query ("CREATE SELECT 1 AS number;")
			console.dir(result)
			console.log("acsvsv")
			
			/*
				var request = new sql.Request()
		   
	// query to the database and get the records
	request.query('select * from Student', function (err, recordset) {
			
		if (err) console.log(err)


	})*/

		} catch (error) {
			console.error("Can't connect to database")
			console.error(error)
			process.exit(1)
		}
	}
}
