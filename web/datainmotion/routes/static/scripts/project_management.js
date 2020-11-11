let board = {};
let menuTimeOut;


let trackedBoard;
const initial = {};
let topColor;

// Needs reallocation to DashBoard.js
function drawDashboard(response) {
	const cont = $('<div></div>');
	$(cont).addClass('boards');
	$(cont).css('margin-top', '40px');
	let count = 1;
	// draw the default add board
	const addBoard = $('<div><h1>add a new Board</h1></div>');
	$(addBoard).addClass('add_board');
	$(addBoard).css('background-image', 'url(/static/images/plus.png)');
	$(addBoard).hover(function () { $(this).css('box-shadow', '0px 0px 10px white'); },
		function () { $(this).css('box-shadow', '0px 0px 0px white'); });
	$(cont).append($(addBoard));
	// Iterates the boards and draw the board pin
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
		const p = $('<p></p>');
		const nLength = Object.keys(board.nodes).length;
		console.log(Object.keys(board.nodes).length);
		if (board.nodes) {
			p.text(`Services: ${nLength}`);
		} else {
			p.text(`Services: NaN`);
		}
		// const b = $('<h2></h2>');
		// b.text(board.id);
		// const c = $('<h2></h2>');
		// c.text('turn off');
		const bc = $('<div></div>');
		bc.append(a);
		bc.append(p)
		// bc.append(b);
		// bc.append(c);
		$(bc).attr('b_id', board.id);
		$(bc).addClass('gradient');
		$(bc).hover(function () { $(this).css('box-shadow', '0px 0px 10px white'); },
			function () { $(this).css('box-shadow', '0px 0px 0px white'); });
		cont.append(bc);
	}
	$('body').append($(cont));
	$('.boards > div').on('mousedown', function () {
		trackedBoard = $(this).attr('b_id');
		initial.x = $(this).position().left;
		initial.y = $(this).position().top;
		// console.log('star tracking from ', initial);
		topColor = $('.top_bar').css('background-color');
		$(window).mousemove(function (evn) {
			const board = $('[b_id=' + trackedBoard + ']');
			const parent = board.parent();
			parent.get(0).style.overflow = 'visible';
			$(board).css('position', 'absolute');
			$(board).css('z-index', '30');
			console.log(board.get(0));
			let pBoard = board.get(0).parentNode;
			console.log(pBoard);
			const computed = window.getComputedStyle(pBoard, null);
			const leftMargin = Number(computed.left.slice(0, computed.left.length - 2));
			console.log(leftMargin);
			$(board).css('left', (evn.pageX - leftMargin - ($(board).width() / 2)).toString());
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
	$('.boards > div').on('mouseup', function (evn) {
		$(window).unbind('mousemove');
		
		// console.log($(this).position().top);
		// console.log($(this).position().left);
		const top = $(this).position().top;
		if ($(this).attr('b_id') === trackedBoard) {
			console.log(top);
			$(this).parent().css('overflowY', 'scroll');
			$(this).parent().css('overflowX', 'hidden');
			if (top < -97) {
				// console.log('remove');
				trackedBoard = '';
				const del = confirm("You are about to delete this board?\nThis can't be undone\nContinue");
				if (del) {
					fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/` + $(this).attr('b_id') + '/delete')
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
				if (initial.x === $(this).position().left &&
					initial.y === $(this).position().top) {
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
	// Draw the active service for each node
	DOMManager.render(
		ActiveService,
		document.getElementsByClassName('active_cont')[0],
		response
	)
}
// Needs to be reallocated to Boards.js
function getBoards () {
	const now = new Date(Date.now());
	let url = new URL(`${global.prot}://${global.domain}${global.apiPort}/api/v1/users/boards`);
	let params = {
		sync_date: [
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		]
	}
	url.search = new URLSearchParams(params).toString();
	fetch(url,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': localStorage.getItem('token')
			}
		}
	).then((res) => {
		if (res.status === 200) {
			return res.json();
		} else {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.replace('/login');
		}
	}).then(json => {
		drawDashboard(json);
	});
}

function createBoard () {
  console.log('Create a new board');
  fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/users/create_board`,
	{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': localStorage.getItem('token')
		}
	}
  ).then((res) => {
	if (res.status === 200) {
		return res.json();
	} else {
		window.location.replace('/login');
	}
  }).then(json => {
	window.open('/boards/' + json.board_id, '_self');
  });
}
function setNodeView(node, evn) {
	unbinNodeEditor();
	$('[name=n_name]').val(node.name);
	if (node.type === 'service') {
		$('[name=is_service]').prop('checked', true);
	} else {
		$('[name=is_service]').prop('checked', false);
	}
	$('[name=w_type]').val(node.work_type);
	$('[name=n_url]').val(node.api_url);
	$('[name=an_mode]').val(node.analisis_mode);
	$('[name=string]').val(node.string);
	$('.node_cont_info').css('top', evn.pageY + 20);
	$('.node_cont_info').css('left', evn.pageX - 30);
	$('.progress').css('top', evn.pageY - 26);
	$('.progress').css('left', evn.pageX + 80);
	$('.close_node').css('top', evn.pageY);
	$('.close_node').css('left', evn.pageX - 30);
	$('.close_node').on('click', function () {
		node = null;
		$('.new_node_cont').css('display', 'none');
		unbindAll();
		getBoardView();
	});
	$('.step').css('display', 'none');
	newNodeFlow(node, node.id);
}
function importTheNode (nId, reload) {
	const boardId = $('.container').attr('board_id');
	fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${nId}/copy_to/${boardId}`)
	.then(function (resp) {
		return resp;
	}).then(function (resp) {
		console.log(resp);
		$('.import').css('display', 'none');
		if (reload) {
			location.reload();
		}
	});
}
function importNode () {
  // Get a list of boards and render them as html
  $('.import').css('display', 'block');
  $('.import').css('z-index', '20');
  const boardId = $('.container').attr('board_id');
  fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/users/${boardId}/boards_nodes`)
    .then(function (resp) {
      console.log(resp);
      return (resp.json());
    }).then(function (resp) {
      console.log(resp);
      const boardsCont = $('<div class="board_nodes"></div>');
      for (board in resp) {
        const boardCont = $('<div class="board_node"></div>');
        $(boardCont).append($(`<h1>${resp[board].name}</h1>`));
        console.log(resp[board]);
        for (node in resp[board].nodes) {
          console.log(resp[board].nodes[node].name);
          const nodeName = resp[board].nodes[node].name;
          const nodeId = resp[board].nodes[node].id;
          const nodeHtml = $(`<h2 node_id="${nodeId}">${nodeName}</h2>`);
          // This fetch the node info from the API
          $(nodeHtml).on('click', function (evn) {
			// fetch for a new node
			const nId = $(this).attr('node_id');
			// true for reload
            importTheNode(nId, true);
          });
          boardCont.append(nodeHtml);
        }
        boardsCont.append(boardCont);
      }
      const size = Object.keys(resp).length;
      console.log(size);
      // Render rows and columns
      if (Math.round(size / 3) > 0) {
        const times = Math.round(size / 3) - 1;
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
}
let importedBoard;
function deleteNode (id) {
  $.ajax({
    type: 'DELETE',
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${id}`,
    success: function (response) {
      console.log(response);
      $('[node_id=' + id + ']').remove();
	  unbindAll();
	  getBoardView();
    },
    error: function (error) {
      console.log(error);
    }
  });
}
// Sets the required Menus
function setProjectMenu () {
}
  function createNewNode(type) {
	console.log(type);
  }