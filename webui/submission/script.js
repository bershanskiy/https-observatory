<<<<<<< HEAD
window.addEventListener("load", function(event){
    console.log("submission page loaded")
})
=======
"use strict"

const ruleset_data = {
	"rulesetid": 0,
	"name": "Example ruleset",
	"file": "ExampleRuleset.xml",
	"default_off": "",
	"mixedcontent": true,
	"comment": "",
	"targets": ["example.com", "*.example.com"],
//	"timestamp": TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"rules": [
		{
			"from": "^http://",
			"to": "https://"
		},
		{
			"from": "http://www.example.com",
			"to": "https://example.com"
			,
		}
	],
	"exclussions": [
		{
			"pattern": "example.com/example",
			"comment": "insecure urls"
		}
	],
	"securecookies": [
		{
			"host":"example.com",
			"name":".+",
			"comment":"all"
		}
	]
}

const displayRuleset = (ruleset_data) => {
	document.getElementById("name").value = ruleset_data.name
	document.getElementById("file").value = ruleset_data.file
	document.getElementById("mixedcontent").checked = ruleset_data.mixedcontent

	/* Targets */
	const targetP = document.getElementById("prototype-target")
	targetP.remove()
	const targets = document.getElementById("targets")
	for (const data of ruleset_data.targets){
		const target = targetP.cloneNode(true)
		target.removeAttribute("id")
		target.getElementsByTagName("input")[0].value = data
		console.log(target)
		targets.appendChild(target)
	}

	/* Rules */
	const ruleP = document.getElementById("prototype-rule")
	ruleP.remove()
	const rules = document.getElementById("rules")
	for (const data of ruleset_data.rules){
		const rule = ruleP.cloneNode(true)
		rule.removeAttribute("id")
		rule.getElementsByTagName("input")[0].value = data.from
		rule.getElementsByTagName("input")[1].value = data.to
		rules.appendChild(rule)
	}

	/* Exclussions */
	const exclussionP = document.getElementById("prototype-exclussion")
	exclussionP.remove()
	const exclussions = document.getElementById("exclussions")
	for (const data of ruleset_data.exclussions){
		const exclussion = exclussionP.cloneNode(true)
		exclussion.removeAttribute("id")
		exclussion.getElementsByTagName("input")[0].value = data.pattern
		exclussion.getElementsByTagName("input")[1].value = data.comment
		exclussions.appendChild(exclussion)
	}

	/* Securecookies */
	const cookieP = document.getElementById("prototype-cookie")
	cookieP.remove()
	const cookies = document.getElementById("cookies")
	for (const data of ruleset_data.securecookies){
		const cookie = cookieP.cloneNode(true)
		cookie.removeAttribute("id")
		cookie.getElementsByTagName("input")[0].value = data.host
		cookie.getElementsByTagName("input")[1].value = data.name
		cookie.getElementsByTagName("input")[2].value = data.comment
		cookies.appendChild(cookie)
	}

}

displayRuleset(ruleset_data)
>>>>>>> 2979e640713ee713eb7384843602d33f27a5f8a7
