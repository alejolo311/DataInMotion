class TestRunner extends Component {
	constructor() {
		super();
		this.stoped = false;
		this.processMessages = [];
	}
	render () {
		return (
			`
				<button stop="true">STOP</button>
				<div class="last_state">
					<div class="loading_gif"></div>
					<h1>Running node logic flow</h1>
				</div>
				<ul>
				</ul>
			`
		);
	}
	async onMounted () {
		const resp = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this._props.nodeId}/run`, {
			method: "GET",
			headers: {
				'Accept': 'application/json',
				'Authorization': localStorage.getItem('token')
			},
		});
		let json = await resp.json();
		this.running_test(json.instance);
	}
	async running_test (instanceId) {
		window.scrollTo(0, 0);
		this.stoped = false;
		$('[stop="true"]').on('click', async function () {
			this.stoped = true;
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
		while (!this.stoped) {
			await sleep(6000);
			const resp = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/check_response?id=${instanceId}`, {
				method: "GET",
				headers: {
					'Accept': 'application/json',
				},
			});
			let json = await resp.json();
			console.log(json.status);
			console.log(json);
			if (!this.stoped) {
				$('.last_state h1').html(json.messages[json.messages.length - 1]);
			}
			$('.loading ul').empty();
			// Print the messages to the logger
			if (json.messages.length > 0) {
				this.processMessages = json.messages.slice(0, json.messages.length);
				const cons = document.getElementsByClassName('console')[0];
				if (cons) {
					cons.innerHTML = this.processMessages[0];
				}
			}
			for (const mess of json.messages.reverse()) {
				const li = $(`<li>${mess}</li>`);
				$('.loading ul').append($(li));
			}
			if (json.status === 'completed') {
				console.log('Test Completed');
				console.log(json.logger);
				$('.loading').css('display', 'none');
				localStorage.removeItem('running_id');
				localStorage.removeItem('running_test');
				this.renderLogger(json.logger)
				// showConsole(json.logger);
				break;
			} else if (json.status === 'error') {
				$('.loading').css('display', 'none');
				break;
			}else {
				continue;
			}
		}
	}
	renderLogger (logger) {
		const scripts = document.head.querySelectorAll('script');
		for (const script of scripts) {
			if (script.getAttribute('name') === 'tools') {
				script.remove();
			}
		}
		let script = document.createElement('script');
		script.setAttribute('name', 'tools');
		script.type = 'text/javascript';
		script.onload = function() {
			showConsole(logger);
		}
		script.src = `/static/scripts/tools.js?${uuid()}`;
		document.head.appendChild(script);
	}
}