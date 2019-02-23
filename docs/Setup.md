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
Go into the folder `https-observatory/node/` and run `npm install` to install all dependencies.
```
cd https-observatory/node/
npm install
```

### Download external data files
Go into `https-observatory/cache/` and download HTTPS Everywhere files and Chromium HSTS preload list.

#### HTTPS Everywhere Git repository
Clone the official HTTPS verywhere git repository under `cache` directory so that it is in `https-observatory/cache/https-everywhere/`:
```
cd https-observatory/cache/
git clone https://github.com/EFForg/https-everywhere.git
```

#### Chromium HSTS preload list
Download Chromium HSTS preload list from `https://cs.chromium.org/chromium/src/net/http/transport_security_state_static.json`.
