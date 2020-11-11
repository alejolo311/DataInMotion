function getDate() {
	const time = new Date(Date.now());
	const year = time.getFullYear();
	const month = time.getMonth();
	const day = time.getDate();
	const hour = time.getHours();
	const minute = time.getMinutes();
	const second = time.getSeconds();
	const mill = time.getMilliseconds();
	return [year, month, day, hour, minute, second, mill];
}

async function timeSleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

class Board extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/Board.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'board');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'board') {
				link.remove();
			}
		}
		document.head.appendChild(link);
		this.board = {};
	}
	render () {
		return (
			`
				<div class="boardGrabber"></div>
				<div class="menus">
				</div>
				<div class="add_user">
					<div cont="add">
						<label for="new_user">Add editors for this board</label>
						<input name="new_user" id="new_user" placeholder="Enter an email address...">
						<div cont="buttons">
							<button close="true">close</button>
							<br>
							<button add="true">add</button>
						</div>
					</div>
				</div>
				<div id="root"></div>
				<div class="boardTools">
					<ul>
						<li>
							<h2 menu="board"><i class="menu-board" title="Board"></i> Board</h2>
						</li>
						<li>
							<h2 menu="nodes"><i class="menu-nodes" title="New Node"></i> New Node</h2>
						</li>
						<li>
							<h2 menu="users"><i class="menu-users" title="Add new user"></i> Add new User</h2>
						</li>
						<li>
							<h2 menu="whatsapp_register"><i class="fas menu-whatsapp fa-lg" title="WhatsApp Manager"></i>WhatsApp Manager</h2>
						</li>
					</ul>
					<h3 class="trash_can"><i title="Trash a node"></i>Trash can</h3>
				</div>
				<div class="new_node_cont" style="visibility: hidden; position: absolute;">
					<h2 class="close_node"></h2>
					<div id="node_editor">
						<ul class="progress_bar">
							<li>
								data
							</li>
						</ul>
						<h1 class="title">Title</h1>
						<p class="description"></p>
						<div id="cont">
						</div>
					</div>
					<div class="node_nav">
						<button class="back">back</button>
						<button class="next">next</button>
					</div>
				</div>
				<div class="interface">
					<div class="container">
					</div>
					<canvas class="canvas" id="canvas_connections">
					</canvas>
					<canvas class="grid_canvas" id="canvas_grid">
					</canvas>
					<div class="landing_zone">
						<h2>Landing Zone</h2>
					</div>
				</div>
			`
		);
	}
	setMenu () {
		const comp = this;
		const menuComponent = DOMManager.render(
			Menu,
			document.getElementsByClassName('menus')[0]
		);
		comp.menu = menuComponent;
		document.getElementsByClassName('menus')[0].style.visibility = 'hidden';
		const menuNodes = this._root.querySelector('[menu="nodes"]');
		menuNodes.addEventListener('click', function (evn) {
			const menus = document.getElementsByClassName('menus')[0];
			menus.style.height = comp._root.clientHeight - 94;
			// menus.style.maxHeight = comp._root.getBoundingClientRect().height;
			// menus.style.bottom = comp._root.getBoundingClientRect().bottom;
			menus.style.top = 0;
			menus.style.left = 0;
			const computedStyle = window.getComputedStyle(menus, null);
			console.log(computedStyle['visibility'], computedStyle['display']);
			if (computedStyle.visibility === 'visible') {
				menus.style.visibility = 'hidden';
				clearTimeout(menuTimeOut);
				return;
			} else {
				$('.menus').empty();
				menuComponent.createNodesMenu(
					comp._root.getBoundingClientRect().left + 40, nodesMenu);
			}
		});
		const menuBoard = this._root.querySelector('[menu="board"]');
		menuBoard.addEventListener('click', function (evn) {
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
				items.push(['import file', function () {
					menuComponent.hidde();
					menuComponent.importBoard();
				}]);
				items.push(['export file', function () {
					menuComponent.hidde();
					menuComponent.exportBoard();
				}]);
				menuComponent.createMenu(evn.pageX, items);
			}
		});
		const menuUsers = this._root.querySelector('[menu="users"]');
		menuUsers.addEventListener('click', function () {
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
					});
				}
			});
			console.log('Add user to this board');
		});
		const menuWhatsaap = this._root.querySelector('[menu="whatsapp_register"]');
		menuWhatsaap.addEventListener('click', function () {
			const root = document.getElementById('root');
			DOMManager.render(
				WhatsAppRegister,
				root
			)
		});
	}
	onMounted () {
		const comp = this;
		// Import Menu
		if (window['Menu']) {
			console.log('Script Already loaded');
			comp.setMenu();
		} else {
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.onload = function () {
				window['Menu'] = Menu;
				comp.setMenu();
			};
			script.src = `/static/scripts/Menu.js?${uuid()}`;
			document.head.appendChild(script);
		}
		// Set Tools menu
		// Load ConnectionsManager Class
		if (window['ConnectionsManager']) {
			console.log('Script Already loaded');
		} else {
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.onload = function () {
				window['ConnectionsManager'] = ConnectionsManager;
			};
			script.src = `/static/scripts/ConnectionsManager.js?${uuid()}`;
			document.head.appendChild(script);
		}
		// console.log(this._props);
		comp.saving = false;
		// console.log('Getting boardView');
		const boardId = comp._root.getAttribute('board_id');
		// Detect when the input to change the name is pressed
		$('.board_name').on('click', function (evn) {
			console.log('chage board name');
			$(this).css('display', 'none');
			$('[name=board_name]').css('display', 'block');
			$('[name=board_name]').css('background-color', 'white');
			// strip the boardname
			$('[name=board_name]').val($(this).text().replace(/^\s+|\s+$/g, ''));
		});
		$('[name=board_name]').focusout(function (evn) {
			// console.log($(this).val());
			if (comp.saving === false) {
				$(this).css('display', 'none');
				$('.board_name').css('display', 'block');
				$('.board_name').text($(this).val());
				comp.saving = true;
				comp.saveBoardName($(this).val());
			}
		});
		$('[name=board_name]').on('keydown', function (evn) {
			console.log(evn.key);
			if (evn.key === 'Enter') {
				if (comp.saving === false) {
					$(this).css('display', 'none');
					$('.board_name').css('display', 'block');
					$('.board_name').text($(this).val());
					comp.saving = true;
					comp.saveBoardName($(this).val());
				}
			}
		});
		const now = new Date(Date.now());
		const syncData = [
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds(),
		];
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/nodes?sync_date="${syncData.join(' ')}"`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		).then(function (res) {
			// console.log(res);
			if (res.status === 200) {
				return res.json();
			} else {
				localStorage.openboard = $('.container').attr('board_id');
				window.location.replace('/login');
			}
		}).then(function (json) {
			comp.drawNodes(json);
		});
	}
	drawNodes(nodes) {
		const comp = this;
		fetch(`${global.prot}://${global.domain}/boards/nodes`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(nodes)
			}
		).then(function (res) {
			return res.json();
		}).then(function (nodes) {
			// console.log(nodes);
			unbindContainer();
			const canvas = document.getElementById('canvas_connections');
			comp.connectionsManager = new ConnectionsManager(canvas);
			$('.container').empty();
			$('.container').append($(nodes.nodes));
			comp.popup();
			comp.setGrabbers();
			comp.loadPositions();
			comp.setNodeSettings();
			comp.setOpsListeners();
			comp.connectionsManager.board = comp;
			comp.connectionsManager.setConnectionsListeners();
			// setMediaPlayerListeners();
			// $('.container').css('width', comp._root.innerWidth);
			// $('.container').css('height', comp._root.scrollHeight);
			const height = Math.round(comp._root.querySelector('.container').scrollHeight);
			comp.height = height;
			comp.width = Math.round(comp._root.querySelector('.container').clientWidth);
			const width = comp.width;
			// console.log(width, height);
			$('#canvas_connections').attr('width', width);
			$('#canvas_connections').attr('height', height);
			$('#canvas_connections').css('width', width);
			$('#canvas_connections').css('height', height);
			$('#canvas_grid').attr('width', width);
			$('#canvas_grid').attr('height', height);
			$('#canvas_grid').css('width', width);
			$('#canvas_grid').css('height', height);
			// $('.container').css('width', width);
			// $('.container').css('height', height);
			comp.drawGrid();
			$('[action=user]').on('click', function () {
				goBack();
			});
			const nods = $('[cont_node_id]');
			// console.log($(nods).length);
			if (nods.length === 1) {
				console.log('Render Helper');
				console.log($($(nods)[0]).position().left, $($(nods)[0]).position().top);
			}
		});
	}
	popup () {
		// Display the color picker
		$('.colors button').on('click', function (evn) {
			const nodeId = $(this).attr('tag_id');
			const color = $(this).attr('color');
			// console.log(nodeId, color);
			$('[node_id="' + nodeId + '"]').attr('tag_color', color);
			$('[node_id="' + nodeId + '"]').css('border-color', color);
			$('[node_id="' + nodeId + '"]').find('.tag_color').css('background-color', color);
		});
		$('.node_container').mousemove(function (evn) {
			$(this).find('.grabber').css('visibility', 'visible');
		});
		$('.node_container').mouseout(function (evn) {
			$(this).find('.grabber').css('visibility', 'hidden');
		});
		$('.tag_color').on('click', function (evn) {
			const id = $(this).attr('id');
			console.log('tag color', id);
			$('[node_id="' + id + '"] .colors').css('display', 'grid');
		});
		$('.colors h2').on('click', function () {
			const id = $(this).attr('n_id');
			console.log('save', id);
			const node = $('[node_id="' + id + '"]');
			console.log('color: ', node.attr('tag_color'));
			node.find('.colors').css('display', 'none');
			$.ajax({
				type: 'POST',
				url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${id}/savecolor`,
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({
					'color': node.attr('tag_color')
				}),
				success: function (data) {
					console.log(data);
				}
			});
	
		});
	}
	setGrabbers() {
		// Track the mouse to change the nodes positions
		// and also detect the trash can actions
		let nodeName = '';
		let nodeId = '';
		const comp = this;
		const canvas = document.getElementById('canvas_connections');
		const rect = canvas.getBoundingClientRect()
		const trashCan = $('.trash_can');
		const computed = window.getComputedStyle($(trashCan).get(0), null);
		const color = computed.backgroundColor;
		const tX = $(trashCan).position().left;
		const tY = $(trashCan).get(0).getBoundingClientRect().top - rect.top;
		comp._root.addEventListener('mousemove', function (evn) {
			let offX = rect.width;
			if (nodeName !== '') {
				const width = $('[cont_node_id="' + nodeId + '"]').width();
				const inter = comp._root.querySelector('.interface');
				// console.log(inter, inter.scrollTop);
				let y = evn.clientY - rect.top - 15 + inter.scrollTop;
				let x = evn.clientX - rect.left + inter.scrollLeft;
				// console.log(x);
				// let bar_height = Number($('.top_bar').css('height').slice(0, -2));
				// console.log(tX, tY);
				$('.trash_can').css('color', 'black');
				$('.trash_can').css('background-color', color);
				if ((x > tX) ||  (y - inter.scrollTop) < tY) {
					$('[cont_node_id="' + nodeId + '"]').css('top', (y).toString());
				}
				if ((x > tX) &&  (y - inter.scrollTop) > tY) {
					$('.trash_can').css('background-color', 'purple');
					$('.trash_can').css('color', 'white');
				}
				if (nodeId !== '') {
					comp.board.nodes[nodeId] = {'x': x - (width + 15), 'y': y};
				}
				//const width = $('[cont_node_id="' + nodeId + '"]').outerWidth();
				$('[cont_node_id="' + nodeId + '"]').css('left', (x - (width + 15)).toString());
				$('[cont_node_id="' + nodeId + '"]').find('.grabber').css('visibility', 'visible');
				comp.drawConnections();
			}
		});
		$('.node_container').mousemove(function (evn) {
			if (nodeName === '') {
				$(this).css('z-index', '10');
			}
		});
		$('.node_container').mouseleave(function (evn) {
			if (nodeName === '') {
				$(this).css('z-index', '2');
			}
		});
		$('.grabber').on('mousedown', function (evn) {
			$('.selected').text('Selected Node: ' + $(this).attr('parent'));
				nodeId = $(this).attr('parent');
				nodeName = $('[cont_node_id="' + nodeId + '"]').attr('name');
				$(this).css('z-index', '10');
				const color = $('[cont_node_id="' + nodeId + '"]').attr('tag_color');
				$('[cont_node_id="' + nodeId + '"]').css('z-index', '100');
				$('[cont_node_id="' + nodeId + '"]').css('box-shadow', '0px 0px 40px #73466a');
		});
		$('.grabber').mouseup( function() {
			const y = $(this).parent().position().top;
			let del = false;
			const inter = comp._root.querySelector('.interface');
			if ((y - inter.scrollTop) > tY) {
				del = confirm("You are about to delete this node?\nThis can't be undone\nContinue");
			}
			if (del) {
				console.log('Deleting Node');
				deleteNode(nodeId);
			} else {
				if ((y - inter.scrollTop) > tY) {
					$(this).parent().css('top', y - 140);
					comp.board.nodes[nodeId].y = y - 140;
				}
				comp.autosave(null);
			}
			$(this).css('z-index', '2');
			$('[cont_node_id="' + nodeId + '"]').css('z-index', '1');
			$('[cont_node_id="' + nodeId + '"]').css('box-shadow', 'none');
			nodeName = '';
			nodeId = '';
			$('.selected').text('Selected Node: ');
			comp.drawConnections();
		});
	}
	autosave () {
		const comp = this;
		const boardId = this._root.getAttribute('board_id');
		$.ajax({
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}`,
			data: JSON.stringify(comp.board),
			success: function (resp) {
				console.log(resp);
			},
			error: function (error) {
				console.log(error);
			}
		});
	}
	loadPositions () {
		const boardId = this._root.getAttribute('board_id');
		const comp = this;
		const canvas = document.getElementById('canvas_connections');
		const rect = canvas.getBoundingClientRect();
		$.ajax({
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}`,
			dataType: 'json',
			contentType: 'application/json',
			success: function (resp) {
				comp.board = resp;
				for (const key in resp.nodes) {
					$('[node_id="' + key + '"]').css('top', resp.nodes[key].y);
					$('[node_id="' + key + '"]').css('left', resp.nodes[key].x);
				}
				board = resp;
				comp.drawConnections();
			}
		});
	}
	importConnectionsManager () {

	}
	drawConnections () {
		const comp = this;
		const canvas = document.getElementById('canvas_connections');
		// Draw outnodes conections
		// extract width and height from body, and apply them to the connections canvas
		const width = this.width;
		const height = this.height;
		const contx = canvas.getContext('2d');
		contx.clearRect(0, 0, width, height);
		// Check the outnodes and link them to the respective connection
		for (const child of $('[out_id]').toArray()) {
			if ($(child).attr('out_id') !== undefined) {
				const peer = $(child).attr('out_id');
				const parent = $($(child).parent().parent()).get(0);
				const computed = window.getComputedStyle(parent, null);
				const posX = parent.offsetLeft + 22;
				const posY = parent.offsetTop + 36;
				const a = { x: posX, y: posY + 4 };
				const p = $('.connections').find('h2[con_id="' + peer + '"]');
				try {
					const peerP = $($(p).parent().parent()).get(0);
					const b = { x: peerP.offsetLeft + 22, y: peerP.offsetTop };
					comp.connectionsManager.drawLine(a, b, $(child).parent().parent().attr('tag_color'));
				} catch (error) {
						console.log(error);
				}
			}
		}
		// Check the innodes and link them to the respective connection
		for (const child of $('.innodes h2').toArray()) {
			if ($(child).attr('in_id') !== undefined) {
				const peer = $(child).attr('in_id');
				const offset = $(child).offset();
				const parent = $($(child).parent().parent()).get(0);
				const a = { x: parent.offsetLeft, y: parent.offsetTop + 18};
				const p = $('.connections').find('h2[con_id="' + peer + '"]').toArray();
				const peerP = $($(p).parent().parent()).get(0);
				const b = { x: peerP.offsetLeft + 22, y: peerP.offsetTop };
				comp.connectionsManager.drawLine(a, b, $(child).parent().parent().attr('tag_color'));
			}
		}
	}
	drawGrid () {
		const width = this.width;
		const height = this.height;
		$('#canvas_grid').attr('width', width);
		$('#canvas_grid').attr('height', height);
		const canvas = document.getElementById('canvas_grid');
		const ctx = canvas.getContext('2d')
		const anchor = 10;
		ctx.beginPath();
		ctx.fillStyle = '#e6e6e620';
		for (let i = 0; i < width; i += anchor) {
			for (let j = 0; j < height; j += anchor) {
				ctx.moveTo(i, j);
				ctx.arc(i, j, 1, 0, 2*Math.PI);
			}
		}
		ctx.fill();
	}
	setNodeSettings () {
		// Detect when a node is pressed two times
		// and display the node form
		const comp = this;
		comp.node_id = '';
		$('.tag_name').off('click');
		$('.tag_name').on('click', function (evn) {
			if (comp.node_id === '') {
				comp.node_id = $(this).attr('p_id');
			} else if (comp.node_id === $(this).attr('p_id')) {
				console.log(evn.pageX);
				// console.log(evn.pageY);
				// window.location.replace(`${global.prot}://${global.domain}/node_editor?id=${node_id}`);
				comp.loadNode($(this).attr('p_id'), evn);
				comp.node_id = '';
			} else {
				comp.node_id = '';
			}
		});
	};
	loadNode (id, evn) {
		$.ajax({
			url:`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${id}`,
			success: function (n) {
				const node = n;
				if (node.work_type === 'sender') {
					WhatsAppFlow(node, evn);
				} else {
					$('.new_node_cont').css('display', 'block');
					const root = document.getElementById('node_editor');
					const editor = new NodeEditor(root, id);
					editor.setpos(evn);
					console.log(editor);
				}
			}
		});
	}
	setOpsListeners() {
		const comp = this;
		$('.trigger_button').on('click', async function (evn) {
			const nodeId = $(this).attr('n_id');
			console.log(nodeId);
			const onButton = new OnOffButton($(this).attr('state'), nodeId);
			onButton.saveState();
			if (document.querySelector('.hover_activate')) {
				document.querySelector('.hover_activate').remove();
			}
		});
		let showingTag = false;
		$('.trigger_button').mouseover(function (evn) {
			if (!showingTag) {
				showingTag = true;
				const hoverActivate = document.createElement('h1');
				hoverActivate.className = 'hover_activate';
				const rect = evn.target.getBoundingClientRect();
				hoverActivate.style.top = rect.top - 45 + document.body.scrollTop;
				hoverActivate.style.left = rect.left + document.body.scrollLeft;
				if ($(this).attr('state') === 'active') {
					const date = $(this).attr('next');
					hoverActivate.innerHTML = `<span style="color: rgb(11, 213, 169);">Active: </span>next run -> ${date.split(' ')[1]} ${date.split(' ')[0]}`;
				} else {
					hoverActivate.innerHTML = 'state:<span style="color: red;"> Off</span>';
				}
				document.body.appendChild(hoverActivate);
				$(this).mouseleave(function (evn) {
					showingTag = false;
					hoverActivate.remove();
				});
			}
		});
		$('.test_button').on('click', function (evn) {
			const nodeId = $(this).attr('n_id');
			// The next wil send a GET request to DataInMotion AP
			// to run the test and return the response
			setTimeout('', 3000);
			if (window['TestRunner']) {
				DOMManager.render(
					TestRunner,
					document.getElementsByClassName('loading')[0],
					{
						'nodeId': nodeId
					}
				);
			} else {
				let script = document.createElement('script');
				script.setAttribute('name', 'runner_script');
				script.type = 'text/javascript';
				script.onload = function() {
					window['TestRunner'] = TestRunner;
					DOMManager.render(
						TestRunner,
						document.getElementsByClassName('loading')[0],
						{
							'nodeId': nodeId,
							'boardId': comp._root.getAttribute('board_id')
						}
					);
				}
				script.src = `/static/scripts/TestRunner.js?${uuid()}`;
				document.head.appendChild(script);
			}
		});
	}
	saveBoardName (name) {
		const comp = this;
		const bId = comp._root.getAttribute('board_id');
		$.ajax({
			type: 'POST',
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${bId}/save_name`,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ name: name }),
			success: function (resp) {
				console.log(resp);
				comp.saving = false;
			}
		});
	}
}


class OnOffButton {
	constructor (state, nodeId) {
		this.state = state;
		this.nodeId = nodeId;
	}
	async saveState() {
		const nodeReq = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this.nodeId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
			}
		);
		const node = await nodeReq.json();
		if (this.state === 'off') {
			node.analisis_params['active'] = true;
		} else {
			node.analisis_params['active'] = false;
		}
		const nodeSaveReq = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this.nodeId}/save`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(node)
			}
		);
		const nodeSavedResponse = await nodeSaveReq.json();
		console.log(nodeSavedResponse);
		getBoardView();
	}
}