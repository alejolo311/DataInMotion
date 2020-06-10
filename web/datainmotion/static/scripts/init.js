$(window).on('load', function () {
	setProjectMenu();
	newNodeFlow('1234', {'headers': {}, 'data': {}});
	drawGrid();
	const boardId = $('.container').attr('board_id');
	// console.log(boardId);
	if (boardId !== undefined && boardId !== '') {
		getBoardView();
	} else {
		console.log('no board');
		getBoards();
	}
});