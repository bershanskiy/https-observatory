-- This creates the database 'project' and user 'server'.
-- This will fail if either of them exists (to avoid loss of data).
-- If you need to force script execution, add DROP DATABASE IF EXISTS 'project'; and similarl for user 'server'.

-- Create the database
CREATE DATABASE `project`;

-- Create user "server" with limited permissions
-- Could setup password with IDENTIFIED BY '<hash>', but there is no need to use passwords because db is visible only from localhost
CREATE USER 'server'@'localhost'; -- IDENTIFIED BY 'password';
-- Set up a password:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON `project`.* TO 'server'@'localhost';

USE project;

-- token type
CREATE TABLE `users` (
	`userid` INT NOT NULL UNIQUE PRIMARY KEY AUTO_INCREMENT
		COMMENT 'Internal identifier (for database use only)',
	`github_id` VARCHAR(50) UNIQUE KEY,
	`github_token` VARCHAR(50)
) CHARACTER SET ascii;

CREATE TABLE `rulesets` (
	`rulesetid` INT NOT NULL UNIQUE PRIMARY KEY AUTO_INCREMENT
		COMMENT 'Internal identifier (for database use only)',
	`name` VARCHAR(100) NOT NULL        -- Turns out, name is not unique TODO: bring this to maintainers' attention
		COMMENT 'Value of the ruleset attribute "name"',
	`file` VARCHAR(150) NOT NULL-- TODO: UNIQUE -- Per docs file contains exactly one ruleset
		COMMENT 'Name of XML file the ruleset was loaded from',
	`default_off` VARCHAR(100)          -- there are multiple possible values and their combinations
		COMMENT 'Value of the ruleset attribute "default_off"',
	`mixedcontent` BOOLEAN NOT NULL DEFAULT FALSE
		COMMENT 'Ruleset has attribute platform="mixedcontent"',
	`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		COMMENT 'Latest update timestamp',
	`comment` VARCHAR(255) DEFAULT NULL
		COMMENT 'Any freeform text comment (for human use only)'
) CHARACTER SET utf8mb4;

CREATE TABLE `ruleset_targets` (
	`rulesetid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`target` VARCHAR(255) NOT NULL -- A full domain name is limited to 255 octets (including the separators). (IETF RFC2181 section 11).
		COMMENT 'Value of "host" attribute, encoded in Punycode if needed. ASCII case insensitive',
	`comment` VARCHAR(255) DEFAULT NULL
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_targets
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
) CHARACTER SET ascii;

CREATE TABLE `ruleset_rules` (
	`rulesetid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`rulesetruleid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`from` VARCHAR(5000) NOT NULL
		COMMENT 'JS regular expression',
	`to` VARCHAR(255) NOT NULL
		COMMENT 'JS replacement regular expression',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_rules
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
	-- PRIMARY KEY (`rulesetid`, `rulesetruleid`) -- (`rulesetid`, `from`)
);

CREATE TABLE `ruleset_tests` (
	`rulesetid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`rulesettestid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`url` VARCHAR(5000) NOT NULL
		COMMENT 'URL that will be queried',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_tests
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
	-- PRIMARY KEY (`rulesetid`, `url`)
);

CREATE TABLE `ruleset_exclusions` (
	`rulesetid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`rulesetexclusionid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`pattern` VARCHAR(5000) NOT NULL
		COMMENT 'Exclussion pattern',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_exclussions
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
	-- PRIMARY KEY (`rulesetid`, `pattern`)
);

CREATE TABLE `ruleset_securecookies` (
	`rulesetid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`rulesetsecurecookieid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`host` VARCHAR(5000) NOT NULL
		COMMENT 'Regular expression for matching domain of the cookie',
	`name` VARCHAR(5000) NOT NULL
		COMMENT 'Regular expression for matching name of the cookie',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_securecookies
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
	-- PRIMARY KEY (`rulesetid`, `host`, `name`)
);

