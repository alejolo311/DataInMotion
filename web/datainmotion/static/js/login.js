let htmlLogin = '<a href="/login"> <span>Login</span> </a>'
let htmlLogout = `<a>
                    <span>Account</span>
                    <div>
                      <a id="myLink" href="#" onclick="boards();"><span>Boards</span></a>
                      <a id="myLink" href="#" onclick="logout();return false;"><span>Logout</span></a>
                    </div>
                  </a>`
let button = document.getElementById("loginButton")
if (localStorage.getItem("isLogged") === "true") {
  button.innerHTML = htmlLogout
}
else {
  button.innerHTML = htmlLogin
}

function logout() {
  localStorage.removeItem("isLogged");
  localStorage.removeItem("user");
  location.reload();
}
function boards() {
  let user = localStorage.getItem("user")
  window.location.replace(`${global.prot}://${global.domain}/user/${user}/boards`)
};
