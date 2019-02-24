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
		response.send(JSON.stringify({"error" : true}))
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
		let ruleset_id = req.url.replace("/ruleinfo?ruleid=", "")
		let secureCookiesQuery = 'SELECT * FROM rulesets LEFT JOIN ruleset_securecookies ON ruleset_securecookies.rulesetid=rulesets.rulesetid WHERE rulesets.rulesetid LIKE \'%' + ruleset_id +'%\';'
		let rulesQuery = 'SELECT * FROM rulesets LEFT JOIN ruleset_rules ON ruleset_rules.rulesetid=rulesets.rulesetid WHERE rulesets.rulesetid LIKE \'%' + ruleset_id +'%\';'
		let exclusionsQuery = 'SELECT * FROM rulesets LEFT JOIN ruleset_exclussions ON ruleset_exclussions.rulesetid=rulesets.rulesetid WHERE rulesets.rulesetid LIKE \'%' + ruleset_id +'%\';'
		//targetsQuery also gets the data about if the target supports hsts
		let targetsQuery = 'SELECT * FROM rulesets LEFT JOIN ruleset_targets ON ruleset_targets.rulesetid=rulesets.rulesetid LEFT JOIN evidence_hsts_preload ON ruleset_targets.target=evidence_hsts_preload.name WHERE rulesets.rulesetid LIKE \'%' + ruleset_id +'%\';'
		let rulesetTestsQuery = 'SELECT * FROM rulesets LEFT JOIN ruleset_tests ON ruleset_tests.rulesetid=rulesets.rulesetid WHERE rulesets.rulesetid LIKE \'%' + ruleset_id +'%\';'
		
		
		database.query(secureCookiesQuery, []).then((sc_result) => {
		database.query(rulesQuery, []).then((ru_result) => {
		database.query(exclusionsQuery, []).then((ex_result) => {
		database.query(targetsQuery, []).then((tr_result) => {
		database.query(rulesetTestsQuery, []).then((rt_result) => {
			let combined_result = {
				'securecookies': sc_result,
				'rules': ru_result,
				'exclusions': ex_result,
				'tests': rt_result,
				'targets': tr_result
			}
			console.log("All queries completed. ")
			response.setHeader("Content-Type", "application/json")
			response.send(JSON.stringify(combined_result))
		})})})})});
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
