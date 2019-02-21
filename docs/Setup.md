# Deployment of HTTPS Observatory on server or personal machine

## Installing software and setting up database

Some of these will require `sudo`.

### Install SQL database server and Node.js

First, install SQL database, for example MySQL `mysql-server`, and Node.js `nodejs` and `npm`.

### Create the database and tables

Run `./database/setup.sh` to set up the database (with some helpful messages).

This script does the following:
 - Start MySQL server with `service mysql start`.
 - Drop user `'server'@'localhost'` and database `project`, if they exist.
 - Setup the database `project` and all tables in it and user `'server'@'localhost'` and grant it necessary permissions with `source setup.sql`.

You shold grant yourself permissions to work on the `project` database:
```
CREATE USER '<user>'@'localhost';
GRANT ALL ON project.* TO '<user>'@'localhost';
```
You can setup your user's passwords with `IDENTIFIED BY '<hash>'` (and you should, if anyone else has access to your computer or you have open ports). For our project deployment we don't need passwords because database is visible only from localhost anyway (and passwords are useless anyway because everyone on the VM has root and could reset your database password anyway).

You can see the structure of a table with
```
SHOW TABLES;
SHOW FULL COLUMNS FROM <table>;
```

### Install node dependencies
Go into the folder `node/` and run `npm install` to install all dependencies.
