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
			document.getElementById("result").innerHTML = ""
			// console.log(data)
			const table = document.createElement("TABLE")
			for (const target_found in data){
				const entry = document.createElement("tr")
				const attr1 = document.createElement('th')
				const attr2 = document.createElement('th')
				attr1.innerText = target_found.target
				attr2.innerText = target_found.name
				
			}
			let targetNames = ""
			data.forEach(target_found => targetNames += (target_found.target + '\n'))
			table.innerText = targetNames
			document.getElementById("result").appendChild(table)
			// Create and append the li's to the ul
		})
		
		return false
	})
})


