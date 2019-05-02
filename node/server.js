/* Server using Node.js and Express */

/* Node.js standard libraries */
const fs = require("fs")
const path = require("path")

/* NPM libraries */
const express = require("express")
const compression = require("compression")
const helmet = require("helmet")

/* Custom libraries */
const database = require("./database/database.js")

/* Configuration */
const configuration = require("./configuration.json").express

/**
 * This is the main function of the entire server.
 * It is async so that we can use await inside of it.
 */
const main = async () => {
  // First, load all data
  const loaded = await database.loadData()
  console.log("Loaded data", loaded)

  // Start Express server
  const server = express()

  // Do not leak information about Express server in "x-powered-by" header
  server.disable("x-powered-by")

  // Compress trafic to save bandwidth
  server.use(compression())

  server.use(helmet({
    // Set "X-Frame-Options: DENY"
    "frameguard": {
      "action": "deny"
    },
    // Set "Referrer-Policy: no-referrer"
    "referrerPolicy": {
      "policy": "no-referrer"
    },
    // Content Security Policy
    "contentSecurityPolicy": {
      "directives": {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "connect-src": ["'self'"],
        "worker-src": ["'none'"],
        "child-src": ["'none'"],
        "base-uri": ["'none'"]
      }
    },
    // Disable Adobe Flash and Adobe Acrobat
    "permittedCrossDomainPolicies": {
      "permittedPolicies": "none"
    }
  }))

  // Serve static content from webui folder
  const webui = path.join(__dirname, "/../webui")
  const xml =   path.join(__dirname, "/../cache/https-everywhere/src/chrome/content/rules")
  server.use(express.static(webui))
  server.use("/xml/", express.static(xml)) // TODO: add midleware to track release ruleset?

  // Serve dynamic content from "/search?" API endpoint
  server.get("/search?", (request, response) => {

    if (request.query.target.length < 2){
      // Status code 400 "Bad Request"
      response.status(400)
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify({"message" : "Invalid input: Query requires two or more characters."}))
      return
    }

    const   page_num = parseInt(request.query.page_num)
    const BATCH_SIZE = 50
    const  joinQuery = 'SELECT * FROM (SELECT name, file, rulesets.rulesetid, default_off, rulesets.comment, mixedcontent, target FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE ?) AS T LIMIT ?,?;'
    const targetName = "\%" + request.query.target + "\%"
    
    const countQuery = 'SELECT count(rulesetid) AS total_count FROM (SELECT rulesetid FROM (SELECT name, file, rulesets.rulesetid, default_off, rulesets.comment, mixedcontent, target FROM ruleset_targets INNER JOIN rulesets ON ruleset_targets.rulesetid=rulesets.rulesetid WHERE ruleset_targets.target LIKE ?) AS T GROUP BY rulesetid) AS Q;'

    database.query(countQuery, [targetName]).then((result) => {
      const count = result[0].total_count
      var dataWithCount = {}
      dataWithCount['count'] = count

      database.query(joinQuery, [targetName, (page_num - 1)*BATCH_SIZE , BATCH_SIZE ]).then((result) => {
        var data = []
        for (const record of result){
          var index = -1
          for (const i in data)
            if (data[i].name === record.name){
              index = i
              break
            }
          if (index === -1){
            index = data.length
            var formatted = {}
            formatted["name"] = record.name
            formatted["file"] = record.file
            formatted["rulesetid"] = record.rulesetid
            if (record.default_off)
              formatted["default_off"] = record.default_off
            if (record.comment)
              formatted["comment"] = record.comment
            if (record.mixedcontent[0] === 1)
              formatted["mixedcontent"] = true
            formatted["targets"] = [record.target]
            data.push(formatted)
          } else {
            data[index].targets.push(record.target)
          }
        }
        dataWithCount['data'] = data
        response.setHeader("Content-Type", "application/json")
        response.send(JSON.stringify(dataWithCount))
      })
    })
  })

  server.get("/rulesetinfo?", (request, response) => {
    console.log("Request: /rulesetinfo? query:", JSON.stringify(request.query))

    const rulesetid = request.query.rulesetid
    const longList  = [rulesetid, rulesetid, rulesetid, rulesetid, rulesetid, rulesetid] 
    const longQuery = "SELECT * FROM rulesets WHERE rulesets.rulesetid=?; \
      SELECT * FROM ruleset_targets WHERE ruleset_targets.rulesetid=?; \
      SELECT * FROM ruleset_rules WHERE ruleset_rules.rulesetid=?; \
      SELECT * FROM ruleset_exclusions WHERE ruleset_exclusions.rulesetid=?; \
      SELECT * FROM ruleset_securecookies WHERE ruleset_securecookies.rulesetid=?; \
      SELECT * FROM ruleset_tests WHERE  ruleset_tests.rulesetid=?;"

    database.query(longQuery, longList).then((data) => {
      // Convert response into a neat object
      const result = {
        "rulesetid": rulesetid,
        "name": data[0][0]["name"],
        "file": data[0][0]["file"],
        "default_off": data[0][0]["default_off"],
        "mixedcontent": data[0][0]["mixedcontent"][0] === 1, // This converts a buffer to boolean
        "comment": data[0][0]["comment"],
        "targets": data[1],
        "rules": data[2],
        "exclusions": data[3],
        "securecookies": data[4],
        "tests": data[5]
      }
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify(result))
    })
  })

  // Parse body into JSON
  // This middlevare is put here so that it does not run for all the endpoints above.
  // All endpoints that accept requests with JSON payload in body must go below.
  server.use(express.json())

  server.put("/save/", (request, response) => {
    const ruleset = request.body
    console.log(JSON.stringify(ruleset))
    response.setHeader("Content-Type", "application/json")
    response.status(201)
    response.send(JSON.stringify({'message': 'Received'}))
  })

  server.listen(configuration.port, () =>
    console.log(`Server listening on port ${configuration.port}`)
  )
}

// Start server
main()
