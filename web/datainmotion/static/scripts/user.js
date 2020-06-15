$(window).on('load', function () {
	const email = prompt('create an user with your email');
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		url: `http://${global.apiDirection}:8080/api/v1/users/check/`,
		data: JSON.stringify({
			'email': email
		}),
		success: function (response) {
			console.log(response);
			window.open(`http://${global.apiDirection}/user/${response.id}/boards`, '_self');
		}

	});
});