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
	onMounted () {
		console.log(this._props);
		const ul = this._root.querySelector('ul');
		console.log(ul);
		for (const board of this._props) {
			const li = document.createElement('li');
			li.classList.add("board_services");
			let bName;
			if (board.name) {
				bName = board.name;
			} else {
				bName = 'No name';
			}
			let renderedNodes = '';
			for (const node in board.nodes) {
				
				const n = board.nodes[node];
				console.log(n.analisis_params);
				console.log(typeof n.analisis_params);
				if (n.analisis_params.length === 0) {
					console.log('Empty');
					continue;
				} else {
					renderedNodes += `<li>
									<h3>${n.name}</h3>
									<h5>${n.analisis_params.date}</h5>
									<h4>Active: ${n.analisis_params.active}</h4>
								  </li>`;
				}
			}
			const stringHTML = `
				<h2>${bName}</h2>
				<ul>
				${renderedNodes}
				</ul>
			`;
			li.innerHTML = stringHTML;
			ul.appendChild(li);
			// console.log(board);
		}
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