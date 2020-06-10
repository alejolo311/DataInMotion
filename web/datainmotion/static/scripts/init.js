$(window).on('load', function () {
	setProjectMenu();
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