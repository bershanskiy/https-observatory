// var json = '{"result":true,"count":1}', // replace with the valid JSON data
//     obj = JSON.parse(json);
var exec = require('child_process').exec;
const fetch = require("node-fetch");
const request = require('request');

var obj = {
    "rulesetid": 1,
    "name": "01.org",
    "file": "ExampleRuleset.xml",
    "default_off": "",
    "mixedcontent": false,
    "comment": "",
    "targets": ["01.org", "www.01.org", "download.01.org", "lists.01.org", "ml01.01.org"],
    "rules": [
        {
            "from": "^http://",
            "to": "https://"
        }
    ],
    "exclussions": [
        {
            "pattern": "01.org/insecure",
            "comment": "this is made-up"
        }
    ],
    "securecookies": [
        {
            "host":".+",
            "name":".+",
            "comment":"all"
        }
    ]
};

// store all variables
var rulesetid = obj.rulesetid;
var rulename = obj.name;
var file = obj.file;
var default_off = obj.default_off;
var mixedcontent = obj.mixedcontent;
var comment = obj.comment;
var targets = obj.targets; // this is a list of targets (strings)
var rules = obj.rules; // this is a list of rule pairs (JSON object)
var exclusions = obj.exclussions; // this is a list of exclusion pairs(JSON object)
var securecookies = obj.securecookies; // this is a another list of JSON objects

////////// NEED TO PERFORM GIT INTEGRATION TO SET UP PR ///////////////////


// let's just start by generating the .xml file for the new ruleset
// writefile.js

const fs = require('fs');

// store our final output string
var finalOutput = "";
// generate our ruleset string
var rulesetname = '<ruleset name="' + obj.name + '">\n';
finalOutput += rulesetname;
// generate our list of target names
var targetsList = [];
for (target of targets) {
  targetsList.push('\t<target host="' + target + '" />\n');
  finalOutput += '\t<target host="' + target + '" />\n';
}
finalOutput += "\n";
// generate our secure cookies list
var secureCookiesList = [];
for (securecookie of securecookies) {
  var host = securecookie.host;
  var name = securecookie.name;
  secureCookiesList.push('\t<securecookie host="' + host + '" name="' + name + '" />\n');
  finalOutput += '\t<securecookie host="' + host + '" name="' + name + '" />\n';
}
finalOutput += "\n";
// generate our rules list
var rulesList = [];
for (rule of rules) {
  var from = rule.from;
  var to = rule.to;
  rulesList.push('\t<rule from="' + from + '" to="' + to + '" />\n')
  finalOutput += '\t<rule from="' + from + '" to="' + to + '" />\n';
}
finalOutput += "\n";
finalOutput += "</ruleset>";
// change the working directory to our fork of HTTPS-Everywhere to begin the PR
try {
  if (process.cwd().includes('https-everywhere') == 0) {
  process.chdir('../../cache/https-everywhere/src/chrome/content/rules');
}
  console.log('New directory to write ruleset: ' + process.cwd());
}
catch (err) {
  console.log('error in generateruleset: ' + err);
}
// now assume the file has been written to your fork of HTTPS-Everywhere
var pullChanges = exec("git pull", function(err, stdout_pre, stderr) {
});
// write to a new file in the correct https-observatory directory
fs.writeFile(file, finalOutput, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
    // success case, the file was saved
    console.log('Output generations success!');
});
// need to commit and push changes to personal branch
var addAndCommitChanges = exec('git add ' + file + ' && git commit -m "Adding ruleset for ' +  file + '"',
  function(err, stdout_pre, stderr) {
    if (!err) {
      console.log("adding and committing...");
    }
  });
var pushChanges = exec("git push", function(err, stdout_pre, stderr) {
  if (!err) {
    console.log("pushing...");
  }
});
// now perform the PR using Github's API

var jsonObject = '{"title: "Creating ruleset for ' + file + '"head": "irlbeck2:testing_branch", "base":"irlbeck2:head"}'
var command1 = "curl -i -u 'USER:PASS' -d ";
var entireString = command1 + jsonObject + ' https://api.github.com/repos/EFForg/https-everywhere/pulls';
var execute = exec(entireString, function(err, stdout_pre, stderr) {

});
//curl -i -u 'user:password' -d '{"title": "Creating ruleset for Example.xml", "head": "irlbeck2:master", "base": "master"}' https://api.github.com/repos/EFForg/https-everywhere/pulls
