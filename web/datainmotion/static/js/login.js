let logout = '<a id="myLink" href="#" onclick="logOut();return false;">Logout</a>'
let button = document.getElementById("loginButton")
if (localStorage.getItem("isLogged") === "true"){
  button.innerHTML = logout
}
