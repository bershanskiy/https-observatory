"use strict"

const fs = require("fs")
const sql = require("mysql")
const configuration = require("../configuration.json").database
const json5 = require("json5")

// Where database state file is
const state_file_path = __dirname + "/" + configuration.state

const credentials = configuration.credentials

if (credentials.password == "" || credentials.password == "undefined"){
	console.warn("YOU SHOULD SET A PASSWORD ON DATABASE")
}

const mySQLCredentials = "mysql://" +
	credentials.user + ":" +
	credentials.password + "@" +
	credentials.server + "/" +
	credentials.database

const connection = sql.createConnection(mySQLCredentials);

connection.connect((error) => {
	if (error)
		console.error(`Failed to connect to database at ${mySQLCredentials}`)
	else
		console.log(`Connected to database at ${mySQLCredentials}`)
})

const queryCallback = (callback) => {
	connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
		if (error) throw error;
		callback(results)
	});
}

/* Loads all HSTS records from a Chromium list */
const loadDataHSTS = () => {
	const path = __dirname + "/../../cache/transport_security_state_static.json"
	// Can't just require(path) or "JSON.parse(...) because file contains coments
	// Use JSON5 instead (that supports comments)
	// Also, we care only about entries (not pinsets)
	const data = json5.parse(fs.readFileSync(path)).entries

	var formated_hsts = []
	for (const record of data){
		formated_hsts.push([
			record.name,
			record.policy,
			record.include_subdomains,
			record.include_subdomains_for_pinning,
			record.mode === "force-https",
			record.pins,
			record.expect_ct_report_uri ? record.expect_ct_report_uri : null
		])
	}
	connection.query("INSERT INTO evidence_hsts_preload (name, policy, include_subdomains, include_subdomains_for_pinning, force_https, pins, expect_ct_report_uri) VALUES ?", [formated_hsts],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields)
			else
				console.log("Inserted all HSTS preload records")
	})

}

const loadDataRulesFromJSON = () => {
	const punycode = require("punycode")
	console.log("Started loading data...")
	const data = JSON.parse(fs.readFileSync(__dirname + "/../../cache/https-everywhere/src/chrome/content/rules/default.rulesets"))
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
	console.log (`Scheduled insertion of ${rulesetid} ruleset records.`)
}

const loadDataRules = async () => {
	

	
	
	const punycode = require("punycode")
	console.log("Started loading rules...")
	const data = JSON.parse(fs.readFileSync(__dirname + "/../../cache/https-everywhere/src/chrome/content/rules/default.rulesets"))
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
	console.log (`Scheduled insertion of ${rulesetid} ruleset records.`)
}

const loadData = async () => {
	// The tate of the database
	var state
	// Attempt to load the file state of the database, which might not exist
	try {
		state = require(state_file_path)
		console.log(`Loaded database state file found at ${state_file_path}.`)
	} catch(error) {
		// State
		// TODO: async to make sure all these returned before moving on
		console.log(`No valid database state file found at ${state_file_path}, emptying the database and loading new data.`)
		connection.query("DELETE FROM rulesets;")
		connection.query("DELETE FROM ruleset_targets;")
		connection.query("DELETE FROM ruleset_rules;")
		connection.query("DELETE FROM ruleset_exclussions;")
		connection.query("DELETE FROM ruleset_securecookies;")
		connection.query("DELETE FROM evidence_hsts_preload;")
		console.log("emptied everything")
		// TODO
	}

	await loadDataHSTS()
	await loadDataRules()

	return true
}

module.exports = {
	queryCallback: queryCallback,
	query: connection.query,
	loadData: loadData
}
