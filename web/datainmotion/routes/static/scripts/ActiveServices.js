class ActiveService extends Component {
	constructor() {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/ActiveServices.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'active_services');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'active_services') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	async onMounted () {
		const comp = this;
		console.log(this._props);
		const ul = this._root.querySelector('ul');
		console.log(ul);
		for (const board of this._props) {
			let bName;
			if (board.name) {
				bName = board.name;
			} else {
				bName = 'No name';
			}
			const boardLi = document.createElement('li');
			boardLi.classList.add("board_services");
			const stringHTML = `
				<h2>${bName}</h2>
				<ul>
				</ul>
			`;
			boardLi.innerHTML = stringHTML;
			const boardUl = boardLi.querySelector('ul');
			// Render the service nodes
			for (const node in board.nodes) {
				const n = board.nodes[node];
				if (n.analisis_params.length === 0) {
					console.log('Empty');
					continue;
				}
				const nodeLi = document.createElement('li');
				console.log(n.analisis_params);
				console.log(typeof n.analisis_params);
				// Check the services's state
				let time;
				let active;
				if (n.analisis_params.next_run) {
					const hour = n.analisis_params.next_run.split(' ')[1];
					const year = n.analisis_params.next_run.split(' ')[0];
					time = `<span class="hour">${hour}</span> <span style="color: grey;">${year}</span>`;
				} else {
					const dt = n.analisis_params.date;
					if (dt[4] < 9) {
						dt[4] = `0${dt[4]}`
					}
					if (dt[5] < 9) {
						dt[5] = `0${dt[5]}`
					}
					const hour = `${dt[3]}:${dt[4]}:${dt[5]}`;
					const year = `${dt[0]}-${dt[1]}-${dt[2]}`;
					time = `
						<span class="hour">${hour}</span> <span style="color: grey;">${year}</span>
					`;
				}
				if (n.analisis_params.active) {
					active = `
						<h4 style="background-color: #2fb557;">Active</h4>
					`;
				} else {
					active = `
						<h4 style="background-color: #9c1635;">Off</h4>
					`;
				}
				// Define to render or not
				const renderedNode = `
								<h3>${n.name}</h3>
								<i></i>
								<h6>Next run</h6>
								<h5>${time}</h5>
								${active}`;
				boardUl.appendChild(nodeLi);
				nodeLi.innerHTML = renderedNode;
				// Active or Deactive service button
				const button = nodeLi.querySelector('h4');
				button.addEventListener('click', function func_() {
					button.removeEventListener('click', func_);
					comp.activeService(board.nodes[node]);
				})
				const timeEdit = nodeLi.querySelector('span');
				timeEdit.addEventListener('click', function func_() {
					timeEdit.removeEventListener('click', func_);
					comp.changeTime(board.nodes[node]);
				})
				// Define the run listener
				const run = nodeLi.querySelector('i');
				run.addEventListener('click', function () {
					console.log('run', n.id);
					comp.runTest(n.id, board.id);
				})
			}
			// Add listeners to all
			ul.appendChild(boardLi);
		}
	}
	runTest (nodeId, boardId) {
		const scripts = document.head.querySelectorAll('script');
		for (const script of scripts) {
			if (script.getAttribute('name') === 'runner_script') {
				script.remove();
			}
		}
		let script = document.createElement('script');
		script.setAttribute('name', 'runner_script');
		script.type = 'text/javascript';
		script.onload = function(some) {
			DOMManager.render(
				TestRunner,
				document.getElementsByClassName('loading')[0],
				{
					'nodeId': nodeId,
					'boardId': boardId
				}
			);
		}
		script.src = `/static/scripts/TestRunner.js?${uuid()}`;
		document.head.appendChild(script);
	}
	activeService (node) {
		const now = new Date(Date.now());
		// This sync_date needs to sum 1 to the
		// month to be used by python 
		const sync_date = [
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		]
		node.analisis_params.sync_date = sync_date;
		console.log(node.analisis_params.active);
		node.analisis_params.active = !(node.analisis_params.active);
		console.log(node.analisis_params.active);
		for (let i = 0; i < node.analisis_params.date.length; i++) {
			node.analisis_params.date[i] = Number(node.analisis_params.date[i]);
		}
		console.log(node);
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${node.id}/save`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(node)
			}
		).then(res => res.json)
		.then(json => {
			console.log(json);
			window.location.reload();
		})
	}
	changeTime (node) {
		// Add Calendar script to head
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = function() {
			console.log('Change time to ', node.name);
			const date = node.analisis_params.date;
			date[1] -= 1;
			const cal = new Calendar(date, node.id, document.body);
			if (Array.isArray(node.analisis_params)) {
				console.log('Change data to object');
				node.analisis_params = {};
			}
			cal.context = undefined;
			node = cal;
			cal.build(100, 100)
			.then(() => {
				cal._html.style.position = 'absolute';
				cal._html.style.zIndex = 40;
				cal.save = function() {
					this.__proto__.save.call(this);
					window.location.reload();
				}
			});
		}
		script.src = `/static/scripts/calendar.js?${uuid()}`;
		document.head.appendChild(script);
	}
	render() {
		return (
			`
			<h1>Active Services</h1>
			<ul list="active_services"></ul>
			`
		)
	}
}