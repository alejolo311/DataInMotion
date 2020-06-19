function setOpsListeners() {
	$('.test_button').on('click', function (evn) {
		const nodeId = $(this).attr('n_id');
		// The next wil send a GET request to DataInMotion AP
		// to run the test and return the response
		$('.loading').css('display', 'block');
		$.ajax({
			url: `http://${global.apiDirection}:8080/api/v1/nodes/${nodeId}/run`,
			crossDomain: true,
			contentType: 'application/json',
			dataType: 'json',
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			success: function (data) {
				$('.loading').css('display', 'none');
				showConsole(data);
			},
			error: function (error) {
				console.log(error);
				$('.loading').css('display', 'none');
			}
		});
	});
}