/* Server using Node.js and Express */

const express = require("express")
const app = express()
const configuration = require("./configuration").express

const database = require("./database/database")

/* This is the main function of the entire server.
 * It is async so that we can use await inside of it.
 */
const main = async () => {
	// First, load all data
	const loaded = await database.loadData()
	console.log("Loaded data", loaded)

	// Serve static content from webui folder
	app.use(express.static(__dirname + "/../webui"))

	// Serve dynamic content from "/search?" API endpoint
	app.get("/search?", (req, response) => {
	let targetName = req.url.replace("/search?target=", "")
	if (targetName.length < 2){
		response.send('{}')
	}
    let targetQuery = 'SELECT * FROM `ruleset_targets` WHERE `target` LIKE \'%' + targetName + '%\''
    let joinQuery = 'SELECT * FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE \'%' +targetName +'%\';'
		database.query(joinQuery, []).then((result) => {
			console.log("Search Query Served. ")
			response.setHeader("Content-Type", "application/json")
			response.send(JSON.stringify(result))
		})
	})

	app.get("/ruleinfo?", (req, response) => {
		let targetName = req.url.replace("/ruleinfo?ruleid=", "")
		let targetQuery = 'SELECT * FROM `ruleset_targets` WHERE `target` LIKE \'%' + targetName + '%\''
		let joinQuery = 'SELECT * FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE \'%' +targetName +'%\';'
			database.query(joinQuery, []).then((result) => {
				console.log("Search Query Served. ")
				response.setHeader("Content-Type", "application/json")
				response.send(JSON.stringify(result))
			})
		})

	// Serve dynamic content from "/search?" API endpoint
	app.get("/stats", (req, res) => {
		database.query((resp) => {
			console.log("Select")
			console.log("Solution: " + resp[0].solution)
			res.setHeader("Content-Type", "application/json")
			res.send(JSON.stringify(resp[0]))
		})
	})

	app.listen(configuration.port, () =>
		console.log(`Server listening on port ${configuration.port}`))

	database.query('SELECT 1 + 1 AS solution', []).then((res) => console.log(res))

}

// Start server
main()
