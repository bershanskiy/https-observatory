"use strict"

const protocol = "http://"

window.addEventListener("load", (event) => {
  const host = window.location.host
  const path = protocol + host + "/index.html"

  document.getElementById("form").action  = path
})
