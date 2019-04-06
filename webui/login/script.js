"use strict"

const loadingAnimationDuration = 2000 /* ms */
const alertDuration = 2000

const showLoadingAnimation = () => {
  document.getElementById("lds-roller").classList.remove("hidden")
  document.getElementById("overlay").classList.remove("hidden")
}

const hideLoadingAnimation = () => {
  document.getElementById("lds-roller").classList.add("hidden") 
  document.getElementById("overlay").classList.add("hidden")
  // loginFail("Idk man")
  loginSuccess()
}

const loginSuccess = () => {
  // Hides input fields, displayed success alert and redirects to previous page
  // Uses cookies
  document.getElementById("login_success").classList.remove("hidden")
  document.getElementById("login_success").classList.add("anim-fade-up")
  document.getElementById("credentials").classList.add("hidden")

  const loginAlertTimer = setTimeout(function() {
    window.location.replace(getCookie("prevURL"))
  }, alertDuration)
}

const loginFail = (errorMessage) => {
  // Displays error alert and error message
  document.getElementById("login_error").classList.remove("hidden")
  document.getElementById("login_error").innerText = "Login failed. " + errorMessage
  document.getElementById("login_error").classList.add("anim-fade-up")
}

const hideAlerts = () => {
  // Hides all alerts
  document.getElementById("login_success").classList.add("hidden")
  document.getElementById("login_error").classList.add("hidden")
}

// Taken from https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
const getCookie = (name) => {
  let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}

const setCookie = (name, value, days) => {
  let d = new Date
  d.setTime(d.getTime() + 24*60*60*1000*days)
  document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString()
  console.log(document.cookie)
}

const deleteCookie = (name) => { 
  setCookie(name, '', -1)
}

window.addEventListener("load", (event) => {
  document.getElementById("login").addEventListener("submit", (event) => {
    event.preventDefault()
    hideAlerts()
    showLoadingAnimation()

    // Displays loading animation for set duration and redirects
    // Naive login functionality
    const loadingAnimationTimer = setTimeout(hideLoadingAnimation, loadingAnimationDuration)

    setCookie("logon", true, 1)
  })
})