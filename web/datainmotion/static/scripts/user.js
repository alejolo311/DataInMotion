async function login(event) {
	const userName = document.getElementById("username").value;
	const passWd = document.querySelector('[type="password"]').value;
	if (userName !== '' && passWd !== '') {
		const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/users/check/`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: userName,
				passwd: passWd
			})
		});
		let json = await response.json();
		document.querySelector('[for="user"]').style.color = 'grey';
		localStorage.user = json.id;
		localStorage.isLogged = true;
		window.location.replace(`${global.prot}://${global.domain}/user/${json.id}/boards`);
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
async function getLoginView() {
	const loginFetch = await fetch(`${global.prot}://${global.domain}/login`);
	const loginView = await loginFetch.text();
	return loginView;
}
