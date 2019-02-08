# Deployment of HTTPS Observatory on server or personal machine

## Installing software and setting up database

Some of these will require `sudo`.

### Install SQL database server and Node.js

First, install SQL database, for example MySQL `mysql-server`, and Node.js `nodejs` and `npm`.

### Create the database and tables
Start MySQL, for example with `service mysql start`.

Setup the database `project` all projects in it and user `server` and grant it necessary permissions with `source setup.sql`.
You can run it as `sudo mysql -e source ./setup.sql`.

You shold grant yourself permissions to work on the `project` database:
```
CREATE USER '<user>'@'localhost';
GRANT ALL ON project.* TO '<user>'@'localhost';
```
You can setup your user's passwords with `IDENTIFIED BY '<hash>'` (and you should if anyone else has access to your computer or you have open ports). For our project deployment we don't need passwords because database is visible only from localhost anyway (and everyone on the VM has root and could reset your database password anyway).

You can see the structure of a table with
```
SHOW FULL COLUMNS FROM <table>;
```

### Install node dependencies
Go into the folder `node/` and run `npm install` to install all dependencies.
