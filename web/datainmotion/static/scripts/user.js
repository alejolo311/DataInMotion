$(window).on('load', function () {
	const email = prompt('create an user with your email');
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		url: 'http://0.0.0.0:8000/api/v1/users/check/',
		data: JSON.stringify({
			'email': email
		}),
		success: function (response) {
			console.log(response);
			window.open('http://0.0.0.0:8001/user/' + response.id + '/boards', '_self');
		}

	});
});