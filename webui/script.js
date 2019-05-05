"use strict"

// For network requests let"s use the modern (circa 2014) fetch API
// We can ensure backwards-ompatibility later via a polyfill like
// https://github.github.io/fetch/ or https://github.com/developit/unfetch

/* Delay between submitting the search and showing loading animation
 * This should be small enough for user not to notice the delay,
 * but large enough for simple query to resolve and return.
 * The idea is, loading animation should not appear for a fraction of a second
 * because it essentally blinks and blinking is annoying.
 */
const loadingAnimationDelay = 500 /* ms */

// This code is adopted from https://code.google.com/archive/p/form-serialize/
// (after few modifications)
const serialize = (form) => {
  if (!form || form.nodeName !== "FORM")
    return
  let queries = []
  for (const formElement of form.elements){
    if (formElement.name === "")
      continue
    switch (formElement.nodeName) {
      case "INPUT":
        switch (formElement.type) {
          case "text":
          case "hidden":
          case "password":
          case "button":
          case "reset":
          case "submit":
            queries.push(formElement.name + "=" + encodeURIComponent(formElement.value))
            break
          case "checkbox":
          case "radio":
            if (formElement.checked)
              queries.push(formElement.name + "=" + encodeURIComponent(formElement.value))
            break
          case "file":
            break
        }
        break
      case "TEXTAREA":
        queries.push(formElement.name + "=" + encodeURIComponent(formElement.value))
        break
      case "SELECT":
        switch (formElement.type) {
          case "select-one":
            queries.push(formElement.name + "=" + encodeURIComponent(formElement.value))
            break
          case "select-multiple":
            for (const selectOption of formElement.options)
              if (selectOption.selected)
                queries.push(formElement.name + "=" + encodeURIComponent(selectOption.value))
            break
        }
        break
      case "BUTTON":
        switch (formElement.type) {
          case "reset":
          case "submit":
          case "button":
            queries.push(formElement.name + "=" + encodeURIComponent(formElement.value))
            break
        }
        break
    }
  }
  return queries.join("&")
}

const hideFeedback = () => {
  document.getElementById("result").classList.add("hidden")
  document.getElementById("invalid-input").classList.add("hidden")
  document.getElementById("lds-roller").classList.add("hidden")
}

const showLoadingAnimation = () => {
  // Start loader animation and results div and errors to invisible
  // Show "loading" animation
  document.getElementById("lds-roller").classList.remove("hidden")
}

const showSearchError = (message) => {
  message = message || "Invalid input."
  document.getElementById("invalid-input-message").innerText = message
  document.getElementById("invalid-input").classList.remove("hidden")
}
const generateButtonChars = (page_idx, pages) => {
  page_idx = Math.ceil(page_idx)
  pages = Math.ceil(pages)
  if (pages === 1){
    return [1]
  }
  let firstFew = [1]
  let lastFew = [pages]
  let middleThree = [page_idx - 1, page_idx, page_idx + 1]
  let all_elems = firstFew.concat(middleThree).concat(lastFew)
  let uniqueArray = all_elems.filter(function(item, pos) {
    return all_elems.indexOf(item) == pos;
})
  var indiciesToRemove = [uniqueArray.indexOf(0), uniqueArray.indexOf(pages+1)];
  for (const index of indiciesToRemove) {
    if (index > -1) {
      uniqueArray.splice(index, 1);
    }
  }


  return uniqueArray.sort()
}

// TODO: use DOMContentLoaded
window.addEventListener("load", (event) => {
  document.getElementById("pager").addEventListener("click", (event) => {
    //Set event.target attributes to selected
    //if we changed the page selected, loop through all the attributes and
    const pagerChildren = document.getElementById("pager").childNodes[0].childNodes
    if (event.target.class !== "current selected"){
      //Go through all the page buttons and reset their attributes.
      for (const page_button of pagerChildren) {
        //Remove all attributes of the current button
        page_button.removeAttribute("class")
      }
      event.target.setAttribute("class", "current selected")
      reloadResults();
    }
  })
  document.getElementById("search").addEventListener("submit", (event) => reloadResults())
})

