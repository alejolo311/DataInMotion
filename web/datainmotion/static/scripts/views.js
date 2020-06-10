// Get the board from the Server
function loadPositions () {
	const boardId = $('.container').attr('board_id');
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/boards/' + boardId,
		dataType: 'json',
		contentType: 'application/json',
		success: function (resp) {
			// change 'resp' for 'resp.nodes' 
			// console.log(resp);
			for (key in resp.nodes) {
				// console.log(key);
				$('[node_id="' + key + '"]').css('top', resp.nodes[key]['y']);
				$('[node_id="' + key + '"]').css('left', resp.nodes[key]['x']);
			}
			board = resp;
			drawConnections();
		}
	});
};
function getBoardView () {
	const boardId = $('.container').attr('board_id');
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/status',
		success: function (data) {
			$.ajax({
				url: 'http://0.0.0.0:8001/boards/' + boardId + '/nodes',
				success: function (nodes) {
					// console.log(nodes);
					// $('.container').empty();
					$('.container').empty();
					$('.container').append($(nodes));
					popup();
					setGrabbers();
					loadPositions();
					setNodeSettings();
					setOpsListeners();
					setConnectionsListeners()
					// console.log(nodes);
				}
			});
		},
		error: function (err) {
			console.log(err)
		}
	});
}
