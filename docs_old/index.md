# HTTPS Observatory

## Motivation

The modern web mostly relies on two protocols: plain-text (insecure) HTTP and encrypted (secure) HTTPS. Over the last five years, many developers and organizations worked hard to move away from HTTP to HTTPS. The percentage of "pages loaded over HTTPS" tripled in the last 5 years from 25% in January 2014 to over ~75% now (according to [Googe](https://transparencyreport.google.com/https/overview?hl=en) and [Firefox](https://letsencrypt.org/stats/#percent-pageloads)). Unfortunately, this metric might be misleading and does not account for sites that deploy HTTPS unreliably. For example, if a user clicks on an insecure HTTP URL that then redirects to a secure HTTPS page, the browser will display the page as "Secure". This might be problematic if an active adversary changes the content of insecure response to something other than a legitimate redirect or if the insecure request contains insecure cookies. The UI is not wrong (after a redirect, the loaded page was indeed delivered securely), but it works correctly only in absence of an active attacker and only if all cookies have "secure" flag set. Unreliable HTTPS deployment is caused by many factors, including complexity of existing standards, legacy code bases and CMS or simply lack of time to ensure all requests are made over HTTPS.

One client-side tool that aims to fix this problem is a browser extension HTTPS Everywhere. This tool relies on a database of rules telling it which requests to rewrite from HTTP to HTTPS and how to do it, before avoidng making the insecure requests. Unfortunately, despite large user base (over 3 million browser extension users across Chrome, Firefox and Opera, and a number of other organizations using the rulesets) many rules are stale because updates are done mostly manually by a small number of volunteers on GitHub.

We strive to simplify process of writing and maintenance of HTTPS Everywhere rules. If we are successful, this tool will would improve security for over 3 million HTTPS Everywhere browser extension users and many more users of [HTTPS Everywhere downstream dependencies](https://github.com/EFForg/https-everywhere/wiki/List-of-downstream-dependencies).

## Approach

We want to integrate a set of tools for task automaton and a convenient UI for novice ruleset creators. Of course, all rules will be integrated into repository only after a manual approval (no automatic test can ever acheive 100% coverage).

## State of the Project

We started developing this tool recently and many features are still incomplete. Yet, we believe that already this tool is more convenient than the official [HTTPS Everywhere Atlas](https://www.eff.org/https-everywhere/atlas/).

## Disclaimer

We are not affiliated with HTTPS Everywhere in any way and this tool is not offically endorsed by anyone. In fact, it's in very early development and does not completely work yet.

## Table Of contents
 - [Security](Security.md)	- how we secure our own server
 - [Setup](Setup.md) - how to deploy your own instance of this project
 - [TODO](TODO.md)
