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

const queryCallback = (callback) => {
	connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
		if (error) throw error;
		callback(results)
	});
}

// TODO: parse XML
const loadData = () => {
	console.log("Started loading data...")
	const data = require("./default.rulesets")
	console.log(data.length)
	var rulesetid = 0
	var formated_rulesets = []
	var formated_targets = []
	var formated_rules = []
	for (const ruleset of data){
		rulesetid += 1

		// ruleset body
		const formated = [rulesetid, ruleset.name, null, ruleset.default_off ? ruleset.default_off : null]
		formated_rulesets.push(formated)

		for (const target of ruleset.target)
			formated_targets.push([rulesetid, target])

		for (const rule of ruleset.rule)
			formated_rules.push([rulesetid, rule.from, rule.to])
		
		if (ruleset.securecookie){
			var securecookies = []
			for (const securecookie of ruleset.securecookie)
				securecookies.push([rulesetid, securecookie.host, securecookie.name])
//			console.log(securecookies)
		}
//		connection.query("INSERT INTO ruleset_targets (rulesetid, target) VALUES (?, ?)",
//			[rulesetid, target], function (error, results, fields) {
//				//console.log(error, results, fields)
//			})
			
	}
	connection.query("INSERT INTO rulesets (rulesetid, name, file, default_off) VALUES ?", [formated_rulesets],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields)
			else
				console.log("Inserted all rulesets")
	})
/* TODO: punycode
	connection.query("INSERT INTO ruleset_targets (rulesetid, target) VALUES ?", [formated_targets],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields)
			else
				console.log("Inserted all ruleset targets")
	})
	connection.query("INSERT INTO ruleset_rules (rulesetid, from, to) VALUES ?", [formated_rules],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields)
			else
				console.log("Inserted all ruleset rules")
	})
*/

	console.log (`Inserted ruleset ${rulesetid} records.`)
	return 7
}

module.exports = {
	queryCallback: queryCallback,
	query: connection.query,
	loadData: loadData
}
