/** Database glue code
 * This code abstracts away the database schema and
 * handles conversion between SQL and JavaScript objects.
 */

"use strict"

/* Node.js standard libraries */
const fs = require("fs")
const { promisify } = require("util")
const { basename } = require("path")

/* NPM libraries */
const sql = require("mysql")
const json5 = require("json5")
const { parseString } = require("xml2js")
const glob = require("glob")
const punycode = require("punycode")
// Wrap libraries into promisses
const parseStringPromise = promisify(parseString)
const globPromise = promisify(glob)
const readFilePromise = promisify(fs.readFile)

/* Custom libraries */
const updateRecords = require("./git.js")

/* Configuration */
const configuration = require("../configuration.json").database

// Where database state file is
const state_file_path = __dirname + "/" + configuration.state

const credentials = configuration.connection

if (credentials.password === "" || credentials.password === undefined || credentials.password === null)
  console.warn("YOU SHOULD SET A PASSWORD ON THE DATABASE")

const connection = sql.createConnection(credentials)

connection.connect((error) => {
  if (error)
    console.error("Failed to connect to the database");
  else
    console.log("Connected to database")
})

/* Checks if database responds to a ping */
const isOnline = async (query, args) => {
  return new Promise((resolve, reject) => {
    connection.ping((error) => {
      if (error)
        reject(error)
      else
        resolve(true)
    })
  })
}

const queryPromise = async (query, args) => {
  return new Promise((resolve, reject) => {
    args = args || []
    connection.query(query, args, function (error, results, fields) {
      if (error){
        console.log(error)
        console.log(results)
        console.log(fields)
        reject([error, results, fields])
      }
      else resolve(results)
    })
  })
}

/* Loads all HSTS records from a Chromium list */
const loadDataHSTS = async() => {
  return new Promise(function(resolve, reject) {
    const path = __dirname + "/../../cache/transport_security_state_static.json"
    // Can't just require(path) or "JSON.parse(...) because file contains coments
    // Use JSON5 instead (that supports comments)
    // Also, we care only about entries (not pinsets)
    const data = json5.parse(fs.readFileSync(path)).entries

    let formated_hsts = []
    for (const record of data){
      formated_hsts.push([
        record.name,
        record.policy,
        record.include_subdomains === true,
        record.include_subdomains_for_pinning === true,
        record.mode === "force-https",
        record.pins,
        record.expect_ct_report_uri ? record.expect_ct_report_uri : null
      ])
    }
    queryPromise("INSERT INTO evidence_hsts_preload (name, policy, include_subdomains, include_subdomains_for_pinning, force_https, pins, expect_ct_report_uri) VALUES ?", [formated_hsts])
    .catch(e => {reject(false)})
    .then(() => {
      console.log("Database: Inserted all HSTS preload records.")
      resolve(true)
    })
  })
}

const loadDataRules = async (path) => {
  const files = await globPromise(path)

  let formated_rulesets   = []
  let formated_targets    = []
  let formated_rules      = []
  let formated_tests      = []
  let formated_exclusions = []
  let formated_cookies    = []

  // TODO: Query the correct rulesetid from the database
  // when inserting into database that already has records
  let rulesetid = 0
  for (const file of files) {
    const contents = await readFilePromise(file, "utf8")

    const ruleset = (await parseStringPromise(contents)).ruleset
    rulesetid += 1

    if (ruleset.$.platform && ruleset.$.platform !== "mixedcontent")
      console.error(`Unknown platform ${ruleset.$.platform}, ignored it`)
    formated_rulesets.push([                 // Record attributes:
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
        rulesetid,          // INT rulesetid
        rule.$.from,        // VARCHAR from
        rule.$.to           // VARCHAR to
      ])
    }

    for (const test of ruleset.test || []){      // Should move on if there are no tests
      formated_tests.push([ // Record attributes:
        rulesetid,          // INT rulesetid
        test.$.url          // VARCHAR url
      ])
    }

    for (const exclusion of ruleset.exclusion || []){ // Should move on if there are no tests
      formated_exclusions.push([ // Record attributes:
        rulesetid,               // INT rulesetid
        exclusion.$.pattern      // VARCHAR url
      ])
    }

    for (const cookie of ruleset.securecookie || []){ // Should move on if there are no tests
      formated_cookies.push([ // Record attributes:
        rulesetid,            // INT rulesetid
        cookie.$.host,        // VARCHAR url
        cookie.$.name         // VARCHAR url
      ])
    }
  }

  if (formated_rulesets.length > 0)
    await queryPromise("INSERT INTO rulesets (`rulesetid`, `name`, `file`, `default_off`, `mixedcontent`) VALUES ?", [formated_rulesets])

  if (formated_targets.length > 0)
    await queryPromise("INSERT INTO ruleset_targets (`rulesetid`, `target`) VALUES ?", [formated_targets])

  if (formated_rules.length > 0)
    await queryPromise("INSERT INTO ruleset_rules (`rulesetid`, `from`, `to`) VALUES ?", [formated_rules])

  if (formated_tests.length > 0)
    await queryPromise("INSERT INTO ruleset_tests (`rulesetid`, `url`) VALUES ?", [formated_tests])

  if (formated_exclusions.length > 0)
    await queryPromise("INSERT INTO ruleset_exclusions (`rulesetid`, `pattern`) VALUES ?", [formated_exclusions])

  if (formated_cookies.length > 0)
    await queryPromise("INSERT INTO ruleset_securecookies (`rulesetid`, `host`, `name`) VALUES ?", [formated_cookies])
}

