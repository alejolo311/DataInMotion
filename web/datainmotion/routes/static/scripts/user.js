async function login(event) {
	const userName = document.getElementById("username").value;
	const passWd = document.querySelector('[type="password"]').value;
	if (userName !== '' && passWd !== '') {
		const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/login`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: userName,
				password: passWd
			})
		});
		let json = await response.json();
		if (!json.id) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
		}
		console.log(json);
		document.querySelector('[for="user"]').style.color = 'grey';
		// localStorage.user = json.id;
		localStorage.token = json.token;
		localStorage.isLogged = true;
		if (localStorage.getItem('openBoard')) {
			const opB = localStorage.getItem('openBoard');
			localStorage.removeItem('openboard');
			window.location.replace(`${global.prot}://${global.domain}/boards/${opB}`);
		} else {
			window.location.replace(`${global.prot}://${global.domain}/user/boards`);
		}
	} else if (userName === '' && passWd !== ''){
		document.querySelector('[for="user"]').innerHTML = 'Empty Username';
		document.querySelector('[for="user"]').style.color = 'red';
		document.querySelector('[for="user"]').style.fontWeight = 'bold';
	} else if (passWd === '' && userName !== ''){
		document.querySelector('[for="pass"]').innerHTML = 'No password';
		document.querySelector('[for="pass"]').style.color = 'red';
		document.querySelector('[for="pass"]').style.fontWeight = 'bold';
	} else if (passWd === '' && userName === ''){
		document.querySelector('[for="pass"]').innerHTML = 'No password';
		document.querySelector('[for="pass"]').style.color = 'red';
		document.querySelector('[for="pass"]').style.fontWeight = 'bold';
		document.querySelector('[for="user"]').innerHTML = 'Empty Username';
		document.querySelector('[for="user"]').style.color = 'red';
		document.querySelector('[for="user"]').style.fontWeight = 'bold';
	}
	
}
async function register(event) {
	const userName = document.getElementById("username").value;
	const passWd = document.querySelector('[type="password"]').value;
	const passConf = document.querySelector('[name="confirm"]').value;
	if (userName !== '' && passWd !== '' && (passWd === passConf)) {
		const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/register`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: userName,
				password: passWd
			})
		});
		let json = await response.json();
		if (!json.id) {
			window.location.replace(`${global.prot}://${global.domain}/register`);
		}
		console.log(json);
		document.querySelector('[for="user"]').style.color = 'grey';
		// localStorage.user = json.id;
		localStorage.token = json.token;
		if (localStorage.openboard) {
			const opB = localStorage.openboard;
			localStorage.removeItem('openboard');
			window.location.replace(`${global.prot}://${global.domain}/boards/${opB}`);
		} else {
			window.location.replace(`${global.prot}://${global.domain}/check_mail`);
		}
		// window.location.replace(`${global.prot}://${global.domain}/user/${json.id}/boards`);
	} else if (userName === '' && passWd !== ''){
		document.querySelector('[for="user"]').innerHTML = 'Empty Username';
		document.querySelector('[for="user"]').style.color = 'red';
		document.querySelector('[for="user"]').style.fontWeight = 'bold';
	} else if (passWd === '' && userName !== ''){
		document.querySelector('[for="pass"]').innerHTML = 'No password';
		document.querySelector('[for="pass"]').style.color = 'red';
		document.querySelector('[for="pass"]').style.fontWeight = 'bold';
	} else if (passWd === '' && userName === ''){
		document.querySelector('[for="pass"]').innerHTML = 'No password';
		document.querySelector('[for="pass"]').style.color = 'red';
		document.querySelector('[for="pass"]').style.fontWeight = 'bold';
		document.querySelector('[for="user"]').innerHTML = 'Empty Username';
		document.querySelector('[for="user"]').style.color = 'red';
		document.querySelector('[for="user"]').style.fontWeight = 'bold';
	} else if (passWd !== passConf) {
		document.querySelector('[for="confirm"]').innerHTML = 'The password must be the same';
		document.querySelector('[for="confirm"]').style.color = 'red';
		document.querySelector('[for="confirm"]').style.fontWeight = 'bold';
		console.log('Password is not the same');
	}
	
}
// registerButton
async function getLoginView() {
	const loginFetch = await fetch(`${global.prot}://${global.domain}/login`);
	const loginView = await loginFetch.text();
	return loginView;
}

async function changePassword(event) {
	const passWd = document.querySelector('[type="password"]').value;
	const passConfirm = document.querySelector('[name="confirm"]').value;
	if (passConfirm !== '' && passWd !== '' && passConfirm === passWd) {
		const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/reset`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': localStorage.getItem('token')
			},
			body: JSON.stringify({
				password: passWd
			})
		});
		let json = await response.json();
		if (!json.id) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
		}
		console.log(json);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.location.replace(`${global.prot}://${global.domain}/login`);
	} else if (passConfirm === '' && passWd !== ''){
		document.querySelector('[for="confirm"]').innerHTML = 'Please confirm your password';
		document.querySelector('[for="confirm"]').style.color = 'red';
		document.querySelector('[for="confirm"]').style.fontWeight = 'bold';
	} else if (passWd === '' && passConfirm !== ''){
		document.querySelector('[for="pass"]').innerHTML = 'No password';
		document.querySelector('[for="pass"]').style.color = 'red';
		document.querySelector('[for="pass"]').style.fontWeight = 'bold';
	}
}

async function forgotPassword(event) {
	const userName = document.getElementById("username").value;
	if (userName !== '') {
		const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/forgot`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: userName
			})
		});
		let json = await response.json();
		console.log(json);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.location.replace(`${global.prot}://${global.domain}/check_mail`);
	} else {
		document.querySelector('[for="username"]').innerHTML = 'Provide an email';
		document.querySelector('[for="username"]').style.color = 'red';
		document.querySelector('[for="username"]').style.fontWeight = 'bold';
	}
}