const reloadResults = () => {
  event.preventDefault()

  // Hide all messages that are currently displayed
  hideFeedback()


  // Show loading animation after a short delay (see commend above for explanation)
  const loadingAnimationTimer = setTimeout(showLoadingAnimation, loadingAnimationDelay)

  const page_num = document.querySelector(".current.selected").innerText
  const search_query_text = serialize(document.getElementById('search'))

  const url = "/search?" + search_query_text + "&page_num=" + page_num

  fetch(url)
  .then(async (response) => {  // Check if fetch suceeded and extract the data
    // Don"t show loading animation
    clearTimeout(loadingAnimationTimer)

    if (response.ok) {
      return response.json()
    } else {
      const data = await response.json()
      return Promise.reject(new Error(data.message))
    }
  })
  .then((jsonResp) => {
    const count = jsonResp['count']
    const  data = jsonResp['matches']

    // Clear body of results field
    document.getElementById("result-box").innerHTML = ""

    // Show error if there are no results
  if (data.length === 0){
    // TODO: Design thing: should we have different UIs for
    // errors and empty result set?
    showSearchError("No results found.")
    return
  }

  //Rendering the page buttons
  const BATCH_SIZE = 50

  document.getElementById("pager").innerHTML = ""
  const allPageButtons = document.createElement("div")

  const listOfButtons = generateButtonChars(page_num, count / BATCH_SIZE)

  for (const buttonChar of listOfButtons){
    const singleButton = document.createElement("a")
    if(buttonChar == page_num){
      singleButton.setAttribute("class", "current selected")
      singleButton.setAttribute("aria-current", "true")
    }
    else{
      singleButton.setAttribute("aria-label", "Page " + buttonChar)
    }
    singleButton.innerHTML = buttonChar
    allPageButtons.appendChild(singleButton)
  }

  document.getElementById("pager").appendChild(allPageButtons)

  // Iterate through every target found and create row
  for (const ruleset of data) {
      // Parent row div
      const result = document.createElement("div")
      result.setAttribute("class", "Box-row")

      const header = document.createElement("div")
      header.setAttribute("class", "d-flex flex-items-center")


      // Holds ruleset name and file name
      const row_title = document.createElement("div")
      row_title.setAttribute("class", "flex-auto")

      // ruleset name
      const name = document.createElement("strong")
      name.innerText = ruleset.name

      // ruleset file name
      const file = document.createElement("div")
      file.setAttribute("class", "text-small text-gray-light")
      file.innerText = ruleset.file

      // ruleset labels
      const labels = document.createElement("DIV")
      labels.setAttribute("class", "labels")
      // default_off
      if (typeof ruleset.default_off === "string"&& ruleset.default_off.length > 0){
        const default_off = document.createElement("SPAN")
        default_off.setAttribute("class", "Label Label--orange")
        default_off.setAttribute("title", ruleset.default_off)
        default_off.innerText = "off"
        labels.appendChild(default_off)
      }
      // mixedcontent
      if (ruleset.mixedcontent){
        const mixedcontent = document.createElement("SPAN")
        mixedcontent.setAttribute("class", "Label Label--gray-darker")
        mixedcontent.setAttribute("title", "See docs for details")
        mixedcontent.innerText = "mixedcontent"
        labels.appendChild(mixedcontent)
      }

      const targets = document.createElement("div")
      targets.setAttribute("class", "text-small text-gray-light")
      targets.innerText = ruleset.targets.join(", ")

      // "View" button
      const link = "/submission/?rulesetid=" + ruleset.rulesetid
      const button = document.createElement("A")
      button.href = link
      button.setAttribute("class", "btn btn-sm")
      button.setAttribute("role", "button") // TODO: does this really "improve accessibility"?
      button.innerText = "View"

      header.appendChild(row_title)
      header.appendChild(labels)
      header.appendChild(button)
      result.appendChild(header)
      row_title.appendChild(name)
      row_title.appendChild(file)
      result.appendChild(targets)

      document.getElementById("result-box").appendChild(result)
    }

    // Show results field and hide loading animation
    document.getElementById("result").classList.remove("hidden")
    document.getElementById("lds-roller").classList.add("hidden")
  }).catch ((error) => {
    clearTimeout(loadingAnimationTimer)
    const str = error.toString()
    const message = str.substr(str.indexOf(": ")+2)
    hideFeedback() // to hide loading animation
    showSearchError(message)
  })

  return false
}

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
