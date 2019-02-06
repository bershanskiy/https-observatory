/* Server using Node.js and Express */

const express = require("express")
const app = express()
const configuration = require("./configuration").express

app.get("/", (req, res) => {
	database.queryCallback((resp) => {
		console.log("Solution: " + resp[0].solution)
		res.send('1 + 1 = ' + resp[0].solution)
	})
})

app.listen(configuration.port, () =>
	console.log(`Server listening on port ${configuration.port}`))

const database = require("./database")

database.queryCallback((res) => {
	console.log("Solution: " + res[0].solution)
})

console.log(typeof database.query)
/*
database.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
		if (error) throw error
	console.log("Solution hormal: " + results[0].solution)
})

*/