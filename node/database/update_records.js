//const simpleGit = require('simple-git')();
var intervalAmount = 1000*60*15; // how often we want to make our pulls - currently 15 minutes
var exec = require('child_process').exec;
var connection;

"use strict"

const fs = require("fs")
const { promisify } = require("util")
const { basename } = require("path")

const sql = require("mysql")
const json5 = require("json5")
const { parseString } = require("xml2js")
const glob = require("glob")
const punycode = require("punycode")

// Wrap libraries into promisses
const parseStringPromise = promisify(parseString)
const globPromise = promisify(glob)
const readFilePromise = promisify(fs.readFile)

const updateRecord = async (ruleset, connection) => {
		//const path = __dirname + "/../../cache/transport_security_state_static.json"
	const path = __dirname + "/../../cache/https-everywhere/" + ruleset; // THIS MIGHT NOT BE THE RIGHT RELATIVE PATH
	console.log(path)
	const files = await globPromise(path)

	var formated_rulesets    = []
	var formated_targets     = []
	var formated_rules       = []
	var formated_tests       = []
	var formated_exclussions = []
	var formated_cookies     = []

	var rulesetid = 0
	for (const file of files) {
		const contents = await readFilePromise(file, "utf8")

		const ruleset = (await parseStringPromise(contents)).ruleset
		rulesetid += 1

		if (ruleset.$.platform && ruleset.$.platform !== "mixedcontent")
			console.error(`Unknown platform ${ruleset.$.platform}, ignored it`)
		formated_rulesets.push([                       // Record attributes:
			rulesetid,                             // INT rulesetid
			ruleset.$.name,                        // VARCHAR name
			basename(file),                        // VARCHAR file
			ruleset.$.default_off,                 // VARCHAR default_off
			ruleset.$.platform === "mixedcontent"  // BIT mixedcontent
		])

		for (const target of ruleset.target){
			const host = punycode.toASCII(target.$.host) // Convert to punycode, if needed
			formated_targets.push([rulesetid, host])
		}

		for (const rule of ruleset.rule){            // Should fail if there are no rules
			// TODO: punycode, if there is any
			formated_rules.push([ // Record attributes:
				rulesetid,    // INT rulesetid
				rule.$.from,  // VARCHAR from
				rule.$.to     // VARCHAR to
			])
		}

		for (const test of ruleset.test || []){      // Should move on if there are no tests
			formated_tests.push([ // Record attributes:
				rulesetid,    // INT rulesetid
				test.$.url    // VARCHAR url
			])
		}

		for (const exclusion of ruleset.exclusion || []){ // Should move on if there are no tests
			formated_exclussions.push([ // Record attributes:
				rulesetid,          // INT rulesetid
				exclusion.$.pattern // VARCHAR url
			])
		}

		for (const cookie of ruleset.securecookie || []){ // Should move on if there are no tests
			formated_cookies.push([   // Record attributes:
				rulesetid,        // INT rulesetid
				cookie.$.host,    // VARCHAR url
				cookie.$.name     // VARCHAR url
			])
		}
	}

	connection.query("INSERT INTO rulesets (`rulesetid`, `name`, `file`, `default_off`, `mixedcontent`) VALUES ?", [formated_rulesets],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields)
			else
				console.log("Inserted all rulesets' unique attributes")
		})


	connection.query("INSERT INTO ruleset_targets (`rulesetid`, `target`) VALUES ?", [formated_targets],
		function (error, results, fields) {
			if (error)
				console.log(error, results, fields, error)
			else
				console.log("Inserted all rulesets' targets")
		})

	connection.query("INSERT INTO ruleset_rules (`rulesetid`, `from`, `to`) VALUES ?", [formated_rules],
		function (error, results, fields) {
			if (error)
				console.log(error, fields)
			else
				console.log("Inserted all rulesets' rules")
		})

	connection.query("INSERT INTO ruleset_tests (`rulesetid`, `url`) VALUES ?", [formated_tests],
		function (error, results, fields) {
			if (error)
				console.log(error, fields)
			else
				console.log("Inserted all rulesets' tests")
		})


	connection.query("INSERT INTO ruleset_exclussions (`rulesetid`, `pattern`) VALUES ?", [formated_exclussions],
		function (error, results, fields) {
			if (error)
				console.log(error, fields)
			else
				console.log("Inserted all rulesets' exclusions")
		})

	connection.query("INSERT INTO ruleset_securecookies (`rulesetid`, `host`, `name`) VALUES ?", [formated_cookies],
		function (error, results, fields) {
			if (error)
				console.log(error, fields)
			else
				console.log("Inserted all rulesets' securecookies")
		})

}

function updateDatabase(file_differences) {
  console.log("Inside updateDatabase!");
  var fileList = file_differences.split("\n");
  for (file of fileList) {
    updateRecord(file);
  }
}

function makePulls() {
  console.log("Executing makePulls...")
  console.log('Starting directory: ' + process.cwd());
  try {
    process.chdir('../cache/https-everywhere');
    console.log('New directory: ' + process.cwd());
  }
  catch (err) {
    console.log('error in makePulls: ' + err);
  }
  var preCommit = exec("pwd && git rev-parse HEAD", function(err, stdout_pre, stderr) {
    console.log(stdout_pre);
    var pulling = exec("git pull", function(err, stdout_pull, stderr) {
      console.log("Pulling...");
      var postCommit = exec("git rev-parse HEAD", function(err, stdout_post, stderr) {
        console.log(stdout_post)
        fileDifferences = exec("git diff" + preCommit + " " + postCommit + "--name-only",
          function(err, stdout_differences, stderr) {
            // this function will update the database in the case of differences
            if (stdout_differences != "") {
              updateDatabase(stdout_difference);
            } else {
              console.log("No file differences...");
            }
          });
      });
    });

  });
  console.log("");
  }
//var testList = "AdBlock.xml\nAdButler.xml\nAdExcite.xml";
//updateDatabase(testList);

const checkOnTimer = (connection_) => {
  connection = connection_;
  makePulls();
  setInterval(makePulls, intervalAmount);
}


// dir.on('exit', function (code) {
//   // exit code is code
// });

// var execProcess = require("./exec_process.js");
// execProcess.result("sh update_records.sh", function(err, response){
//     if(!err){
//         console.log(response);
//     }else {
//         console.log(err);
//     }
// });

// require('simple-git')()
//      .exec(() => console.log('Starting pull...'))
//      .pull((err, update) => {
//         if(update && update.summary.changes) {
//            require('child_process').exec('npm restart');
//         }
//      })
//      .exec(() => console.log('pull done.'));

module.exports = {
  checkOnTimer: checkOnTimer
}
