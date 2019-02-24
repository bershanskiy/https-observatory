// var json = '{"result":true,"count":1}', // replace with the valid JSON data
//     obj = JSON.parse(json);

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
var rulesetname = obj.name;
var file = obj.file;
var default_off = obj.default_off;
var mixedcontent = obj.mixedcontent;
var comment = obj.comment;
var targets = obj.targets; // this is a list of targets (strings)
var rules = obj.rules; // this is a list of rule pairs (JSON object)
var exclusions = obj.exclusions; // this is a list of exclusion pairs(JSON object)
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

// write to a new file in the correct https-observatory directory
fs.writeFile(file, finalOutput, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Output generations success!');
});
