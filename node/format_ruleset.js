function formatRuleset(obj) {
  // store all variables
  var rulename = obj.name;
  var file = obj.file;
  var default_off = obj.default_off;
  var mixedcontent = obj.mixedcontent; // this is boolean
  var targets = obj.targets; // this is a list of target, comment pairs
  var rules = obj.rules; // this is a list of from, to, comment tuples
  var exclusions = obj.exclusions; // this is a list of pattern, comment pairs
  var securecookies = obj.securecookies; // this is a list of host, name, comment pairs
  var tests = obj.tests; // this is a list of tests

  // let's just start by generating the .xml file for the new ruleset
  // writefile.js

  const fs = require('fs');

  // store our final output string
  var finalOutput = "";
  // generate our ruleset string
  var rulesetname = '<ruleset name="' + obj.name + '">\n';
  finalOutput += rulesetname;
  // generate our list of target names
  //var targetsList = [];
  for (target of targets) {
    //targetsList.push('\t<target host="' + target.target + '" />\n');
    finalOutput += '\t<!-- ' + target.comment + ' -->\n';
    finalOutput += '\t<target host="' + target.target + '" />\n';
  }
  finalOutput += "\n";
  // generate our secure cookies list
  //var secureCookiesList = [];
  for (securecookie of securecookies) {
    var host = securecookie.host;
    var name = securecookie.name;
    var comment = securecookie.comment;
    //secureCookiesList.push('\t<securecookie host="' + host + '" name="' + name + '" />\n');
    finalOutput += '\t<!-- ' + comment + ' -->\n';
    finalOutput += '\t<securecookie host="' + host + '" name="' + name + '" />\n';
  }
  finalOutput += "\n";
  // generate our rules list
  //var rulesList = [];
  for (rule of rules) {
    var from = rule.from;
    var to = rule.to;
    var comment = rule.comment;
    //rulesList.push('\t<rule from="' + from + '" to="' + to + '" />\n')
    finalOutput += '\t<!-- ' + comment + ' -->\n';
    finalOutput += '\t<rule from="' + from + '" to="' + to + '" />\n';
  }
  for (test of tests) {
    var url = test.url;
    var comment = test.comment;
    finalOutput += '\t<!-- ' + comment + ' -->\n';
    finalOutput += '\t<test url="' + url + '" />\n';
  }

  for (exclusion of exclusions) {
    var pattern = exclusion.pattern;
    var comment = exclusion.comment;
    finalOutput += '\t<!-- ' + comment + ' -->\n';
    finalOutput += '\t<rule from="' + from + '" to="' + to + '" />\n';
  }
  finalOutput += "\n";
  finalOutput += "</ruleset> \n";
  // adding
  return finalOutput;
}

module.exports = {
  formatRuleset: formatRuleset
}

/* TODO:
1. Use Github API to write files to a repo, make a fork,  etc.
2. Figure out best way to store user data, in cookies or whatnot
3. Fix the front-end to account for this
*/
