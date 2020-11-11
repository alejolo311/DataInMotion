// Get the board from the Server
function goBack () {
  console.log('Go back', board);
  window.open('/user/boards', '_self');
}

function getBoardView () {
	const boardContainer = document.getElementById('board');
	if (window['Board']) {
		console.log('Script Already loaded');
		DOMManager.render(
			Board,
			boardContainer
		);
	} else {
		let script = document.createElement('script');
		script.setAttribute('name', 'board_script');
		script.type = 'text/javascript';
		script.onload = function() {
			window['Board'] = Board;
			DOMManager.render(
				Board,
				boardContainer
			);
		}
		script.src = `/static/scripts/Board.js?${uuid()}`;
		document.head.appendChild(script);
	}
}