let htmlLogin = '<a href="/login"> <span>Login</span> </a>';
let account = `<a href="/account"> <span>Account</span></a>`;
let board = `<a id="myLink" href="#" onclick="boards();"><span>Boards</span></a>`;
let log_out = `<a id="myLink" href="#" onclick="logout();return false;"><span>Logout</span></a>`;

let button = document.getElementById("loginButton")
if (localStorage.getItem("token")) {
	const menu = document.querySelector('[id="menu-menu"]');
	const li1 = document.createElement('li');
	const li2 = document.createElement('li');
	const li3 = document.createElement('li');
	li1.innerHTML = account.trim();
	li2.innerHTML = board.trim();
	li3.innerHTML = log_out.trim();
	menu.appendChild(li1);
	menu.appendChild(li2);
	menu.appendChild(li3);
	document.getElementById('loginButton').remove();
	document.getElementById('registerButton').remove();
	// button.innerHTML = htmlLogout;
}

function logout() {
  localStorage.removeItem("isLogged");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  location.reload();
}
function boards() {
  window.location.replace(`${global.prot}://${global.domain}/user/boards`)
};