const loadData = async () => {
  // The tate of the database
  let state
  const path_data = __dirname + "/../../cache/https-everywhere/src/chrome/content/rules/*.xml"

  // Attempt to load the file state of the database, which might not exist
  try {
    state = require(state_file_path)
    console.log(`Loaded database state file found at ${state_file_path}.`)
  } catch(error) {
    // State
    // TODO: async to make sure all these returned before moving on
    console.log(`No valid database state file found at ${state_file_path}, emptying the database and loading new data.`)
    // Delete all ruleset data.
    // We need to delete records only from `rulesets` table, since all child records will be deleted automatically.
    connection.query("DELETE FROM rulesets;")
    // Delete HSTS Preload records
    connection.query("DELETE FROM evidence_hsts_preload;")
    console.log("emptied everything")
    // TODO

    console.log("Database: Started loading data...")
    await loadDataHSTS()
    await loadDataRules(path_data)
    console.log("Database: Done loading data.")
  }

  // Check if database is connected
  const online = await isOnline()
  if (!online)
    return false
  console.log("Database is connected and initialized")
  // set a timer to periodically check for HTTPSE git repo updates
  updateRecords.checkOnTimer(connection, loadDataRules)
  return true
}

const getRulesetById = async (rulesetid) => {
  const longList  = [rulesetid, rulesetid, rulesetid, rulesetid, rulesetid, rulesetid]
  const longQuery = "SELECT * FROM rulesets WHERE rulesets.rulesetid=?; \
    SELECT * FROM ruleset_targets WHERE ruleset_targets.rulesetid=?; \
    SELECT * FROM ruleset_rules WHERE ruleset_rules.rulesetid=?; \
    SELECT * FROM ruleset_exclusions WHERE ruleset_exclusions.rulesetid=?; \
    SELECT * FROM ruleset_securecookies WHERE ruleset_securecookies.rulesetid=?; \
    SELECT * FROM ruleset_tests WHERE  ruleset_tests.rulesetid=?;"

  const data = await queryPromise (longQuery, longList)

  // Convert response into a neat object
  const ruleset = {
    "rulesetid": rulesetid,
    "name": data[0][0]["name"],
    "file": data[0][0]["file"],
    "default_off": data[0][0]["default_off"],
    "mixedcontent": Boolean(data[0][0]["mixedcontent"]), // This converts a buffer to boolean
    "comment": data[0][0]["comment"],
    "targets": data[1],
    "rules": data[2],
    "exclusions": data[3],
    "securecookies": data[4],
    "tests": data[5]
  }

  return ruleset
}

const searchRulesetsByTarget = async (target, page_num, BATCH_SIZE) => {
  const joinQuery = "SELECT * FROM (SELECT name, file, rulesets.rulesetid, default_off, rulesets.comment, mixedcontent, target FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE ?) AS T ORDER BY target LIMIT ?,?;"
  const joinQueryArgs = ["\%" + target + "\%", (page_num - 1)*BATCH_SIZE , BATCH_SIZE]

  const countQuery = "SELECT count(rulesetid) AS total_count FROM (SELECT rulesetid FROM (SELECT name, file, rulesets.rulesetid, default_off, rulesets.comment, mixedcontent, target FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE ?) AS T GROUP BY rulesetid) AS Q;"
  const countQueryArgs = ["\%" + target + "\%"]

  const joinPromise = queryPromise (joinQuery, joinQueryArgs)
  const countPromise = queryPromise (countQuery, countQueryArgs)

  const data = await joinPromise
  const countdata = await countPromise
  
  
  const count = countdata[0].total_count
  
  let matches = []
  for (const record of data){
    //Only add if there are not duplicates. 
    let index = -1
    for (const i in matches)
      if (matches[i].name === record.name){
        index = i
        break
      }
    if (index === -1){
      index = matches.length
      let formatted = {}
      formatted["name"] = record.name
      formatted["file"] = record.file
      formatted["rulesetid"] = record.rulesetid
      if (record.default_off)
        formatted["default_off"] = record.default_off
      if (record.comment)
        formatted["comment"] = record.comment
      formatted["mixedcontent"] = Boolean(record.mixedcontent)
      formatted["targets"] = [record.target]
      matches.push(formatted)
    } else {
      matches[index].targets.push(record.target)
    }
  }
  let matchesWithCount = {"count": count, "matches": matches}
  return matchesWithCount
}

