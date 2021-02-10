class WhatsappNode extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/WhatsappNode.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'whatsapp_node');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'whatsapp_node') {
				link.remove();
			}
		}
		document.head.appendChild(link)
	}
	close () {
		const comp = this;
		comp._root.innerHTML = '';
		comp._root.style.display = 'none';
	}
	render () {
		return (
			`
				<div form="whatsapp_node">
					<h3 close="whatsapp"></h3>
					<h3 save="whatsapp">save</h3>
					<h1>WhatsApp Sender</h1>
					<h2 show="true">Select an option:</h2>
					<div select="contacts">
						<h2 style="display: none;" edit="true">keep editing</h2>
						<h2 create="true">create new list</h2>
						<h2 connect="true">connect to existing list</h2>
						<input type="file" id="csv" value="Upload CSV file" accept=".csv" style="display: none;">
						<input class="csv-upload" type="button" value="Upload CSV file...">
					</div>
					<div class="contacts_lists">
						<ul></ul>
					</div>
					<div contacts="true">
						<label style="color: #363636;" for="">Contact Name:</label>
						<input name="contact_name" type="text" placeholder="Contact Name">
						<label style="color: #363636;" for="">Phone Number:</label>
						<input name="contact_number" type="text" placeholder="Phone Number">
						<button>add Contact</button>
						<label style="color: #363636;" for="contacts">Contacts in:</label>
						<ul>
						</ul>
					</div>
				</div>
			`
		);
	}
	async onMounted () {
		const comp = this;
		const node = this._props.node;
		const col = '#00bfa5';
		let tmpGif = node.data.gif;
		const reloadContactsView = function () {
			const ul = $('[contacts="true"] ul');
			$(ul).empty();
			console.log(contact_list);
			for (const cont in contact_list) {
				console.log(contact_list[cont]);
				const li = $(`<li contact_name="${cont}">${cont}:${contact_list[cont]}</li>`);
				$(li).on('click', function () {
					const name = $('[name="contact_name"]');
					const number = $('[name="contact_number"]');
					const contact = contact_list[$(this).attr('contact_name')];
					name.val($(this).attr('contact_name'));
					number.val(contact);
					delete contact_list[name.val()];
					reloadContactsView();
				});
				$(ul).append($(li));
			}
		};
		// Show list
		const showList = function () {

			if (contacts_node !== undefined) {
				$('[contacts="true"] label[for="contacts"]').text(`Contacts in ${contacts_node.name}:`);	
			} else {
				$('[contacts="true"] label[for="contacts"]').text('New Contacts List');	
			}
			$('.contacts_lists').css('display', 'none');
			$('[contacts="true"]').css('display', 'block');
			$('[select="contacts"]').css('display', 'none');
			$('[show="true"]').text('List options');
			$('[show="true"]').addClass('list_opts');
			$('[show="true"]').on('click', function (evn) {
				$(this).removeClass('list_opts');
				$(this).text('Select an option:');
				$('[select="contacts"]').css('display', 'block');
				$('[contacts="true"]').css('display', 'none');
				$('[edit="true"]').css('display', 'block');
				$('[edit="true"]').on('click', function (evn) {
					showList();
				});
			});
			reloadContactsView();
		};
		// Show view an set close button
		let contact_list = {};
		let contacts_node;
		// Load contactList
		// if node is linked to a list
		if (node.innodes.length > 0) {
			contact_list = node.innodes;
			contacts_node = await comp.loadContactList(contact_list[0]);
			contact_list = contacts_node.data;
			console.log(contact_list);
			showList();
		}
		const loadCSV = function () {
			const files = this.files;
			const reader = new FileReader();
			reader.onload = function (evn) {
				let csv_list = evn.target.result;
				csv_list = csv_list.split('\n').slice(1, csv_list.length);
				for (const cont of csv_list) {
					const name = cont.split(',')[0];
					const phone = cont.split(',')[1];
					contact_list[name] = phone;
				}
				showList();
			};
			reader.readAsText(files[0]);
		}
		const loader = document.querySelector('[id="csv"]');
		loader.addEventListener('change', loadCSV);
		const csvButton = document.querySelector('.csv-upload');
		csvButton.addEventListener('click', function() {
			loader.click();
		});
		// Display the container
		const container = $('div[form="whatsapp_node"]');
		$('.wpp_cont').css('display', 'block');
		const xPos = (window.screen.width / 4);
		$(container).css('left', 0);
		$(container).css('top', 0);
		container.css('display', 'block');
		if (node.data.gif !== '') {
			$('[name="giphy"]').val(node.data.gif);
			$('[name="giphy"]').css('display', 'block');
			$('[select="gif"] h2').css('background-color', 'white');
			$('[select="gif"] h2').css('color', col);
		}
		// Close container
		$('[close="whatsapp"]').on('click', function (evn) {
			container.css('display', 'none');
			$('.wpp_cont').css('display', 'none');
			// unbindAll();
			// getBoardView();
		});
		// Detects changes in admin value
		$('[name="wpp_admin"]').val(node.data.admin);
		$('[name="wpp_admin"]').keypress(function (key) {
			console.log($(this).val());
			node.data.admin = $(this).val();
		});
		
		// Gif button listener show the search input
		$('[select="gif"] h2').on('click', function () {
			if ($('[name="giphy"]').css('display') === 'none') {
				$('[name="giphy"]').css('display', 'block');
				$(this).css('background-color', 'white');
				$(this).css('color', col);
			} else {
				$('[name="giphy"]').css('display', 'none');
				$('[name="giphy"]').val('');
				$(this).css('background-color', col);
				$(this).css('color', 'white');
				node.data.gif = '';
			}
		});
		// Input listener for Giphy search
		$('[name="giphy"]').keypress(function (key) {
			node.data.gif = $(this).val() + key.key;
			// console.log(key.key);
			console.log(node.data.gif);
		});
		// Click to create new list
		$('[create="true"]').on('click', function (evn) {
			contact_list = {};
			contacts_node = undefined;
			showList();
		});
		// Load contacts from other node
		$('[connect="true"]').on('click', async function (evn) {
			lists = await comp.loadContactsNodes();
			console.log(lists);
			$('.contacts_lists').css('display', 'block');
			const ul = $('.contacts_lists ul');
			$(ul).empty();
			console.log(lists);
			for (list of lists) {
				const li = $(`<li contacts_id="${list.id}">${list.name}: ${list}</li>`);
				$(li).on('click', function (evn) {
					console.log('click');
					for (lis of lists) {
						if (lis.id === $(this).attr('contacts_id')) {
							contact_list = lis.data;
							contacts_node = lis;
							showList();
						}
					}
				});
				$(ul).append($(li));
			}
		});
		// add a contact to the list
		$('[contacts="true"] button').on('click', function (evn) {
			const name = $('[name="contact_name"]');
			const number = $('[name="contact_number"]');
			if (name.val() !== '' && number.val() !== '') {
				console.log(name.val(), number.val());
				contact_list[name.val()] = number.val();
				name.val('');
				number.val('');
				reloadContactsView();
			} else {
				console.log('empty values');
			}
		});
		// Save Whatsapp Node
		$('[save="whatsapp"]').on('click', function (evn) {
			node.data.test = $('[id="twilio"]').is(':checked');
			node.data.admin = $('[name="wpp_admin"]').val();
			comp.saveWhatsappNode(node, contacts_node, contact_list)
		});
		console.log(node);
	}
	async saveWhatsappNode(node, contacts_node, contacts_list) {
		const comp = this;
		let contactsNode = contacts_node;
		// Detects existing contactsnode
		if (contactsNode!== undefined) {
			node.innodes = [contactsNode.id];
			contactsNode.data = contacts_list
			const c_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${contactsNode.id}/save`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(contactsNode)
			});
			const contacts_saved = await c_fetch.json();
			console.log('Whatsapp node saved');
		}
		else {
			// Creates a new contacts node
			console.log(comp);
			const boardId = comp._props.parent._root.getAttribute('board_id');
			const new_conts = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/create_node`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify({
					data: contacts_list,
					type: 'contacts_list'
				})
			});
			contactsNode= await new_conts.json();
			node.innodes = [contactsNode.id];
		}
		const r_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${node.id}/save`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': localStorage.getItem('token')
			},
			body: JSON.stringify(node)
		});
		const resp = await r_fetch.json();
		console.log(resp);
		$('.wpp_cont').css('display', 'none');
		console.log(node, contacts_node, contacts_list);
		// unbindAll();
		// getBoardView();
		if (resp.state && resp.state === 'unregistered') {
			const root = document.getElementById('root');
			DOMManager.render(
				WhatsAppRegister,
				root
			)
		}
		window.location.reload();
	}
	async loadContactList(nodeId) {
		const node_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${nodeId}`);
		const node = await node_fetch.json();
		return node;
	}
	async loadContactsNodes() {
		const comp = this;
		const boardId = comp._props.parent._root.getAttribute('board_id');
		const conts_lists_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}/contacts_list`);
		const conts_lists = await conts_lists_fetch.json();
		return conts_lists;
	}
}