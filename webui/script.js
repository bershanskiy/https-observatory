"use strict"

// For network requests let's use the modern (circa 2014) fetch API
// We can ensure backwards-ompatibility later via a polyfill like
// https://github.github.io/fetch/ or https://github.com/developit/unfetch

// This is from https://code.google.com/archive/p/form-serialize/
function serialize(form) {
	if (!form || form.nodeName !== "FORM")
		return
	var i, j, q = []
	for (i = form.elements.length - 1; i >= 0; i = i - 1) {
		if (form.elements[i].name === "")
			continue
		switch (form.elements[i].nodeName) {
		case 'INPUT':
			switch (form.elements[i].type) {
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'checkbox':
			case 'radio':
				if (form.elements[i].checked) {
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				}						
				break;
			case 'file':
				break;
			}
			break;			 
		case 'TEXTAREA':
			q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
			break;
		case 'SELECT':
			switch (form.elements[i].type) {
			case 'select-one':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'select-multiple':
				for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
					if (form.elements[i].options[j].selected) {
						q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch (form.elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			}
			break;
		}
	}
	return q.join("&");
}

function btnClick(value){
	window.location.href = "/submission/"
}

// TODO: use DOMContentLoaded
window.addEventListener("load", function(event){
	console.log("page loaded")
	
	
	document.getElementById("search").addEventListener("submit", function(event){
		event.preventDefault()


		console.log(event, serialize(event.target))

		const url = "/search?" + serialize(event.target)

		fetch(url)
		.then((response) => {	// Check if fetch suceeded and extract the data
			if (response.ok)
				return response.json()
			else
				return Promise.reject(new Error("Search request failed"))
		})
		.then(function(data) {
			console.log(data)
			document.getElementById("result-box").innerHTML = ""
			document.getElementById("lds-roller").style.display = "inline-block"

			if (data.error) {
				document.getElementById("lds-roller").style.display = "none"
				return
			}

			for (const target_found of data) {
				const row = document.createElement("div")
				row.setAttribute("class", "Box-row d-flex flex-items-center")
				row.setAttribute("id", "row")

				const row_title = document.createElement("div")
				row_title.setAttribute("class", "flex-auto")
				row_title.setAttribute("id", "row-title")

				const title = document.createElement("strong")
				title.innerText = target_found.target
				const description = document.createElement("div")
				description.setAttribute("class", "text-small text-gray-light")
				description.innerText = target_found.name

				row_title.appendChild(title)
				row_title.appendChild(description)

				const button = document.createElement("button")
				button.setAttribute("onclick", "btnClick(value)")
				button.setAttribute("type", "button")
				button.setAttribute("class", "btn btn-sm")
				button.setAttribute("name", "button")
				button.setAttribute("id", "button")
				button.setAttribute("value", target_found.rulesetid)
				button.innerText = "View"

				row.appendChild(row_title)
				row.appendChild(button)

				document.getElementById("result-box").appendChild(row)
			}

			document.getElementById("lds-roller").style.display = "none"
			document.getElementById("result-box").style.display = "block"
		})
		
		return false
	})
})


