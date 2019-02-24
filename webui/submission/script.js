window.addEventListener("load", function(event){
    console.log("submission page loaded")
})
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
	"exclusions": [
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

const displayRuleset = (rulesetid) => {
    if ((rulesetid == null) | (rulesetid == 0)) {
        defaultRuleset()
    } else {
        const url = "/ruleinfo?rulesetid=" + rulesetid

        console.log(url)

        fetch(url)
        .then((response) => {   // Check if fetch suceeded and extract the data
            console.log("Inside first callback")
            if (response.ok) {
                console.log("Respone received")
                return response.json()
            } else {
                return Promise.reject(new Error("Search request failed"))
            }
        })
        .then(function(data) {
            console.log(data)
        })
    } 
}

function defaultRuleset() {
    console.log("Rulesetid argument empty, filling in default values")
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

    /* Exclusions */
    const exclusionP = document.getElementById("prototype-exclusion")
    exclusionP.remove()
    const exclusions = document.getElementById("exclusions")
    for (const data of ruleset_data.exclusions){
        const exclusion = exclusionP.cloneNode(true)
        exclusion.removeAttribute("id")
        exclusion.getElementsByTagName("input")[0].value = data.pattern
        exclusion.getElementsByTagName("input")[1].value = data.comment
        exclusions.appendChild(exclusion)
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

var url_string = window.location.href
var url = new URL(url_string)
var rulesetid = url.searchParams.get("rulesetid")
console.log(rulesetid)
displayRuleset(rulesetid)

function deleteElement(button){
	const li = button.parentNode
	const ul = li.parentNode
	minCount = ul.getAttribute("min-count")
	if (ul.children.length > minCount){
		li.parentNode.removeChild(li)
		console.log("removed node")
	}else{
		console.log("Too few children")
	}
}
