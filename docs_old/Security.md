# HTTPS Observatory Security Principles

# Security Mechanisms
We use the following mechanisms:

## SQL Prepared Statements

Every query with any variables has to be made with prepared statements, even if the value of a variable is set by our own code or even is `const`. See Node.js mysql module [documentation](https://www.npmjs.com/package/mysql) for details.

## HTTP Headers
### Content Security Policy

Current policy is:
```
Content-Security-Policy: default-src 'none'; style-src 'self'; script-src 'self'; object-src https://api.github.com/; block-all-mixed-content; upgrade-insecure-requests; report-uri localhost/csp/
```

To avoid Cross-Site Scripting, we don't use `unsafe-inline` or `unsafe-eval`.

### Referrer Policy
This is mostly for privacy.
```
Referrer-Policy: no-referrer
```

## Disowning all external pages we link to

We should use at least on of these "rel" attribute values on every external link with `target="_blank"`: `"noopener"`, `"nofollow"`, `"noreferrer"`.

# Threats

### Cross-Site Scripting (XSS)
See Content Security Policy section.

## SQL Injection
See SQL Prepared Statements.
