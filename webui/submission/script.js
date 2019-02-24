window.addEventListener("load", function(event){
    console.log("submission page loaded")
})
"use strict"

const ruleset_data = {
	"rulesetid": 0,
	"name": "Example ruleset",
	"file": "ExampleRuleset.xml",
	"default_off": "",
	"mixedcontent": false,
	"comment": "",
	"targets": ["example.com", "*.example.com"],
//	"timestamp": TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"rules": [
		{
			"from": "from: ^http://",
			"to": "to: https://"
		},
		{
			"from": "from: http://www.example.com",
			"to": "to: https://example.com"
			,
		}
	],
	"exclusions": [
		{
			"pattern": "pattern: example.com/example",
			"comment": "insecure urls"
		}
	],
	"securecookies": [
		{
			"host":"host: example.com",
			"name":"name: .+",
			"comment":"all"
		}
	]
}

const displayRuleset = (rulesetid) => {
    if ((rulesetid == null) | (rulesetid == 0)) {
        // defaultRuleset()
    } else {
        const url = "/ruleinfo?rulesetid=" + rulesetid

        // console.log(url)

        fetch(url)
        .then((response) => {   // Check if fetch suceeded and extract the data
            if (response.ok) {
                console.log("Response received")
                return response.json()
            } else {
                return Promise.reject(new Error("Search request failed"))
            }
        })
        .then(function(data) {
            // console.log(data)
            document.getElementById("name").value = ruleset_data.name
            document.getElementById("file").value = data.rules[0].file
            document.getElementById("mixedcontent").checked = data.rules[0].mixedcontent.data[0]

            if (data.targets[0].target != null) {
                const targetList = document.getElementById("targets")
                while (targetList.firstChild) {
                    targetList.removeChild(targetList.firstChild);
                }

                for (const target of data.targets) {
                    const newTarget = document.createElement("li")
                    newTarget.setAttribute("class", "pr-elem")
                    const targetInput = document.createElement("input")
                    targetInput.setAttribute("class", "form-control")
                    targetInput.setAttribute("type", "text")
                    targetInput.setAttribute("autocomplete", "off")
                    targetInput.setAttribute("value", target.target)

                    newTarget.appendChild(targetInput)
                    targetList.appendChild(newTarget)
                }
            }

            if (data.rules[0].from != null) {
                const ruleList = document.getElementById("rules")
                while (ruleList.firstChild) {
                    ruleList.removeChild(ruleList.firstChild);
                }

                for (const rule of data.rules) {
                    // console.log(rule)
                    const newRule = document.createElement("li")
                    newRule.setAttribute("class", "pr-elem")
                    const ruleFrom = document.createElement("input")
                    ruleFrom.setAttribute("class", "form-control")
                    ruleFrom.setAttribute("type", "text")
                    ruleFrom.setAttribute("autocomplete", "off")
                    ruleFrom.setAttribute("value", rule.from)
                    const ruleTo = document.createElement("input")
                    ruleTo.setAttribute("class", "form-control")
                    ruleTo.setAttribute("type", "text")
                    ruleTo.setAttribute("autocomplete", "off")
                    ruleTo.setAttribute("value", rule.to)

                    newRule.appendChild(ruleFrom)
                    newRule.appendChild(ruleTo)

                    ruleList.appendChild(newRule)
                }
            }

            if (data.exclusions[0].pattern != null) {
                const exclusionList = document.getElementById("exclusions")
                while (exclusionList.firstChild) {
                    exclusionList.removeChild(exclusionList.firstChild);
                }

                for (const exclusion of data.exclusions) {
                    // console.log(exclusion)
                    const newExclusion = document.createElement("li")
                    newExclusion.setAttribute("class", "pr-elem")
                    const exclusionPattern = document.createElement("input")
                    exclusionPattern.setAttribute("class", "form-control")
                    exclusionPattern.setAttribute("type", "text")
                    exclusionPattern.setAttribute("autocomplete", "off")
                    exclusionPattern.setAttribute("value", exclusion.pattern)

                    newExclusion.appendChild(exclusionPattern)

                    exclusionList.appendChild(newExclusion)
                }
            }

            if (data.securecookies[0].host != null) {
                const cookieList = document.getElementById("cookies")
                while (cookieList.firstChild) {
                    cookieList.removeChild(cookieList.firstChild);
                }

                for (const cookie of data.securecookies) {
                    // console.log(cookie)
                    const newCookie = document.createElement("li")
                    newCookie.setAttribute("class", "pr-elem")
                    const cookieHost = document.createElement("input")
                    cookieHost.setAttribute("class", "form-control")
                    cookieHost.setAttribute("type", "text")
                    cookieHost.setAttribute("autocomplete", "off")
                    cookieHost.setAttribute("value", cookie.host)
                    const cookieName = document.createElement("input")
                    cookieName.setAttribute("class", "form-control")
                    cookieName.setAttribute("type", "text")
                    cookieName.setAttribute("autocomplete", "off")
                    cookieName.setAttribute("value", cookie.name)

                    newCookie.appendChild(cookieHost)
                    newCookie.appendChild(cookieName)

                    cookieList.appendChild(newCookie)
                }
            }
        })
    } 
}

