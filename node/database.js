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

// TODO: parse XML
module.exports.loadData = () => {
	const data = require("./default.rulesets")
	console.log(data.length)
	var rulesetid = 0
	for (const ruleset of data){
		rulesetid += 1

		connection.query("INSERT INTO rulesets (rulesetid, name, file, default_off) VALUES (?, ?, ?, ?)",
			[rulesetid, ruleset.name, null, ruleset.default_off ? ruleset.default_off : null],
			function (error, results, fields) {
				console.log(error, results, fields)
			})
		var targets = []
		for (const target of ruleset.target)
			targets.push([rulesetid, target])
//		console.log(targets)
		var rules = []
		for (const rule of ruleset.rule)
			rules.push([rulesetid, rule.from, rule.to])
//		console.log(rules)
		
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
			
//console.log(rulesetid, ruleset)
	}	
	return 7
}
