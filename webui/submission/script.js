"use strict"

let state = {
  rulesetid: null, // This is null iff the currently displayed data might be incorrect
                   // E.g., nothing is displayed or data is being loaded
  user: "TODO"     // This is null iff user is not logged in
}

const strings = {
  "securecookies": {
    "title": "Secure Cookies",
    "subtitle": "These define the cookies that should be secured"
  }
}

const types = ["targets", "rules", "exclusions", "tests", "securecookies"]

const displayData = (data) => {
  try {
    // Invalidate past rulesetid
    state.rulesetid = null

    // Ruleset unique attributes
    document.getElementById("name").value = data.name
    document.getElementById("file").value = data.file
    document.getElementById("mixedcontent").checked = data.mixedcontent
    document.getElementById("default_off").value = data.default_off ? data.default_off : ""

    // Ruleset "array" attributes
    for (const type of types){
      const list = document.getElementById(type)
      const array = data[type]
      if (!array)
        continue
      for (const record of array){
        const node = addElement(list)
        for (const attribute in record){
          const field = node.querySelector("[name='"+attribute+"']")
          if (field)
            field.value = record[attribute]
        }
      }
    }

    // Set new ruleset id
    state.rulesetid = data.rulesetid
  } catch (e) {
    console.error("Failed to display data", data, error)
  }
}

const readForm = () => {
  try {
    // Read unique attributes
    let ruleset = {
      name: document.getElementById("name").value,
      file: document.getElementById("file").value,
      mixedcontent: document.getElementById("mixedcontent").checked,
      default_off: document.getElementById("default_off").value
    }

    // Read array attributes
    for (const type of types){
      const ul = document.getElementById(type)
      const lis = ul.getElementsByTagName("LI")
      let array = []
      for (const li of lis){
        if (li.getAttribute("id") !== null)
          continue // this is a prototype
        const inputs = li.getElementsByTagName("INPUT")
	let record = {}
	for (const input of inputs){
          const key = input.name
          const value = input.value
	  record[key] = value
        }
	array.push(record)
      }
      ruleset[type] = array
    }
    return ruleset
  } catch(e){
    console.error("Could not parse data")
  }
}

/* Fetch ruleser information and display it in the form */
const fetchData = (rulesetid) => {
  if (!rulesetid)
    return

  const url = "/rulesetinfo?rulesetid=" + rulesetid

  fetch(url)
  .then((response) => {   // Check if fetch suceeded and extract the data
    if (response.ok) {
      return response.json()
    } else {
      return Promise.reject(new Error("Search request failed"))
    }
  })
  .then((data) => {
    displayData(data)
    if (data.file)
      queryXML(data.file)
  })
  .catch((error) => console.error("failed to display data", error))
}

const queryXML = (filename) => {
  if (!filename)
    return

  const url = "/xml/" + filename

  fetch(url)
  .then((response) => {   // Check if fetch suceeded and extract the data
    if (response.ok) {
      return response.text()
    } else {
      return Promise.reject(new Error("XML unavailable at " + url))
    }
  })
  .then((xml) => {
    document.getElementById("xml").innerText = xml//response.text()//"some"//xml
  })
  .catch((error) => console.error("failed to display XML"))
}

const loadPage = async () =>{
  const url_string = window.location.href
  const url = new URL(url_string)
  const rulesetid_str = url.searchParams.get("rulesetid")
  const rulesetid = Number(rulesetid_str)
  console.log("Displaying ruleset: rulesetid = " + rulesetid)
  fetchData(rulesetid)
  // TODO: use History API to display nice URL
}

/* Code below handles "Add" and "Delete" button clicks */

/* This deletes a specified element from a lists of attributes (if allowed) */
const deleteElement = (button) => {
  const li = button.parentNode
  const ul = li.parentNode
  const minCount = ul.hasAttribute("min-count") ? ul.getAttribute("min-count") : 0
  const currCount = ul.getElementsByTagName("LI").length - 1 // Remember about the prototype node
  if (currCount > minCount){
    li.parentNode.removeChild(li)
  } else {
    console.log("Too few children")
  }
}

/* This adds an empty element to lists of attributes that can have multipl elements */
const addElement = (ul) => {
  try {
    const node = ul.getElementsByTagName("LI")[0].cloneNode(true)
    node.removeAttribute("id")
    ul.appendChild(node)
    return node
  } catch (e){
    console.error("Could not add element")
  }
}

/* Initialize the document with event handlers */
const init = () => {
  document.addEventListener("click", (event) => {
    /* "Add" button */
    if (event.target.classList.contains("btn-add")){
      const dl = event.target.parentNode.parentNode.parentNode
      const ul = dl.getElementsByTagName("UL")[0]
      addElement(ul)
    }
    /* "Delete" button */
    if (event.target.classList.contains("btn-delete"))
      deleteElement(event.target)
  })

  /* New Fork button */
  document.getElementById("button-fork").addEventListener("click", (event) => {
    console.log("Fork!")
    const proposal = {
      author: state.user,
      rulesetid: state.rulesetid
    }

    /* Submit the ruleset as a JSON.
     * Could do it via URL encoding, but this is easier for now
     */
    fetch("/new/", {
      method: "POST",
//    mode: "cors", // no-cors, cors, *same-origin
//    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//    credentials: "same-origin", // include, *same-origin, omit
      headers: {
            "Content-Type": "application/json",
      },
//        redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(proposal),
    })
    .then(response => {
      if (response.ok)
        return response.json()
      else
        return Promise.reject(new Error("Failed to submit data"))
    })
    .then((data) => {
//      displayData(data)
//      if (data.file)
//        queryXML(data.file)
    })
    .catch((error) => console.error("Pull request failed", error))
  })

  /* Submit button */
  document.getElementById("submit").addEventListener("click", (event) => {
    const ruleset = readForm()
    if (!ruleset)
      return // TODO: display error

    console.log(ruleset)

    const proposal = {
      author: state.user,
      rulesetid: state.rulesetid,
      ruleset: ruleset
    }

    /* Submit the ruleset as a JSON.
     * JSON represents the nested structures and arrays which are impossible to represent in URL params
     * JSON can handle large payloads while URLs are limited in length
     */
    fetch("/save/", {
      method: "PUT",
//    mode: "cors", // no-cors, cors, *same-origin
//    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//    credentials: "same-origin", // include, *same-origin, omit
      headers: {
            "Content-Type": "application/json",
      },
//        redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(proposal),
    })
    .then(response => {
      if (response.ok)
        return response.json()
      else
        return Promise.reject(new Error("Failed to submit data"))
    })
    .then((data) => {
//      displayData(data)
//      if (data.file)
//        queryXML(data.file)
    })
    .catch((error) => console.error("Pull request failed", error))
  })
}

/* Initialize all scripts upon page load */
if( document.readyState !== "loading" ) {
  /* document is already ready, just execute code now */
  init()
  loadPage()
} else {
  document.addEventListener("DOMContentLoaded", init)
}
