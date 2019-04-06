// Taken from https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
const getCookie = (name) => {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
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
  /* Redirect to sign in page */
  document.getElementById("signin").addEventListener("click", (event) => {
    setCookie("prevURL", window.location.pathname, 1)
    location.href = "/login/"
  }) 

  /* Sign out */
  document.getElementById("signout").addEventListener("click", (event) => {
    console.log("Signed out")
    setCookie("logon", false, 1)
    location.reload()
  })

  let logon = getCookie("logon")
  // Display or hide sign in page based on whether the user is logged in using cookies
  if (logon === "true") {
    document.getElementById("signin").classList.add("hidden")
    document.getElementById("signout").classList.remove("hidden")
  } else {
    document.getElementById("signin").classList.remove("hidden")
    document.getElementById("signout").classList.add("hidden")
  }
})