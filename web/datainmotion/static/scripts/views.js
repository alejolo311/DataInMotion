// Get the board from the Server
function loadPositions () {
	const boardId = $('.container').attr('board_id');
	$.ajax({
		url: 'http://0.0.0.0:8080/api/v1/boards/' + boardId,
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
function goBack () {
	console.log('Go back', board);
	window.open('/user/' + board.user_id + '/boards', '_self');
}
function getBoardView () {
	const boardId = $('.container').attr('board_id');
	// Detect when board name is pressed
	$('.board_name').on('click', function () {
		console.log('chage board name');
		$(this).css('display', 'none');
		$('[name=board_name]').css('display', 'block');
	});
	$('[name=board_name]').focusout(function (evn) {
		console.log($(this).val());
		$(this).css('display', 'none');
		$('.board_name').css('display', 'block');
		$('.board_name').text($(this).val());
		saveBoardName($(this).val());
	});
	$.ajax({
		url: 'http://0.0.0.0:8080/api/v1/status',
		success: function (data) {
			$.ajax({
				url: 'http://0.0.0.0:5000/boards/' + boardId + '/nodes',
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
					setConnectionsListeners();
					$('[action=user]').on('click', function () {
						goBack();
					});
					// console.log(nodes);
				}
			});
		},
		error: function (err) {
			console.log(err)
		}
	});
}
