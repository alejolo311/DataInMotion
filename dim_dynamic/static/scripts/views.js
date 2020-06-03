$(window).on('load', function () {
	setProjectMenu();
	drawGrid();
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
	const boardId = $('.container').attr('board_id');
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/status',
		success: function (data) {
			$.ajax({
				url: 'http://0.0.0.0:8001/boards/' + boardId + '/nodes',
				success: function (nodes) {
					$('.container').append($(nodes));
					popup();
					setGrabbers();
					loadPositions();
					setNodeSettings();
					setOpsListeners();
					// console.log(nodes);
				}
			});
		},
		error: function (err) {
			console.log(err)
		}
	});
});