-- This table represents "entries" attribute from
-- transport_security_state_static.json from Chromium source tree.
-- We don't need "pinsets" for now, although we could add it later or
-- import it directly in JS (it's tiny).
-- Some comments are copied from the comments at the top of the file.
CREATE TABLE evidence_hsts_preload (
	-- This is the fully-qualified domain name that the policy applies to
	-- (includeSubdomains is a separate entry).
	-- A full domain name is limited to 255 octets (including the separators).
	-- Source: https://tools.ietf.org/html/rfc2181#section-11
	-- In practice preload entry domains are short, most old (and all new ones) are eTLD+1.
	`name` VARCHAR(255) NOT NULL PRIMARY KEY
		COMMENT 'Fully-qualified domain name (IDN in punycode)',
	-- The policy under which the domain is part of the
	-- preload list. This field is used for list maintenance.
	`policy` ENUM (                            -- These values come from JSON and new values might be added later.
			'test',                    -- Test domains.
			'google',                  -- Google-owned sites.
			'custom',                  -- Entries without includeSubdomains or with HPKP/Expect-CT.
			'bulk-legacy',             -- Bulk entries preloaded before Chrome 50.
			'bulk-18-weeks',           -- Bulk entries with max-age >= 18 weeks (Chrome 50-63).
			'bulk-1-year',             -- Bulk entries with max-age >= 1 year (after Chrome 63).
			'public-suffix-requested', -- Public suffixes preloaded at the owners request (manual).
			'public-suffix'            -- This option is NOT DOCUMENTED, but appears to apply to Google's own TLDs (manual).
		) NOT NULL,
	-- This optional boolean tells if policy applies only to this domain or all its subdomains
	-- This is for backwards-compatibility (new entries are required to have it set to "true").
	-- It means:
	--   ~ If mode == "force-https", then apply force-https to subdomains.
	--   ~ If "pins" is set, then apply the pinset to subdomains.
	`include_subdomains` BOOLEAN NOT NULL DEFAULT FALSE,
	-- Represents whether subdomains of |name| are also covered for pinning.
	-- As noted above, |include_subdomains| also has the same effect on pinning.
	`include_subdomains_for_pinning` BOOLEAN NOT NULL,
	-- NOTE: THIS IS A LARGE SIMPLIFICATION of 'mode'!!!!!!!
	-- In the document mode can be either omitted (undefined) or "force-https",
	-- so I simplify this to force_https BOOLEAN.
	-- Whether or not covered names should require HTTPS.
	-- This very rarely would be set to 'false'
	`force_https` BOOLEAN NOT NULL,
	-- The name of the pinset (if applicable). We don't store pinsets for now.
	-- There is no clear limit on length of this, but all existing values are
	-- less than 10 characters long.
	`pins` VARCHAR(20) DEFAULT NULL,
	-- NOTE: expect_ct is OMMITTED because it's redundant
	-- (because it's true if and only if expect_ct_report_uri is not NULL)
	-- True if the site expects Certificate Transparency information to be
	-- present on requests to |name|.
	-- expect_ct BOOLEAN DEFAULT NULL,
	--
	-- The URI to which reports should be sent when valid Certificate
	-- Transparency information is not present (optional).
	-- There is no limit on URI length, but all current values are pretty short.
	`expect_ct_report_uri` VARCHAR(100) DEFAULT NULL
) CHARACTER SET ascii;

-- Proposals

CREATE TABLE `proposal_rulesets` (
	`rulesetid` INT -- NULL if this is a new ruleset
		COMMENT 'Internal identifier (for database use only)',
	`proposalid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'Internal identifier (for database use only)',
	`author` VARCHAR(100) NOT NULL
		COMMENT 'The author of the proposal', -- TODO: determine the datatype
	`pullrequest` INT
		COMMENT 'NULL if this is a draft',
	`name` VARCHAR(100)
		COMMENT 'Value of the ruleset attribute "name"',
	`file` VARCHAR(150)
		COMMENT 'Name of XML file the ruleset was loaded from',
	`default_off` VARCHAR(100)  -- there are multiple possible values and their combinations
		COMMENT 'Value of the ruleset attribute "default_off"',
	`mixedcontent` BOOLEAN NOT NULL DEFAULT FALSE
		COMMENT 'Ruleset has attribute platform="mixedcontent"',
	`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		COMMENT 'Latest update timestamp',
	`comment` VARCHAR(255) DEFAULT NULL
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_rulesetid_proposal_rulesets
		FOREIGN KEY (rulesetid) REFERENCES rulesets(rulesetid)
		ON DELETE CASCADE
		-- TODO: Do not delete proposal if parent ruleset is deleted
		-- Create INSTEAD OF TRIGGER to handle parent deletion
) CHARACTER SET utf8mb4;

CREATE TABLE `proposal_ruleset_targets` (
	`proposalid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`target` VARCHAR(255) NOT NULL -- A full domain name is limited to 255 octets (including the separators). (IETF RFC2181 section 11).
		COMMENT 'Value of "host" attribute, encoded in Punycode if needed. ASCII case insensitive',
	`comment` VARCHAR(255) DEFAULT NULL
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_proposalid_targets
		FOREIGN KEY (proposalid) REFERENCES proposal_rulesets(proposalid)
		ON DELETE CASCADE
) CHARACTER SET ascii;

CREATE TABLE `proposal_ruleset_rules` (
	`proposalid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`proposalrulesetruleid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`from` VARCHAR(5000) NOT NULL
		COMMENT 'JS regular expression',
	`to` VARCHAR(255) NOT NULL
		COMMENT 'JS replacement regular expression',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_proposalid_rules
		FOREIGN KEY (proposalid) REFERENCES proposal_rulesets(proposalid)
		ON DELETE CASCADE
);

CREATE TABLE `proposal_ruleset_tests` (
	`proposalid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`proposalrulesettestid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`url` VARCHAR(5000) NOT NULL
		COMMENT 'URL that will be queried',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_proposalid_tests
		FOREIGN KEY (proposalid) REFERENCES proposal_rulesets(proposalid)
		ON DELETE CASCADE
);

CREATE TABLE `proposal_ruleset_exclusions` (
	`proposalid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`proposalrulesetexclusionid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`pattern` VARCHAR(5000) NOT NULL
		COMMENT 'Exclussion pattern',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_proposalid_exclussions
		FOREIGN KEY (proposalid) REFERENCES proposal_rulesets(proposalid)
		ON DELETE CASCADE
);

CREATE TABLE `proposal_ruleset_securecookies` (
	`proposalid` INT NOT NULL
		COMMENT 'Internal identifier (for database use only)',
	`proposalrulesetsecurecookieid` INT NOT NULL AUTO_INCREMENT PRIMARY KEY
		COMMENT 'TODO: remove this',
	`host` VARCHAR(5000) NOT NULL
		COMMENT 'Regular expression for matching domain of the cookie',
	`name` VARCHAR(5000) NOT NULL
		COMMENT 'Regular expression for matching name of the cookie',
	`comment` VARCHAR(255)
		COMMENT 'Any freeform text comment (for human use only)',
	CONSTRAINT FK_proposalid_securecookies
		FOREIGN KEY (proposalid) REFERENCES proposal_rulesets(proposalid)
		ON DELETE CASCADE
);
