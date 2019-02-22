# The development plan:
## Web UI
## Node server
## Database

# Refactoring:
## Node server

Use punycode on rule's from. (Need to split out protocol, apply punycode, add protocol back in.

Add checks for cases when formatted_* are empty arrays and don't call MySQL. Error checking.

Wait untill database is ready before starting Express.

### Paths
    Is there a `__dirname` alternative that returns the initial script's directory? If so, in `configuration.json` update database.state to use it. Similarly for most other paths.

### Upstream
The `npm` package `github` id deprecated, it was renamed. Should use new name to receive updates. 
https-everywhere/utils/labeller/index.js:var GitHubApi = require('github');

Some rule's from is very long, check out what's that.
