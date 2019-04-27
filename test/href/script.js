"use strict"

window.addEventListener("load", (event) => {
  const href = window.location.href
  const params = new URLSearchParams(href)
  console.log(params.keys())
})