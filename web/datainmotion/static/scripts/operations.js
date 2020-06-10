function setOpsListeners() {
	$('.test_button').on('click', function (evn) {
		const nodeId = $(this).attr('n_id');
		// The next wil send a GET request to DataInMotion AP
		// to run the test and return the response
		$.ajax({
			url: 'http://0.0.0.0:8000/api/v1/nodes/' + nodeId + '/run',
			crossDomain: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			success: function (data) {
				console.log(data);
			}
		});
	});
}