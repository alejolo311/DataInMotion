class YesNoDialog extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/YesNoDialog.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'yes_no_dialog');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'yes_no_dialog') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	close () {
		this._root.innerHTML = '';
		this._root.style.display = 'none';
	}
	onMounted () {
		const comp = this;
		const yesButton = this._root.querySelectorAll('.buttons button')[1];
		yesButton.addEventListener('click', function func_(evn) {
			evn.target.removeEventListener('click', func_);
			comp._props.context[comp._props.yesCallback]();
			comp.close();
		});

		const noButton = this._root.querySelectorAll('.buttons button')[0];
		noButton.addEventListener('click', function func_(evn) {
			evn.target.removeEventListener('click', func_);
			try {
				comp._props.context[comp._props.noCallback]();
			} catch (err) {
				console.log(err);
			}
			comp.close();
		});
		this._root.querySelector('h1').innerHTML = `${this._props.title}`;
		this._root.querySelector('p').innerHTML = `${this._props.message}`;
	}
	render () {
		return (
			`
				<div class="dialog_card">
					<h1></h1>
					<p></p>
					<div class="buttons">
						<button>No</button>
						<button>Yes</button>
					</div>
				</div>
			`
		);
	}
}