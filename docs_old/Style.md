# Code style conventions

This is a collection of style conventions used throughout the codebase. Most of these are just arbitrary decissions, so if you have any ideas for better conventions, tell others.

## JavaScript

### Strict mode
Each JavaScript file should start with `"strict mode"`.

### Spaces, no tabs
Two spaces per one level of nesting. This matches most other code.

### Avoid type-coerced comparisons
Avoid `==` and `!=` if at all possible, use strict comparison `===` and `!==` instead. [The Abstract Equality Comparison Algorithm](https://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3) is a bit complicated.

### No semicolons
Semmicolons in JavaScript are unnecessary in most cases. If there is an ambiguety of code interpretation, use alternative non-ambiguous syntax.

### No `var`
 - Use `const` if variable is assigned once and stays constant.
 - Use `let` if variable value needs to be reassigned.
 - Don't use `var`. If a variable with the same name is already defined (used for something else), pick a different variable name or rename that variable. This will minimize the chances of variable name collisions.

### Use promisses instead of callbacks

### Use modern JavaScript and JavaScript APIs
Use standards-compliant modern APIs instead of their old equivalents. For example, use [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) instead of [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest). If we ever need to support old browsers (which is unlikely), we can addpolyfills later.

## JSON
Try to write [standard JSON](https://www.json.org/), which means
 - No comments
   JSON is a data format and comments either break parsers, e.g. `JSON.parse()`, or are ignored. If you want to document schema of a JSON, just make an actual Markdown file in `docs/`. If you need to parse a file that contains comments, use JSON5 parser.
 - Object keys are strings so they need to be surrounded with quotation marks.

## HTML
Use HTML5 and adhere to the [CodeGuide.co](http://codeguide.co/) (insecure link).

## CSS
Use CSS3 and adhere to the [CodeGuide.co](http://codeguide.co/) (insecure link).

## SQL
### Use tabs
Use tabs for indentation because the levels of nesting are never very deep.

### Constraints
Use constraints to maintain integrity of the database:
 - Every "child" record has to reference "parent" with a `FOREIGN KEY` and deleted automatically when parent is deleted.
 - Every record attribute should have an appropriate type. E.g., strings need to have correct length limit, encoding, and collation tables.
 
 ### Comments
 Explain structure of the database in comments.