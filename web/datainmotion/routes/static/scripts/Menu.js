class Menu extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/Menus.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'menu');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'menu') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	render () {
		return (
			`
				<ul></ul>
			`
		);
	}
	hidde () {
		// this._root.style.display = 'none';
		this._root.style.visibility = 'hidden';
	}
	createMenu (position, items) {
		const comp = this;
		const menu = $('.menus');
		menu.css('visibility', 'visible');
		menu.css('left', 0);
		menu.css('bottom', 56);
		for (const item of items) {
			let menuString = '';
			// console.log(item);
			menuString += '<li>' + item[0] + '</li>';
			const option = $(menuString);
			option.on('click', item[1]);
			menu.append(option);
		}
		menu.mousemove( function(evn) {
			clearTimeout(comp.menuTimeOut);
		})
		menu.mouseleave(function (evn) {
			comp.menuTimeOut = setTimeout(function () {
				evn.target.style.visibility = 'hidden';
			}, 3000);
		});
	}
	createNodesMenu (position, menus) {
		const comp = this;
		const menu = $('.menus');
		menu.css('visibility', 'visible');
		menu.css('padding-top', '40px');
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
			menuString += `<div class="category"><div class="nodes_info"><h3>${men.title}</h3><h1>${men.description}</h1></div>`;
			const category = $(menuString);
			const options = $('<div class="options_container"></div>');
			for (const option in men.options) {
				const opt = $(`<h2 desc="${men.options[option]}">${option}</h2>`);
				$(opt).on('click', function (evn) {
					const type = $(this).text();
					comp.hidde();
					comp.newNode(type);
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
		$(menu).mousemove(function () {
			clearTimeout(comp.menuTimeOut);
		});
		$(menu).mouseleave(function (evn) {
			comp.menuTimeOut = setTimeout(function () {
				evn.target.style.visibility = 'hidden';
			}, 3000);
		});
	}
	newNode (type) {
		const comp = this;
		console.log('Create a new node of type', type);
		const boardId = document.getElementById('board').getAttribute('board_id');
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
				comp._props.parent.loadWhatsappNode(resp);
				// WhatsAppFlow(resp, {'pageX': 140, 'pageY': 200});
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
	importBoard () {
		const comp = this;
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
			for (const node in importedBoard.nodes) {
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
				for (const li of childs) {
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
				comp.importTheNodeOnByOne(nodesList);
			});
			$(filePrompt).append($(list));
		});
		$(complete).on('click', function () {
			comp.importCompleteBoard(importedBoard);
		});
		$(close).on('click', function () {
			$(cont).remove();
		});
		$(filePrompt).append($(fileInput));
		$(filePrompt).append($(buttonInput));
		$(filePrompt).append($(close));
		$(cont).append($(filePrompt));
		// $('body').append($(cont));
		comp._root.parentNode.appendChild($(cont).get(0));
		$(cont).css('display', 'block');
	}
	exportBoard() {
		const comp = this;
		console.log('Export board from file');
		const cont = $('<div class="alert_cont" ></div>')
		const close = $('<h2 class="close"></h2>');
		const filePrompt = $('<div class="file_cont" style="width: auto;"></div>');
		const link = $('<a id="download_board" class="download_board">Download this board</a>');
		const exportObj = {data: board};
		const boardId = comp._root.parentNode.getAttribute('board_id');
		const boardName = $('.board_name').text().replace(/^\s+|\s+$/g, "");
		$(close).on('click', function () {
			$(cont).remove();
		});
		const now = new Date(Date.now());
		const sync_date = [
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		]
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/nodes?sync_date="${sync_date.join(' ')}"`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
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
			comp._root.parentNode.appendChild($(cont).get(0));
		});
	}
	importCompleteBoard (impBoard) {
		const boardId = this._root.parentNode.getAttribute('board_id');
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/complete_board`,
		  {
			method: 'POST', // or 'PUT'
			body: JSON.stringify(impBoard), // data can be `string` or {object}!
			headers:{
			  'Content-Type': 'application/json',
			  'Authorization': localStorage.getItem('token')
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
	importTheNodeOnByOne (node) {
		const boardId = this._root.parentNode.getAttribute('board_id');
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/add_node`,
		  {
			method: 'POST', // or 'PUT'
			body: JSON.stringify(node), // data can be `string` or {object}!
			headers:{
			  'Content-Type': 'application/json',
			  'Authorization': localStorage.getItem('token')
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
}

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
			'whatsapp_text': 'Send text messages to a selected contacts list'
			// 'whatsapp_text_gif': 'Send gif and text message to a selected contacts list',
			// 'whatsapp_gif': 'Send gif media to a selected contacts list',
			// 'twitter_text': 'Send text update to Twitter',
			// 'twitter_gif': '(cluster) Upload and post a media file to Twitter ',
			// 'twitter_text_gif': '(cluster) Upload and post a media file and a customized message to Twitter',
		}
	}
]