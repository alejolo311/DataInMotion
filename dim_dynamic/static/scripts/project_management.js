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
function getBoards() {
	console.log('Open an existing board');
	const userId = $('.container').attr('user_id');
	// request the boards attached to the user
	// and attach the view to the container
	
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/users/' + userId + '/boards',
		contentType: 'application/json',
		dataType: 'json',
		success: function (response) {
			console.log(response);
			const cont = $('<div></div>');
			$(cont).addClass('boards');
			let count = 1;
			const addBoard = $('<div><h1>add a new Board</h1></div>');
			$(addBoard).addClass('add_board');
			$(addBoard).css('background-image', 'url(/static/images/plus.png)');
			$(addBoard).hover(function() {$(this).css('box-shadow', '0px 0px 10px white')},
								function() {$(this).css('box-shadow', '0px 0px 0px white')});
			$(cont).append($(addBoard));
			for (board of response) {
				console.log(board);
				const a = $('<h1></h1>');
				console.log(board.name);
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
				cont.append(bc);
			}
			$('body').append($(cont));
			$('.boards > div').on('click', function () {
				console.log('open', $(this).attr('b_id'));
				const boardId = $(this).attr('b_id');
				if (boardId !== undefined) {
					window.open('/boards/' + $(this).attr('b_id'), '_self');
				} else {
					createBoard();
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
		url: 'http://0.0.0.0:8000/api/v1/users/' + userId + '/create_board',
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
		url: 'http://0.0.0.0:8000/api/v1/boards/' + bId + '/save_name',
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
		url: 'http://0.0.0.0:8000/api/v1/boards/' + boardId + '/create_node',
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
function deleteNode (id) {
	$.ajax({
		type: 'DELETE',
		url: 'http://0.0.0.0:8000/api/v1/nodes/' + id,
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
		createMenu(evn.pageX, items);
	});
}