const newProposal = async (proposal) => {
  // NOTE: Very important to avoid off-by-one error.
  // proposalid must be set BEFORE proposal insertion
  const proposalidQuery = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE  TABLE_NAME = 'proposal_rulesets';"
  const proposalidQuerydata = await queryPromise (proposalidQuery)
  const proposalid = proposalidQuerydata[0]["AUTO_INCREMENT"]
  console.log(proposalid)

console.log("proposal database",proposal)
  // TODO: Copy data of the original ruleset?
  const query = "INSERT INTO `proposal_rulesets` (`rulesetid`, `author`, `pullrequest`, `name`, `file`, `default_off`, `mixedcontent`, `comment`) VALUES ?"
  const formatted_proposal = [[[
    proposal.rulesetid,
    proposal.author,
    proposal.pullrequest,
    null,
    null,
    null,
    false,
    null
  ]]]

  const data = await queryPromise (query, formatted_proposal)
  // TODO: extract proposalid from result of this query to avoid the first query and handle erorrs

  return proposalid
}

const deleteProposal = async (proposalid) => {
  const query = "DELETE FROM `proposal_rulesets` WHERE `proposalid` = ?;"

  const data = await queryPromise (query, [proposalid])
}

const saveProposal = async (proposal) => {
  console.log(proposal)
// TODO: handle case when a category is empty
  const queryProposal = "UPDATE `proposal_rulesets` SET `rulesetid`=?, `author`=?, `pullrequest`=?, `name`=?, `file`=?, `default_off`=?, `mixedcontent`=?, `comment`=? WHERE `proposalid`=?;\
  DELETE FROM `proposal_ruleset_targets` WHERE `proposalid`=?;\
  DELETE FROM `proposal_ruleset_rules` WHERE `proposalid`=?;\
  DELETE FROM `proposal_ruleset_exclusions` WHERE `proposalid`=?;\
  DELETE FROM `proposal_ruleset_tests` WHERE `proposalid`=?;\
  DELETE FROM `proposal_ruleset_securecookies` WHERE `proposalid`=?;"

  const formattedProposal = [
    proposal.rulesetid,
    proposal.author,
    proposal.pullrequest,
    proposal.ruleset.name,
    proposal.ruleset.file,
    proposal.ruleset.default_off,
    proposal.ruleset.mixedcontent,
    proposal.ruleset.comment,
    proposal.proposalid,
    proposal.proposalid,
    proposal.proposalid,
    proposal.proposalid,
    proposal.proposalid,
    proposal.proposalid
  ]

  await queryPromise (queryProposal, formattedProposal)

  const queryTargets = "INSERT INTO `proposal_ruleset_targets` (`proposalid`, `target`, `comment`) VALUES ?;"

  let formattedTargetsArray = []
  for (const target of proposal.ruleset.targets)
    formattedTargetsArray.push([
      proposal.proposalid,
      target.target,
      target.comment
    ])

  await queryPromise (queryTargets, [formattedTargetsArray])

  const queryRules = "INSERT INTO `proposal_ruleset_rules` (`proposalid`, `from`, `to`, `comment`) VALUES ?;"

  let formattedRulesArray = []
  for (const rule of proposal.ruleset.rules)
    formattedRulesArray.push([
      proposal.proposalid,
      rule.from,
      rule.to,
      rule.comment
    ])

  await queryPromise (queryRules, [formattedRulesArray])

  if (proposal.ruleset.exclusions.length > 0){
    const queryExclusions = "INSERT INTO `proposal_ruleset_exclusions` (`proposalid`, `pattern`, `comment`) VALUES ?;"

    let formattedExclusions = []
    for (const exclusion of proposal.ruleset.exclusions)
      formattedExclusions.push([
        proposal.proposalid,
        exclusion.pattern,
        exclusion.comment
      ])

    await queryPromise (queryExclusions, [formattedExclusions])
  }

  if (proposal.ruleset.tests.length > 0){
    const queryTests = "INSERT INTO `proposal_ruleset_tests` (`proposalid`, `url`, `comment`) VALUES ?;"

    let formattedTests = []
    for (const test of proposal.ruleset.tests)
      formattedTests.push([
        proposal.proposalid,
        test.url,
        test.comment
      ])

    await queryPromise (queryTests, [formattedTests])
  }

  if (proposal.ruleset.securecookies.length > 0){
    const querySecurecookies = "INSERT INTO `proposal_ruleset_securecookies` (`proposalid`, `host`, `name`, `comment`) VALUES ?;"

    let formattedSecurecookies = []
    for (const securecookie of proposal.ruleset.securecookies)
      formattedSecurecookies.push([
        proposal.proposalid,
        securecookie.host,
        securecookie.name,
        securecookie.comment
      ])

    await queryPromise (querySecurecookies, [formattedSecurecookies])
  }
}

module.exports = {
  isOnline: isOnline,

  loadData: loadData,
  queryPromise: queryPromise,
  // Get ruleset data
  getRulesetById: getRulesetById,
  searchByTarget: searchRulesetsByTarget,

  // Store and retreive proposals
  saveProposal: saveProposal,
  newProposal: newProposal,
  deleteProposal: deleteProposal
}
