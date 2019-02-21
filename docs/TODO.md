# The development plan:
## Web UI
## Node server
## Database

# Refactoring:
## Node server

### Make data loading use promisses (instead of callbacks)
    Express server does not wait to finish loading data into the atabase (even though it should). Currently, we do not use promisses for interactions with the database because `mysql` does not support them.

    Here is what prints out (shortened for clarity) if you run server without valid state file (to force database reload):
    ```
    No valid database state file found...
    emptied everything
    Started loading rules...
    Scheduled insertion of ... ruleset records.
    Loaded data true <- this promise should resolve only after database is ready
    Server listening on port 3000 <- Express should be delayed untill database is ready
    Connected to database at mysql://server:@localhost/project <- only now we managed to connect to the database
    Inserted all HSTS preload records <- data loaded
    Inserted all rulesets <- data loaded
    ```

### Paths
    Is there a `__dirname` alternative that returns the initial script's directory? If so, in `configuration.json` update database.state to use it. Similarly for most other paths.
