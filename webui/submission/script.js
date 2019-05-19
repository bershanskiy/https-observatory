"use strict"

let state = {
  rulesetid: undefined, // This is null iff the currently displayed data might be incorrect
  // E.g., nothing is displayed or data is being loaded
  user: "TODO", // This is null iff the user is not logged in
  proposalid: undefined // This is null iff the page displays official ruleset version, form is not editable
  // Otherwise it's an integer id proposalid
}

const login = () => {
  state.user = "TODO"
  document.getElementById("button-fork-create").classList.remove("hidden")
  document.getElementById("title").innerText = "Logged in, wiewing ruleset"
}

const logout = () => {
  document.getElementById("submit").disabled = true
  document.getElementById("save").disabled = true
  document.getElementById("button-fork-delete").classList.add("hidden")
  document.querySelectorAll("INPUT").forEach((a) => a.disabled = true)
  document.querySelectorAll(".btn").forEach((a) => a.disabled = true)
}

const edit = () => {
  document.querySelectorAll("INPUT").forEach((a) => a.disabled = false)
  document.querySelectorAll(".btn").forEach((a) => a.disabled = false)
  document.getElementById("submit").disabled = false
  document.getElementById("save").disabled = false
  document.getElementById("button-fork-create").classList.add("hidden")
  document.getElementById("button-fork-delete").classList.remove("hidden")
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
    for (const type of types) {
      const list = document.getElementById(type)
      const array = data[type]
      if (!array)
        continue
      for (const record of array) {
        const node = addElement(list)
        for (const attribute in record) {
          const field = node.querySelector("[name='" + attribute + "']")
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
    for (const type of types) {
      const ul = document.getElementById(type)
      const lis = ul.getElementsByTagName("LI")
      let array = []
      for (const li of lis) {
        if (li.getAttribute("id") !== null)
          continue // this is a prototype
        const inputs = li.getElementsByTagName("INPUT")
        let record = {}
        for (const input of inputs) {
          const key = input.name
          const value = input.value
          record[key] = value
        }
        array.push(record)
      }
      ruleset[type] = array
    }
    console.log("RULESET incoming")
    console.log(ruleset)
    return ruleset
  } catch (e) {
    console.error("Could not parse data")
  }
}

/* Fetch ruleser information and display it in the form */
const fetchData = (rulesetid) => {
  if (!rulesetid)
    return

  const url = "/rulesetinfo?rulesetid=" + rulesetid

  fetch(url)
    .then((response) => { // Check if fetch suceeded and extract the data
      if (response.ok) {
        return response.json()
      } else {
        return Promise.reject(new Error("Search request failed"))
      }
    })
    .then((data) => {
      displayData(data)
      console.log("DATA: ", data)
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
    .then((response) => { // Check if fetch suceeded and extract the data
      if (response.ok) {
        return response.text()
      } else {
        return Promise.reject(new Error("XML unavailable at " + url))
      }
    })
    .then((xml) => {
      document.getElementById("xml").innerText = xml //response.text()//"some"//xml
    })
    .catch((error) => console.error("failed to display XML"))
}

const loadPage = async () => {
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
  if (currCount > minCount) {
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
  } catch (e) {
    console.error("Could not add element")
  }
}

/* Submit the ruleset as a JSON.
 * JSON represents the nested structures and arrays which are impossible to represent in URL params
 * JSON can handle large payloads while URLs are limited in length
 */
const save = () => {
  const ruleset = readForm()
  if (!ruleset)
    return // TODO: display error

  console.log(ruleset)

  const proposal = {
    author: state.user,
    rulesetid: state.rulesetid,
    proposalid: state.proposalid,
    ruleset: ruleset
  }

  fetch("/save/", {
      method: "PUT",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      referrer: "origin",
      body: JSON.stringify(proposal),
    })
    .then(response => {
      if (response.ok)
        return response.json()
      else
        return Promise.reject(new Error("Failed to submit data"))
    })
    .then((data) => {
      //    displayData(data)
      //    if (data.file)
      //      queryXML(data.file)
    })
    .catch((error) => console.error("Pull request failed", error))
}


/* Initialize the document with event handlers */
const init = () => {
  //logout()

  document.addEventListener("click", (event) => {
    /* "Add" button */
    if (event.target.classList.contains("btn-add")) {
      event.preventDefault()
      const dl = event.target.parentNode.parentNode.parentNode
      const ul = dl.getElementsByTagName("UL")[0]
      addElement(ul)
    }
    /* "Delete" button */
    if (event.target.classList.contains("btn-delete"))
      deleteElement(event.target)
  })

  document.getElementById("button-fork-delete").addEventListener("click", (event) => {
    console.log("Delete!")
    logout()
  })

  /* Fork button */
  document.getElementById("button-fork-create").addEventListener("click", (event) => {
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
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        referrer: "origin",
        body: JSON.stringify(proposal),
      })
      .then(response => {
        if (response.ok)
          return response.json()
        else
          return Promise.reject(new Error("Failed to create new fork"))
      })
      .then((data) => {
        console.log(data)
        state.proposalid = data.proposalid
        edit()
      })
      .catch((error) => console.error("Failed to create new fork", error))
  })

  /* Fork Delete button */
  document.getElementById("button-fork-delete").addEventListener("click", (event) => {
    console.log("Fork delete!")
    if (!state.proposalid)
      return

    const url = "/delete?proposalid=" + state.proposalid

    /* Submit query in URL encoded form.
     */
    fetch(url, {
        method: "DELETE",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        referrer: "origin"
      })
      .then(response => {
        if (response.ok)
          console.log("Deleted")
        else
          return Promise.reject(new Error("Failed to delete"))
      })
      .catch((error) => console.error("Failed to delete", error))
  })


  /* Submit button */
  document.getElementById("submit").addEventListener("click", (event) => {
    // JSON
    const data = readForm()
    fetch("/user/submit/pr", {
        method: "PUT",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        referrer: "origin",
        body: JSON.stringify(data),
      })

    console.log("Submit! Not implemented yet...")
  });

  document.getElementById("save").addEventListener("click", (event) => {
    console.log("Save!")
    save()
  })
}

/* Initialize all scripts upon page load */
if (document.readyState !== "loading") {
  /* document is already ready, just execute code now */
  init()
  loadPage()
} else {
  document.addEventListener("DOMContentLoaded", init)
}
