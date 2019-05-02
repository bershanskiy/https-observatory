/* This is ruleset simplifier for HTTPS Everywhere rulesets */
const regexpTree = require("regexp-tree")

const normalize = (regexp) => {
  if (!regexp.startsWith("^http://") || regexp.length < 1 || !regexp[regexp.length-1] !== "/")
    console.log("ERROR")
  const normalized = regexp.substring("!http://".length, regexp.length-1)
  return normalized
}

const escape = (regexp) => {
  // Escapes all back slashes
  // Seems to work for now...
  // rewrites "^http://example.com/" as "^http:\/\/example.com\/"
  return regexp.replace(/\//g, "\\/")
}

const explode = (regexp) => {
  const escaped = "/" + escape(regexp) + "/" // i
//  console.log(regexp)
  const parsed = regexpTree.parse(escaped)

//  console.log(JSON.stringify(parsed))


  if (parsed.type !== "RegExp")
    return

  const expressions = parsed.body.expressions

  let stack = [{
    prefix: "",
    expressions: expressions
  }]

  let output = []

  while (stack.length > 0){
    // Retreive the next expression
    const elem = stack.pop()

    // Base case: reached the end of the expression
    if (!elem.expressions || elem.expressions.length === 0){
      output.push(elem.prefix)
      continue
    }

    // Retreive the left most element of the expression
    const expression = elem.expressions.shift()

    // Process element according to its type
    switch(expression.type){
      case "Char":
        // A simple character can be just appended to prefix
        // if (expression.escaped)
        //   elem.prefix += ""//"\\"
	stack.push({
            prefix: elem.prefix + expression.symbol,
            expressions: elem.expressions
        })
        break
      case "Assertion":
        // ^
        stack.push({
            prefix: elem.prefix + expression.kind,
            expressions: elem.expressions
        })
        break
      case "Group":
        // TODO
	stack.push({
            prefix: elem.prefix,
            expressions: [expression.expression].concat(elem.expressions)
        })
        break
      case "Disjunction":
        stack.push(
          {
            prefix: elem.prefix,
            expressions: [expression.right].concat(elem.expressions)
          },
          {
            prefix: elem.prefix,
            expressions: [expression.left].concat(elem.expressions)
          }
	)
        break
      case "Repetition":
        switch (expression.quantifier.kind){
          case "?": // zero or one
            stack.push(
              { // one repetition
                prefix: elem.prefix,
                expressions: [expression.expression].concat(elem.expressions)
              },
              { // no repetition
                prefix: elem.prefix,
                expressions: elem.expressions
              }
	    )
            break
          case "Range":
            console.log()
            break
          // Cases that can not be easily enumerated
          case "*":
            // fallthrough
          case "+":
            return "Failed"
          default:
            console.log("Repetition UNKNOWN KIND", expression.quantifier.kind)
        }
        break

      case "Alternative":
	stack.push({
            prefix: elem.prefix,
            expressions: [expression.expression].concat(elem.expressions)
        })
        break
      case "CharacterClass":
        console.log("\n\n", expression.type, "\n", JSON.stringify(regexp), "\n", JSON.stringify(elem))
        break
      default:
        console.log("TYPE", expression.type)
    }
  }
  return output
}


module.exports = {
  explode: explode
}
