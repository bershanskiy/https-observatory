"use strict"

/* TODO: This code has the following issues:
 *  - BUG: When a ruleset is updated, it does not delete existing records
 *  - I have no idea where it gets the rulesetid
 *  - 
*/

/* Node.js standard libraries */
const exec = require("child_process").exec

/* How often we want to make our pulls - currently 15 minutes */
// TODO: make it not a timer but a git hook
const intervalAmount = 1000*60*15

let connection;

function updateDatabase(file_differences, loadDataRules) {
  console.log("Inside updateDatabase!")
  const fileList = file_differences.split("\n")
  // TODO: BUG: delete existing records for the updated file
  for (file of fileList)
    loadDataRules(file)
}

function makePulls(loadDataRules) {
  console.log("Executing makePulls...")

  const path = __dirname + "/../../" + "cache/https-everywhere"

  process.chdir(path)
  const preCommit = exec("git rev-parse HEAD", {cwd: path}, function(err, stdout_pre, stderr) {
    console.log(stdout_pre)
    exec("git pull", {cwd: path}, function(err, stdout_pull, stderr) {
      console.log("Pulling...")
      const postCommit = exec("git rev-parse HEAD", {cwd: path}, function(err, stdout_post, stderr) {
        console.log(stdout_post)
        exec("git diff" + preCommit + " " + postCommit + "--name-only", {cwd: path},
        function(err, stdout_differences, stderr) {
          // this function will update the database in the case of differences
          if (stdout_differences != "") {
            updateDatabase(stdout_difference, loadDataRules)
          } else {
            console.log("No file differences...")
          }
        })
      })
    })
    console.log("")
  })
}

const checkOnTimer = (connection_, loadDataRules) => {
  connection = connection_
  makePulls(loadDataRules)
  setInterval(makePulls, intervalAmount)
}

module.exports = {
  checkOnTimer: checkOnTimer
}
