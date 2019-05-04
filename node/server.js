/** Server using Node.js and Express
 * This file all network-oriented code:
 *  - HTTP status codes
 *  - security headers
 *  - authentication logic (later)
 */

"use strict"

/* Node.js standard libraries */
const fs = require("fs")
const path = require("path")

/* NPM libraries */
const express = require("express")
const compression = require("compression")
const helmet = require("helmet")
const validator = require('validator')

/* Custom libraries */
const database = require("./database/database.js")

/* Configuration */
const configuration = require("./configuration.json").express

/* Make Node crash on unhandled promise rejection
 * Unhandled promise rejection is deprecated
 * Source: https://medium.com/@dtinth/making-unhandled-promise-rejections-crash-the-node-js-process-ffc27cfcc9dd
 */
process.on("unhandledRejection", up => { throw up })

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

  // Set mode to production
  server.set("env", configuration.env)

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
    const target = request.query.target

    if (target.length < 2){
      // Status code 400 "Bad Request"
      response.status(400)
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify({"message" : "Invalid input: Query requires two or more characters."}))
      return
    }

    database.searchByTarget(target)
    .then ((ruleset) => {
      response.status(200)
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify(ruleset))
    })
  })

  server.get("/scrape?", (request, response) => {
    const target = request.query.target

    if (target.length < 2){
      // Status code 400 "Bad Request"
      response.status(400)
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify({"message" : "Invalid input: Query requires two or more characters."}))
      return
    }

    // Makes sure the url is valid, otherwise could crash the server
    const options = { protocols: ['http','https','ftp'], require_tld: true, require_protocol: true, require_host: true, require_valid_protocol: true, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: false, disallow_auth: false }
    
    if (!validator.isURL(target, options)) {
      response.status(400)
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify({"message" : "Invalid URL"}))
      return
    }

    database.scrapeURL(target)
    .then ((result) => {
      response.status(200)      
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify(result)) 
    })
  })

  server.get("/rulesetinfo?", (request, response) => {
    console.log("Request: /rulesetinfo? query:", JSON.stringify(request.query))

    const rulesetid = parseInt(request.query.rulesetid)

    database.getRulesetById(rulesetid)
    .then ((ruleset) => {
      response.setHeader("Content-Type", "application/json")
      response.send(JSON.stringify(ruleset))
    })
  })

  // Parse body into JSON
  // This middlevare is put here so that it does not run for all the endpoints above.
  // All endpoints that accept requests with JSON payload in body must go below.
  server.use(express.json())

  // 
  server.post("/new/", (request, response) => {
    // TODO: check authorization

    // Proposal contains the rulesetid of rule that is to be forked as well as info about its author
    const new_proposal = request.body

    database.newProposal(new_proposal)
    .then(result => {
      console.log(JSON.stringify(result))
      response.setHeader("Content-Type", "application/json")
      response.status(201)
      response.send(JSON.stringify({
        "message": "Created",
        "proposalid": result
      }))
    })

  })

  server.delete("/delete?", (request, response) => {
    // TODO: check authorization
    const proposalid = request.query.proposalid

    database.deleteProposal(proposalid)
    .then(() => {
      response.setHeader("Content-Type", "application/json")
      response.status(200)
      response.send(JSON.stringify({'message': 'Deleted'}))
    })
    .catch(error => {
      response.setHeader("Content-Type", "application/json")
      response.status(404)
      response.send(JSON.stringify({'message': 'You are being weird.'}))
    })
  })

  server.put("/save/", (request, response) => {
    // TODO: check authorization

    // Proposal contains the proposed ruleset as well as info about its author
    const proposal = request.body

    console.log(JSON.stringify(proposal))
    // TODO: handle database errors
    database.saveProposal(proposal)
    response.setHeader("Content-Type", "application/json")
    response.status(200)
    response.send(JSON.stringify({'message': 'Updated'}))
  })

  // This is unnecessary if Express "env" is set to "production"
  // Do not leak details about internal errors
  if (server.get("env") !== "production")
    server.use((error, request, response, next) => {
      // Log error message for later review
      console.error("Prevented sending this error to client:\n", error)

      // If HTTP Status Code is not set, default to '500 Internal Server Error (500)'
      const status = error.statusCode ? error.statusCode : 500

      response.status(status)

      response.send('Internal server error. Check server console for details.')
    })

  server.listen(configuration.port, () =>
    console.log(`Server listening on port ${configuration.port}`)
  )

}

// Start server
main()
