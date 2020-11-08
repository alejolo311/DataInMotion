let board = {};
let menuTimeOut;

function createMenu (position, items) {
	const menu = $('.menus');
	menu.css('visibility', 'visible');
	menu.css('left', position - 40);
	for (const item of items) {
		let menuString = '';
		// console.log(item);
		menuString += '<li>' + item[0] + '</li>';
		const option = $(menuString);
		option.on('click', item[1]);
		menu.append(option);
	}
	menu.mousemove( function(evn) {
		clearTimeout(menuTimeOut);
	})
	menu.mouseleave(function (evn) {
		menuTimeOut = setTimeout(function () {
			evn.target.style.visibility = 'hidden';
		}, 3000);
	});
}


let trackedBoard;
const initial = {};
let topColor;
// Needs reallocation to Boards.js
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
function saveBoardName (name) {
  const bId = $('.container').attr('board_id');
  $.ajax({
    type: 'POST',
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${bId}/save_name`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ name: name }),
    success: function (resp) {
      console.log(resp);
      saving = false;
    }
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
function newNode (type) {
  console.log('Create a new node of type', type);
  const boardId = $('.container').attr('board_id');
  $.ajax({
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/create_node`,
	type: 'POST',
	contentType: 'application/json',
	data: JSON.stringify({
		'type': type
	}),
    success: function (resp) {
      console.log(resp);
      if (resp.work_type === 'sender') {
		WhatsAppFlow(resp, {'pageX': 140, 'pageY': 200});
	  } else {
		$('.new_node_cont').css('display', 'block');
		const root = document.getElementById('node_editor');
		const editor = new NodeEditor(root, resp.id);
		editor.setpos({'pageX': 40, 'pageY': 200});
	  }
    },
    error: function (error) {
      console.log(error);
    }
  });
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
function importTheNodeOnByOne (node) {
	const boardId = $('.container').attr('board_id');
	fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/add_node`,
	  {
		method: 'POST', // or 'PUT'
		body: JSON.stringify(node), // data can be `string` or {object}!
		headers:{
		  'Content-Type': 'application/json'
		}
	  })
	.then(function (resp) {
		return resp;
	}).then(function (resp) {
		console.log(resp);
		$('.import').css('display', 'none');
		location.reload();
	});
}
function importCompleteBoard (impBoard) {
	const boardId = $('.container').attr('board_id');
	fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/complete_board`,
	  {
		method: 'POST', // or 'PUT'
		body: JSON.stringify(impBoard), // data can be `string` or {object}!
		headers:{
		  'Content-Type': 'application/json'
		}
	  })
	.then(function (resp) {
		return resp;
	}).then(function (resp) {
		console.log(resp);
		$('.import').css('display', 'none');
		location.reload();
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
function importBoard() {
	console.log('Import board from file');
	const filePrompt = $('<div class="file_cont"></div>');
	const cont = $('<div class="alert_cont"></div>');
	const close = $('<h2 class="close"></h2>');
	const fileInput = $('<input id="file" name="file" type="file" accept=".dim" style="display: none;">');
	const buttonInput = $('<input class="browse" type="button" value="Browse from device...">');
	const complete = $('<button >import complete board</button>');
	const oneOrMore = $('<button >import one or more nodes</button>');
	$(buttonInput).on('click', function () {
		$(fileInput).trigger('click');
	});
	$(fileInput).change(function (evn) {
		console.log($(this).val());
		const fr = new FileReader();
		fr.onload = function (evn) {
			// console.log(evn.target.result);
			importedBoard = JSON.parse(evn.target.result);
			$(filePrompt).append($(oneOrMore));
			$(filePrompt).append($(complete));
			$(filePrompt).append($(`<div class="import_name"><h1>${importedBoard.data.name}</h1><button>import</button></div>`));
		};
		fr.readAsText(evn.target.files[0]);
	});
	$(oneOrMore).on('click', function (evn) {
		const list = $('<ul style="margin: 0;padding: 0;"></ul>');
		console.log(importedBoard);
		for (node in importedBoard.nodes) {
			console.log(importedBoard.nodes[node].name);
			const name = importedBoard.nodes[node].name;
			const li = $(`<li node_id="${node}"></li>`);
			const inp = $(`<h3>${name}</h3><input type="checkbox" style="margin-top: 6px;">`);
			$(li).append($(inp));
			$(list).append($(li));
		}
		$('.import_name button').css('display', 'block');
		$('.import_name button').on('click', function (evn) {
			console.log($(this).parent().parent().find('ul'));
			const ul = $(this).parent().parent().find('ul')[0];
			const childs = $(ul).children().toArray();
			console.log(childs);
			const nodesList = [];
			for (li of childs) {
				// console.log(li);
				const checkbox = $(li).find('input');
				const name = $(li).find('h3').text();
				const nId = $(li).attr('node_id');
				console.log($(li).attr('node_id'));
				if ($(checkbox).prop('checked')) {
					// false to no reload
					nodesList.push(importedBoard.nodes[nId]);
					
				}
				// console.log(name, $(checkbox).prop('checked'));
			}
			importTheNodeOnByOne(nodesList);
		});
		$(filePrompt).append($(list));
	});
	$(complete).on('click', function () {
		importCompleteBoard(importedBoard);

	});
	$(close).on('click', function () {
		$(cont).remove();
	});
	$(filePrompt).append($(fileInput));
	$(filePrompt).append($(buttonInput));
	$(filePrompt).append($(close));
	$(cont).append($(filePrompt));
	$('body').append($(cont));
	$(cont).css('display', 'block');
}
function exportBoard() {
	console.log('Export board from file');
	const cont = $('<div class="alert_cont" ></div>')
	const close = $('<h2 class="close"></h2>');
	const filePrompt = $('<div class="file_cont" style="width: auto;"></div>');
	const link = $('<a id="download_board" class="download_board">Download this board</a>');
	const exportObj = {data: board};
	const boardId = $('.container').attr('board_id');
	const boardName = $('.board_name').text().replace(/^\s+|\s+$/g, "");
	$(close).on('click', function () {
		$(cont).remove();
	});
	fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/nodes`)
	.then(function (resp) {
		return resp.json();
	}).then(function (resp) {
		exportObj.nodes = resp;
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
		$(link).on('click', function (evn) {
			$(cont).remove();
		});
		$(link).attr('href', dataStr);
		$(link).attr('download', `${boardName}.dim`);
		$(filePrompt).append($(link));
		$(filePrompt).append($(close));
		$(cont).append($(filePrompt));
		$('body').append($(cont));
	});
}
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
  $('[menu=project]').on('click', function (evn) {
    $('.menus').empty();
    const items = [];
    // items.push(['create new project', createProject])
    // items.push(['open project', openProject]);
    items.push(['create new board', createBoard]);
    // items.push(['open board', openBoard]);
    createMenu(evn.pageX, items);
  });
  /*
		<option value="none" selected></option>
		<option value="statistics">Statistics</option>
		<option value="comparision">Comparision</option>
		<option value="replace">Generate phrase</option>
		<!--<option value="gen_signature">GenSignature</option>-->
		<option value="JSON">JSON</option>
		<option value="HTML">text or HTML</option>
		<option value="get_updates">check updates</option>
		<option value="media_player">media viewer</option>
		<option value="media_twitter">Twitter media upload</option>
  */
	$('[menu=nodes]').mousemove(function () {
		$(this).find('i').addClass('menu-nodes-hover');
	});
	$('[menu=nodes]').mouseleave(function () {
		$(this).find('i').removeClass('menu-nodes-hover');
	});
	$('[menu=nodes]').on('click', function (evn) {
		const menus = document.getElementsByClassName('menus')[0];
		const computedStyle = window.getComputedStyle(menus, null);
		console.log(computedStyle['visibility'], computedStyle['display']);
		if (computedStyle.visibility === 'visible') {
			menus.style.visibility = 'hidden';
			clearTimeout(menuTimeOut);
			return;
		} else {
			$('.menus').empty();
			const nodesMenu = [
				{
					'title': 'Services',
					'description': 'This is a trigger node to schedule your jobs',
					'options': {
						'service': 'Creates an scheduled job and you can select the date and time to run it.'
					}
				},
				{
					'title': 'Data',
					'description': 'This nodes are used to fetch or post data to any source',
					'options': {
						'custom': 'Select an empty request',
						'StarWars': 'load the predefined StarWars'
					}
				},
				{
					'title': 'Process and Analysis',
					'description': 'Choose how to process the Data, this allows you to extract and transform the values as you need to get the desired insights',
					'options': {
						'comparision': 'Compare values or determine if a value contains another one',
						'HTML': 'Web scrapping, extract values from HTML plain text',
						'JSON': 'Extracts values from the Data and store them with a custom key',
						'media_player': 'Visualizes the Data in formats image/png, jpg, gif',
					}
				},
				{
					'title': 'Content creation',
					'description': 'Create customizable messages using the Data (before or After processing, depends on how you connect the nodes)',
					'options': {
						'new_message': 'empty message',
						'download_gif': 'download a gif from an input "url"',
						'giphy': 'fetch data from giphy about an specific query'
					}
				},
				{
					'title': 'Social Media Channels',
					'description': 'Choose where to share your Content',
					'options': {
						'contacts_list': 'A distribution list to send the Content',
						'whatsapp_text': 'Send text messages to a selected contacts list',
						'whatsapp_text_gif': 'Send gif and text message to a selected contacts list',
						'whatsapp_gif': 'Send gif media to a selected contacts list',
						'twitter_text': 'Send text update to Twitter',
						'twitter_gif': '(cluster) Upload and post a media file to Twitter ',
						'twitter_text_gif': '(cluster) Upload and post a media file and a customized message to Twitter',
					}
				}
			]
			createNodesMenu(evn.pageX, nodesMenu);
		}
  });
  $('[menu=board]').mousemove(function () {
	$(this).find('i').addClass('menu-board-hover');
  });
  $('[menu=board]').mouseleave(function () {
	$(this).find('i').removeClass('menu-board-hover');
  });
	$('[menu=board]').on('click', function (evn) {
		const menus = document.getElementsByClassName('menus')[0];
		const computedStyle = window.getComputedStyle(menus, null);
		console.log(computedStyle['visibility'], computedStyle['display']);
		if (computedStyle.visibility === 'visible') {
			menus.style.visibility = 'hidden';
			clearTimeout(menuTimeOut);
			return;
		} else {
			$('.menus').empty();
			const items = [];
			items.push(['import file', importBoard]);
			items.push(['export file', exportBoard]);
			createMenu(evn.pageX, items);
		}
	});
  $('[menu=users]').mousemove(function () {
	$(this).find('i').addClass('menu-users-hover');
  });
  $('[menu=users]').mouseleave(function () {
	$(this).find('i').removeClass('menu-users-hover');
  });
  $('[menu=users]').on('click', function () {
	  $('.add_user').css('display', 'block');
	  $('[close="true"]').on('click', function () {
		$('.add_user').css('display', 'none');
	  });
	  $('[add="true"]').on('click', function () {
		  if ($('[name="new_user"]').val()) {
			  console.log($('[name="new_user"]').val());
			  fetch (`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/users`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': localStorage.getItem('token')
					},
					body: JSON.stringify({
						email: $('[name="new_user"]').val(),
						board: $('.container').attr('board_id')
					})
				} 
				).then(res => res.json())
				.then(json => {
				console.log(json);
				$('.add_user').css('display', 'none');
				})
		  }
			
	  });
	console.log('Add user to this board');
  });
  $('[menu=whatsapp_register]').mousemove(function () {
	$(this).find('i').addClass('menu-whatsapp-hover');
  });
  $('[menu=whatsapp_register]').mouseleave(function () {
	$(this).find('i').removeClass('menu-whatsapp-hover');
  });
  $('[menu=whatsapp_register]').on('click', function () {
	const root = document.getElementById('root');
	DOMManager.render(
		WhatsAppRegister,
		root
	)
  });
}
function createNodesMenu (position, menus) {
	const menu = $('.menus');
	const color = $(menu).css('background-color');
	menu.css('visibility', 'visible');
	menu.css('left', position - 40);
	menu.css('padding-top', '40px');
	// menu.css('background-color', 'white');
	const nodeDesc = $('<div class="node_desc"></div>');
	$(menu).append($(nodeDesc));
	const opt = $(`<h2 import="true" desc="import from other boards">import_from_board</h2>`);
	$(opt).css('cursor', 'pointer');
	$(opt).css('margin-left', '20px');
	$(opt).css('font-size', '16px');
	$(opt).css('border', '1px solid black');
	$(opt).css('border-radius', '12px');
	$(opt).css('width', '200px');
	$(opt).css('padding', '4px 16px');
	$(opt).css('text-align', 'center');
	$(opt).css('background-color', 'white');
	$(opt).css('color', 'grey');
	$(opt).on('mousemove', function (evn) {
		$(opt).css('background-color', 'grey');
		$(opt).css('color', 'white');
	});
	$(opt).on('mouseleave', function () {
		$(this).css('background-color', 'white');
		$(this).css('color', 'grey');
	});
	$(opt).on('click', function (evn) {
		menu.css('visibility', 'hidden');
		importNode();
	});
	$(menu).append($(opt));
	for (const men of menus) {
	  let menuString = '';
	  // console.log(item);
	  menuString += `<div class="category"><div class="nodes_info"><h3>${men.title}</h3><h1>${men.description}</h1></div>`;
	  const category = $(menuString);
	  const options = $('<div class="options_container"></div>');
	  for (option in men.options) {
		  const opt = $(`<h2 desc="${men.options[option]}">${option}</h2>`);
		  $(opt).on('click', function (evn) {
			const type = $(this).text();
			newNode(type);
		  });
		  $(opt).on('mousemove', function (evn) {
			const desc = $(this).attr('desc');
			$('.node_desc').css('display', 'block');
			$('.node_desc').text(`${$(this).text()}: ${desc}`);
			$('.node_desc').css('top', $(this).position().top - $('.node_desc').outerHeight() - 10 + $(menu).scrollTop());
		  });
		  $(opt).on('mouseleave', function (evn) {
			const desc = $(this).attr('desc');
			$('.node_desc').css('display', 'none');
		  });
		  $(options).append($(opt));
	  }
	  $(category).append($(options));
	  $(menu).append($(category));
	}
	let menuTimeOut;
	$(menu).mousemove(function () {
		clearTimeout(menuTimeOut);
	});
	$(menu).mouseleave(function (evn) {
		menuTimeOut = setTimeout(function () {
			evn.target.style.visibility = 'hidden';
		}, 3000);
	//   $(this).css('visibility', 'hidden');
	//   menu.css('background-color', color);
	//   menu.css('padding-top', '0');
	});
  }
  function createNewNode(type) {
	console.log(type);
  }