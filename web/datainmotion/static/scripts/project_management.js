let board = {};

function createMenu (position, items) {
	const menu = $('.menus');
	menu.css('visibility', 'visible');
	menu.css('left', position - 40);
	for (item of items) {
		let menuString = '';
		// console.log(item);
		menuString += '<li>' + item[0] + '</li>';
		const option = $(menuString);
		option.on('click', item[1]);
		menu.append(option);
	}
	menu.mouseleave(function () {
		$(this).css('visibility', 'hidden');
	});
};
function createProject () {
	console.log('create project');
	const newProject = {};
	newProject.name = prompt('Project name: >');
	newProject.boards = [];
	newProject.boards.push(prompt('Board name: >'));
	console.log(newProject);
}
function openProject() {
	console.log('Open an existing project');
}
let trackedBoard;
let initial = {};
let topColor;
function getBoards() {
	// console.log('get boards');
	const userId = $('.container').attr('user_id');
	// request the boards attached to the user
	// and attach the view to the container
	
	$.ajax({
		url: `http://${global.apiDirection}:8080/api/v1/users/${userId}/boards`,
		contentType: 'application/json',
		dataType: 'json',
		success: function (response) {
			// console.log(response);
			const cont = $('<div></div>');
			$(cont).addClass('boards');
			$(cont).css('margin-top', '40px');
			let count = 1;
			const addBoard = $('<div><h1>add a new Board</h1></div>');
			$(addBoard).addClass('add_board');
			$(addBoard).css('background-image', 'url(/static/images/plus.png)');
			$(addBoard).hover(function() {$(this).css('box-shadow', '0px 0px 30px #ffffffa1')},
								function() {$(this).css('box-shadow', '0px 0px 0px white')});
			$(cont).append($(addBoard));
			for (board of response) {
				// console.log(board);
				const a = $('<h1></h1>');
				// console.log(board.name);
				if (board.name === null) {
					a.text('Board' + count);
				} else {
					a.text(board.name);
				}
				count++;
				const b = $('<h2></h2>');
				b.text(board.id);
				const bc = $('<div></div>');
				bc.append(a);
				bc.append(b);
				$(bc).attr('b_id', board.id);
				$(bc).addClass('gradient');
				$(bc).hover(function() {$(this).css('box-shadow', '0px 0px 30px #ffffffa1')},
								function() {$(this).css('box-shadow', '0px 0px 0px white')});
				cont.append(bc);
			}
			$('body').append($(cont));
			$('.boards > div').on('mousedown', function () {
				trackedBoard = $(this).attr('b_id');
				initial['x'] = $(this).position().left;
				initial['y'] = $(this).position().top;
				// console.log('star tracking from ', initial);
				topColor = $('.top_bar').css('background-color');
				$(window).mousemove(function (evn) {
					const board = $('[b_id=' + trackedBoard + ']');
					$(board).css('position', 'absolute');
					$(board).css('z-index', '30');
					$(board).css('left', (evn.pageX - 200).toString());
					$(board).css('top', (evn.pageY - 200).toString());
					// console.log(evn.pageX, evn.pageY);
					if (evn.pageY < 100) {
						// console.log('bright upbar');
						$('.top_bar').css('background-color', '#e7cee1');
						$('.delete_sign').css('display', 'block');
						$('.grab_message').css('display', 'none');
					} else {
						// console.log(topColor);
						$('.top_bar').css('background-color', topColor);
						$('.delete_sign').css('display', 'none');
						$('.grab_message').css('display', 'block');
					}
				});
			});
			$('.boards > div').on('mouseup', function () {
				$(window).unbind('mousemove');
				// console.log($(this).position().top);
				// console.log($(this).position().left);
				const top = $(this).position().top;
				if ($(this).attr('b_id') === trackedBoard) {
					console.log(top);
					if (top < -97) {
						// console.log('remove');
						trackedBoard = '';
						del = confirm("You are about to delete this board?\nThis can't be undone\nContinue");
						if (del) {
							fetch(`http://${global.apiDirection}:8080/api/v1/boards/` + $(this).attr('b_id') + '/delete')
							.then(function (response) {
								console.log(response);
								location.reload();
							});
						} else {
							$(this).css('position', 'relative');
							$(this).css('top', '0');
							$(this).css('left', '0');
							$('.top_bar').css('background-color', topColor);
							$('.delete_sign').css('display', 'none');
							$('.grab_message').css('display', 'block');
							$(board).css('z-index', '10');
						}
					} else {
						console.log(initial);
						if (initial['x'] === $(this).position().left &&
							initial['y'] === $(this).position().top) {
							console.log('open', $(this).attr('b_id'));
							const boardId = $(this).attr('b_id');
							if (boardId !== undefined) {
								window.open('/boards/' + $(this).attr('b_id'), '_self');
							} else {
								createBoard();
							}
						} else {
							$(this).css('position', 'relative');
							$(this).css('top', '0');
							$(this).css('left', '0');
							$(board).css('z-index', '10');
						}
					}
				}
			});

		}
	});
}
function createBoard() {
	console.log('Create a new board');
	const userId = $('.container').attr('user_id');
	// const userId = 'a74c74e5-3be5-420b-809a-592b0e65d76b';
	$.ajax({
		url: `http://${global.apiDirection}:8080/api/v1/users/${userId}/create_board`,
		contentType: 'application/json',
		dataType: 'json',
		success: function (data) {
			console.log(data);
			window.open('/boards/' + data.board_id, '_self');
		},
		error: function (error) {
			console.log(error);
		}
	});
	
}
function saveBoardName (name) {
	const bId = $('.container').attr('board_id');
	$.ajax({
		type: 'POST',
		url: `http://${global.apiDirection}:8080/api/v1/boards/${bId}/save_name`,
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({'name': name}),
		success: function (resp) {
			console.log(resp);
		}
	});
}
function newNode () {
	console.log('Create a new node');
	const boardId = $('.container').attr('board_id');
	$.ajax({
		url: `http://${global.apiDirection}:8080/api/v1/boards/${boardId}/create_node`,
		type: 'POST',
		success: function (resp) {
			console.log(resp);
			$('[name=n_name]').val('');
			$('[name=w_type]').val('request');
			$('[name=n_url]').val('');
			$('[name=an_mode]').val('none');
			$('[name=string]').val('');
			newNodeFlow(resp.id, resp);
		},
		error: function (error) {
			console.log(error);
		}
	});

}
function importNode() {
	const boardId = $('.container').attr('board_id');
	fetch(`http://${global.apiDirection}:8080/api/v1/users/${boardId}/boards_nodes`)
	.then(function (resp) {
		console.log(resp);
		return (resp.json());
	}).then(function (resp) {
		console.log(resp);
		const boardsCont = $('<div class="board_nodes"></div>');
		for (board in resp) {
			const boardCont = $('<div class="board_node"></div>');
			$(boardCont).append($(`<h1>${resp[board]['name']}</h1>`));
			// $(boardCont).append($(`<h1>${board}</h1>`));
			console.log(resp[board]);
			for (node in resp[board]['nodes']) {
				console.log(resp[board]['nodes'][node]['name']);
				let nodeName = resp[board]['nodes'][node]['name'];
				let nodeId = resp[board]['nodes'][node]['id'];
				const nodeHtml = $(`<h2 node_id="${nodeId}">${nodeName}</h2>`);
				$(nodeHtml).on('click', function (evn) {
					// fetch for a new node
					console.log($(this).attr('node_id'));
					const nId = $(this).attr('node_id');
					const boardId = $('.container').attr('board_id');
					fetch(`http://${global.apiDirection}:8080/api/v1/nodes/${nId}/copy_to/${boardId}`)
					.then(function (resp) {
						return resp;
					}).then(function (resp) {
						console.log(resp);
						$('.import').css('display', 'none');
						location.reload();
					});
				})
				boardCont.append(nodeHtml)
			}
			boardsCont.append(boardCont);
		}
		const size = Object.keys(resp).length;
		console.log(size);
		if (Math.round(size / 3) > 0) {
			let times = Math.round(size / 3) - 1;
			let rows = $('.board_nodes').css('grid-template-rows');
			for (let i = 0; i < times; i++) {
				rows += '130px';
			}
			$('.board_nodes').css('grid-template-rows', rows);
		}
		$('.import').empty();
		$('.import').append($('<h3></h3>'));
		$('.import h3').on('click', function (evn) {
			$('.import').css('display', 'none');
		});
		$('.import').append(boardsCont);
		$('.import').css('z-index', 30);
		$('.import').css('display', 'block');
	});
};
function deleteNode (id) {
	$.ajax({
		type: 'DELETE',
		url: `http://${global.apiDirection}:8080/api/v1/nodes/${id}`,
		success: function (response) {
			console.log(response);
			$('[node_id=' + id + ']').remove();
			location.reload();
		},
		error: function (error) {
			console.log(error);
		}
	});
}
function setProjectMenu() {
	$('[menu=project]').on('click', function (evn) {
		
		$('.menus').empty();
		const items = [];
		// items.push(['create new project', createProject])
		// items.push(['open project', openProject]);
		items.push(['create new board', createBoard]);
		// items.push(['open board', openBoard]);
		createMenu(evn.pageX, items);
		

	});
	$('[menu=nodes]').on('click', function (evn) {
		$('.menus').empty();
		const items = [];
		items.push(['new node', newNode])
		items.push(['import from other board', importNode])
		createMenu(evn.pageX, items);
	});
}