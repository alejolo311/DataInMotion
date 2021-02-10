class IndexMenu extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		console.log(global.domain);
		link.href = `${global.prot}://${global.domain}/static/styles/IndexMenu.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'index_menu');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'index_menu') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	logOut (evn) {
		console.log('log out');
		localStorage.removeItem('token');
		localStorage.removeItem('isLogged');
		console.log(localStorage.getItem('token'));
		console.log(localStorage.getItem('islogged'));
		DOMManager.render(
			IndexMenu,
			this._root
		);
	}
	render () {
		const comp = this;
		return (
			`
				<ul class="index_menu">
					<li id="eduButton" style="display: none;">
						<a href="/edu/">
							<span>Education</span>
						</a>
					</li>
					<li id="boardsButton" style="display: none;">
						<a href="/user/boards">
							<span>Boards</span>
						</a>
					</li>
					<li id="loginButton">
						<a href="/login">
							<span>Login</span>
						</a>
					</li>
					<li id="registerButton">
						<a href="/register">
							<span>Sign Up</span>
						</a>
					</li>
					<li id="signOut" style="display: none;" >
						<h2 click="${ comp.logOut.name }">Log out</h2>
					</li>
				</ul>
			`
		);
	}
	async onMounted () {
		const comp = this;
		console.log('check user status');
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		if (req.status !== 200) {
			console.log('No logged');
			const login = comp._root.querySelector('#loginButton');
			login.addEventListener('click', function (evn) {
				evn.target.querySelector('a').click();
			});
			comp._root.querySelector('#registerButton').addEventListener('click', function (evn) {
				evn.target.querySelector('a').click();
			});
		} else {
			const login = comp._root.querySelector('#loginButton');
			login.style.display = 'none';
			comp._root.querySelector('#registerButton').style.display = 'none';
			comp._root.querySelector('#boardsButton').style.display = 'block';
			comp._root.querySelector('#boardsButton').addEventListener('click', function (evn) {
				evn.target.querySelector('a').click();
			});
			comp._root.querySelector('#eduButton').style.display = 'block';
			comp._root.querySelector('#signOut').style.display = 'block';
			comp._root.querySelector('#eduButton').addEventListener('click', function (evn) {
				evn.target.querySelector('a').click();
			});
			comp._root.querySelector('#signOut').style.display = 'block';
			comp._root.querySelector('#signOut').addEventListener('click', function () {
				evn.target.querySelector('a').click();
			});
			console.log('logged');
		}
	}
}