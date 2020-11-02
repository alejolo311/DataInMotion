let stoped = false;
let processMessages;
async function running_test(instanceId) {
	window.scrollTo(0, 0);
	stoped = false;
	$('[stop="true"]').on('click', async function () {
		stoped = true;
		$('.last_state h1').html('Stopping process ...');
		await stopProcess(instanceId);
		$('.loading').css('display', 'none');
	});
	localStorage.running_test = true;
	localStorage.running_id = instanceId;
	let verifying = false;
	let choosing_gif = false;
	$('.loading ul').empty();
	$('.html_viewer').empty();
	while (!stoped) {
		await timeSleep(2000);
		const resp = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/check_response?id=${instanceId}`, {
			method: "GET",
			headers: {
				'Accept': 'application/json',
			},
		});
		let json = await resp.json();
		// Display gif choose jus once
		if (json.status !== 'choose_gif') {
			choosing_gif = false;
		}
		console.log(json.status);
		// console.log(json.messages);
		// console.log(json.messages[json.messages.length - 1]);
		if (!stoped) {
			$('.last_state h1').html(json.messages[json.messages.length - 1]);
		}
		$('.loading ul').empty();
		// Print the messages to the logger
		if (json.messages.length > 0) {
			processMessages = json.messages.slice(0, json.messages.length);
			const console = document.getElementsByClassName('console')[0];
			console.innerHTML = processMessages[0];
		}
		for (mess of json.messages.reverse()) {
			const li = $(`<li>${mess}</li>`);
			$('.loading ul').append($(li));
		}
		if (json.status === 'completed') {
			console.log('Test Completed');
			$('.loading').css('display', 'none');
			localStorage.removeItem('running_id');
			localStorage.removeItem('running_test');
			showConsole(json.logger);
			break;
		} else if (json.status === 'verifying') {
			if (verifying === false) {
				const qrcode = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/web_whatsapp_verify?id=${instanceId}`, {
					method: "GET"
				});
				const res_qrcode = await qrcode.text();
				console.log(res_qrcode);
				const qr_div = $(res_qrcode);
				if (res_qrcode !== '' && res_qrcode !== 'Failed') {
					verifying = true;
				}
				$('.qr').css('display', 'block');
				$('.qr').append($(qr_div));
				$('.close_qr').on('click', function (evn) {
					$('.qr').css('display', 'none');
				});
			}
		} else if (json.status === 'choose_gif') {
			const len = json.messages.length - 1;
			if (!choosing_gif) {
				const gif_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/choose_gif?id=${instanceId}`);
				const gifs = await gif_fetch.text();
				$('.html_viewer').empty();
				$('.html_viewer').html(gifs);
				$('.html_viewer').css('display', 'block');
				choosing_gif = true;
			}
			// json.messages[len]
		} else if (json.status === 'error') {
			$('.loading').css('display', 'none');
			break;
		}else {
			$('.qr').empty();
			$('.qr').css('display', 'none');
			$('.html_viewer').empty();
			$('.html_viewer').css('display', 'none');
			continue;
		}
	}
}

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

function setOpsListeners() {
	$('.trigger_button').on('click', async function (evn) {
		const nodeId = $(this).attr('n_id');
		console.log(nodeId);
		const onButton = new OnOffButton($(this).attr('state'), nodeId);
		onButton.saveState();
		if (document.querySelector('.hover_activate')) {
			document.querySelector('.hover_activate').remove();
		}
		// // console.log(nodeId);
		// // console.log(getDate());
		// const cal = new Calendar(getDate(), nodeId, document.body);
		// await cal.build(evn.pageX, evn.pageY);
		// console.log(evn.pageX, evn.pageY);
	});
	let showingTag = false;
	$('.trigger_button').mouseover(function (evn) {
		if (!showingTag) {
			showingTag = true;
			// console.log('hover activation button');
			const hoverActivate = document.createElement('h1');
			hoverActivate.className = 'hover_activate';
			// console.log(evn.pageX, evn.pageY);
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
		$('.new_node_cont').css('display', 'none');
		$('.loading').css('display', 'block');

		$.ajax({
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${nodeId}/run`,
			crossDomain: true,
			contentType: 'application/json',
			dataType: 'json',
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			success: function (data) {
				console.log(data);
				running_test(data.instance);
			},
			error: function (error) {
				console.log(error);
				$('.loading').css('display', 'none');
			}
		});
		console.log(board);
	});
}
async function timeSleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}