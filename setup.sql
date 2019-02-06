-- This creates the database 'project' and user 'server'.
-- This will fail if either of them exists (to avoid loss of data).
-- If you need to force script execution, add DROP DATABASE IF EXISTS 'project'; and similarl for user 'server'.

-- Create the database
CREATE DATABASE project;

-- Create user "server" with limited permissions
-- Could setup password with IDENTIFIED BY '<hash>', but there is no need to use passwords because db is visible only from localhost
CREATE USER 'server'@'localhost';
GRANT SELECT ON project.* TO 'server'@'localhost';

USE project;

-- token type
CREATE TABLE users (
	userid INT NOT NULL UNIQUE PRIMARY KEY,
	username VARCHAR(50) NOT NULL, 
	firstname VARCHAR(50),
	lastname VARCHAR(50),
	email VARCHAR(100),
	github_id INT UNIQUE,
	github_token VARCHAR(50)
);


-- name file default_off collate cs
CREATE TABLE rulesets (
	rulesetid INT NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL UNIQUE,
	file VARCHAR(50) UNIQUE,
	default_off VARCHAR(100),
	timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	rules ENUM('trivial', 'nontrivial', 'both') NOT NULL DEFAULT 'trivial',
	comment VARCHAR(255)
);

CREATE TABLE ruleset_targets (
	rulesetid INT NOT NULL,	
	target VARCHAR(255) NOT NULL UNIQUE COMMENT "ASCII case-insensitive",
	wildcard ENUM('subdomains', 'no', 'domain_and_subdomains', 'right_side') NOT NULL,
	`comment` VARCHAR(255)
) CHARACTER SET ascii;

CREATE TABLE ruleset_rules (
	rulesetid INT NOT NULL PRIMARY KEY,	
	`from` VARCHAR(255) NOT NULL,
	`to` VARCHAR(255) NOT NULL,
	comment VARCHAR(255)
);

CREATE TABLE ruleset_exclussions (
	rulesetid INT NOT NULL PRIMARY KEY,
	pattern VARCHAR(255) NOT NULL,
	comment VARCHAR(255)
);

CREATE TABLE ruleset_securecookies (
	rulesetid INT NOT NULL PRIMARY KEY,
	`host` VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
	comment VARCHAR(255)
);


-- SHOW FULL COLUMNS FROM targets;