async function login(event) {
	const userName = document.getElementById("username").value
	const response = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/users/check/`, {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: userName
		})
	})
	let json = await response.json();
	localStorage.user = json.id;
	localStorage.isLogged = true;
	window.location.replace(`${global.prot}://${global.domain}/user/${json.id}/boards`);
}