// function defaultRuleset() {
//     console.log("Rulesetid argument empty, filling in default values")
//     document.getElementById("name").value = ruleset_data.name
//     document.getElementById("file").value = ruleset_data.file
//     document.getElementById("mixedcontent").checked = ruleset_data.mixedcontent

    /* Targets */
    // const targetP = document.getElementById("prototype-target")
    // targetP.remove()
    // const targets = document.getElementById("targets")
    // for (const data of ruleset_data.targets){
    //     const target = targetP.cloneNode(true)
    //     target.removeAttribute("id")
    //     target.getElementsByTagName("input")[0].value = data
    //     console.log(target)
    //     targets.appendChild(target)
    // }

    // /* Rules */
    // const ruleP = document.getElementById("prototype-rule")
    // ruleP.remove()
    // const rules = document.getElementById("rules")
    // for (const data of ruleset_data.rules){
    //     const rule = ruleP.cloneNode(true)
    //     rule.removeAttribute("id")
    //     rule.getElementsByTagName("input")[0].value = data.from
    //     rule.getElementsByTagName("input")[1].value = data.to
    //     rules.appendChild(rule)
    // }

    // /* Exclusions */
    // const exclusionP = document.getElementById("prototype-exclusion")
    // exclusionP.remove()
    // const exclusions = document.getElementById("exclusions")
    // for (const data of ruleset_data.exclusions){
    //     const exclusion = exclusionP.cloneNode(true)
    //     exclusion.removeAttribute("id")
    //     exclusion.getElementsByTagName("input")[0].value = data.pattern
    //     exclusions.appendChild(exclusion)
    // }

    // /* Securecookies */
    // const cookieP = document.getElementById("prototype-cookie")
    // cookieP.remove()
    // const cookies = document.getElementById("cookies")
    // for (const data of ruleset_data.securecookies){
    //     const cookie = cookieP.cloneNode(true)
    //     cookie.removeAttribute("id")
    //     cookie.getElementsByTagName("input")[0].value = data.host
    //     cookie.getElementsByTagName("input")[1].value = data.name
    //     cookies.appendChild(cookie)
    // }
// }

var url_string = window.location.href
var url = new URL(url_string)
var rulesetid = url.searchParams.get("rulesetid")
// console.log(rulesetid)
displayRuleset(rulesetid)

function addTarget() {
    const targetList = document.getElementById("targets")
    const newTarget = document.createElement("li")
    newTarget.setAttribute("class", "pr-elem")
    const targetInput = document.createElement("input")
    targetInput.setAttribute("class", "form-control")
    targetInput.setAttribute("type", "text")
    targetInput.setAttribute("autocomplete", "off")
    targetInput.setAttribute("placeholder", "[target] example.com")

    newTarget.appendChild(targetInput)
    targetList.appendChild(newTarget)
}

function removeTarget() {
    const targetList = document.getElementById("targets")
    if (targetList.childElementCount < 2) {
        return
    }
    targetList.lastChild.remove()
}

function addRule() {
    const ruleList = document.getElementById("rules")
    const newRule = document.createElement("li")
    newRule.setAttribute("class", "pr-elem")
    const ruleFrom = document.createElement("input")
    ruleFrom.setAttribute("class", "form-control")
    ruleFrom.setAttribute("type", "text")
    ruleFrom.setAttribute("autocomplete", "off")
    ruleFrom.setAttribute("placeholder", "[from]: ^http://*")
    const ruleTo = document.createElement("input")
    ruleTo.setAttribute("class", "form-control")
    ruleTo.setAttribute("type", "text")
    ruleTo.setAttribute("autocomplete", "off")
    ruleTo.setAttribute("style", "margin-left: 4px")
    ruleTo.setAttribute("placeholder", "[to]: https://")

    newRule.appendChild(ruleFrom)
    newRule.appendChild(ruleTo)

    ruleList.appendChild(newRule)
}

function removeRule() {
    const ruleList = document.getElementById("rules")
    if (ruleList.childElementCount < 2) {
        return
    }
    ruleList.lastChild.remove()
}

function addExclusion() {
    const exclusionList = document.getElementById("exclusions")
    const newExclusion = document.createElement("li")
    newExclusion.setAttribute("class", "pr-elem")
    const exclusionPattern = document.createElement("input")
    exclusionPattern.setAttribute("class", "form-control")
    exclusionPattern.setAttribute("type", "text")
    exclusionPattern.setAttribute("autocomplete", "off")
    exclusionPattern.setAttribute("placeholder", "[pattern]")

    newExclusion.appendChild(exclusionPattern)

    exclusionList.appendChild(newExclusion)
}

function removeExclusion() {
    const exclusionList = document.getElementById("exclusions")
    if (exclusionList.childElementCount < 2) {
        return
    }
    exclusionList.lastChild.remove()
}

function addCookie() {
    const cookieList = document.getElementById("cookies")
    const newCookie = document.createElement("li")
    newCookie.setAttribute("class", "pr-elem")
    const cookieHost = document.createElement("input")
    cookieHost.setAttribute("class", "form-control")
    cookieHost.setAttribute("type", "text")
    cookieHost.setAttribute("autocomplete", "off")
    cookieHost.setAttribute("placeholder", "[host] example.com")
    const cookieName = document.createElement("input")
    cookieName.setAttribute("class", "form-control")
    cookieName.setAttribute("type", "text")
    cookieName.setAttribute("autocomplete", "off")
    cookieName.setAttribute("style", "margin-left: 4px")
    cookieName.setAttribute("placeholder", "[name]")

    newCookie.appendChild(cookieHost)
    newCookie.appendChild(cookieName)

    cookieList.appendChild(newCookie)
}

function removeCookie() {
    const cookieList = document.getElementById("cookies")
    if (cookieList.childElementCount < 2) {
        return
    }
    cookieList.lastChild.remove()
}