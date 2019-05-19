# HTTPS Observatory

[![Known Vulnerabilities](https://snyk.io/test/github/bershanskiy/https-observatory/badge.svg?targetFile=node%2Fpackage.json)](https://snyk.io/test/github/bershanskiy/https-observatory?targetFile=node%2Fpackage.json)
[![Dependencies](https://david-dm.org/bershanskiy/https-observatory.svg?path=node)](https://david-dm.org/)

This is an automated system for creating and maintaining HTTPS rules.

To run the server, check out all dependencies in `cache`, start the database, and run `node node/server.js`.


See also:
[Installation instructions](./docs/Setup.md)

You probably already know that modern web mostly uses two protocols: plain text (insecure) HTTP and encrypted (secure) HTTPS. Although the percentage of "pages loaded over HTTPS" tripled in the last 5 years from (25% in January 2014 to over ~75% now[Googe][Firefox]), that metric does not account for sites that deploy HTTPS unreliably and we can fix this (see examples). This is caused by many factors, including complexity of existing standards, legacy code bases and CMS or simply laziness of site administrators to ensure all requests are made over HTTPS. One client-side tool that aims to fix this problem is a browser extension HTTPS Everywhere, which relies on a database of rules telling it which requests to rewrite from HTTP to HTTPS and how to do it. Unfortunately, despite large user base (over 3 million extension users across Chrome, Firefox and Opera) many rules are stale because updates are done mostly manually by a small number of volunteers on GitHub. We plan to automate this process and update existing rulesets and create new ones.

This application will be immediately useful to all 3 million HTTPS Everywhere users once we start merging rulesets upstream and will be useful for site administrators interested in securing their services.
