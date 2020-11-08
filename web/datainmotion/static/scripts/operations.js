let stoped = false;
let processMessages;


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
				showConsole(data.instance);
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