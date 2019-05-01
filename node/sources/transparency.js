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
const punycode = require("punycode")
const fetch = require("node-fetch")
// Wrap libraries into promisses

/* Configuration */
const configuration = require("../configuration.json").database

// Where database state file is
const state_file_path = __dirname + "/" + configuration.state



const transparency_url = (domain) => {
  return "https://api.certspotter.com/v1/issuances?domain=" + domain + "&include_subdomains=true&expand=dns_names"
}

const relatedDomains = (domain) => {
  const url = transparency_url(domain)
  fetch(url)
  .catch(e => console.log(e))
  .then(response => response.json())
  .then(body => console.log(body))
}

module.exports = {
  relatedDomains: relatedDomains,
}
