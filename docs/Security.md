# HTTPS Observatory Security Principles

# Security Mechanisms
We use the following mechanisms:

## Content Security Policy

```
Content-Security-Policy: default-src 'none'; style-src 'self'; script-src 'self'; object-src https://api.github.com/; block-all-mixed-content; upgrade-insecure-requests; report-uri localhost/csp/
```

## Referrer Policy
This is mostly for privacy.
```
Referrer-Policy: no-referrer
```


# Threats
