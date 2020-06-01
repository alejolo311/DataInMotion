$(window).on('load', function () {
	const loadPositions = function () {
		const boardId = $('.container').attr('board_id');
		$.ajax({
			url: 'http://0.0.0.0:8000/api/v1/boards/' + boardId,
			dataType: 'json',
			contentType: 'application/json',
			success: function (resp) {
				for (key in resp) {
					// console.log(resp[key]);
					// console.log(key);
					$('[node_id="' + key + '"]').css('top', resp[key]['y']);
					$('[node_id="' + key + '"]').css('left', resp[key]['x']);
					board = resp;

				}
				drawConnections();
				// console.log(resp);
			}
		});
	};
	// console.log('views imported');
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/status',
		success: function (data) {
			$.ajax({
				url: 'http://0.0.0.0:8001/nodes/324',
				success: function (nodes) {
					$('.container').append($(nodes));
					popup();
					setGrabbers();
					loadPositions();
					setNodeSettings();
					// console.log(nodes);

				}
			});
		},
		error: function (err) {
			console.log(err)
		}
	});
});