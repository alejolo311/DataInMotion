class LoggerManager extends Component {
	constructor() {
		super();

		const link = document.createElement('link');
		link.href = `/static/styles/Logger.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'logger');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'logger') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	async drawRunsList () {
		const now = new Date(Date.now());
		let url = new URL(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${this._props.boardId}/logs`);
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
		const logsList = await fetch(
			url,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		const result = await logsList.json();
		console.log(result);
		const test = {
			'1234': {},
			'2341': {},
			'3412': {},
		}
		const comp = this;
		const ul = document.createElement('ul');
		ul.classList.add('runs_list');
		for (const run of result.logs) {
			const li = document.createElement('li');
			const date = run.date.split('.')[0].split(' ');
			li.innerHTML = `
				<span style="color: purple;">${run.name}</span> |
				<span style="color: black;">State:</span>
				${run.state} |
				<span style="color: black;">Run time: </span>
				${date[1]} ${date[0]}`;
			li.addEventListener('click', function func_ () {
				li.removeEventListener('click', func_);
				comp.drawConsole(run.id);
			});
			ul.appendChild(li);
		}
		const cont = this._root.querySelector('.data_extractor');
		cont.innerHTML = '<h4>Last runned nodes</h4>';
		cont.appendChild(ul);
	}
	async drawConsole (logId, log) {
		let logger;
		if (logId) {
			const now = new Date(Date.now());
			let url = new URL(`${global.prot}://${global.domain}${global.apiPort}/api/v1/logs/${logId}`);
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
			const logsList = await fetch(
				url,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': localStorage.getItem('token')
					}
				}
			)
			const res = await logsList.json();
			console.log(res);
			logger = res.log.logger;
		} else {
			logger = log;
		}
		const cont = this._root.querySelector('.data_extractor');
		cont.innerHTML = '';
		this._tmpOut = logger;
		const ul = document.createElement('ul');
		for (const key in this._tmpOut) {
			const li = this.drawLoggerObject(this._tmpOut[key], key, undefined);
			ul.appendChild(li);
		}
		cont.appendChild(ul);
	}
	drawLoggerObject (obj, path, parent) {
		const colors = [
			'#6e6d7c',
			'#4786ff',
			'#00c89c',
			'#ff8359',
			'#fb3728',
			'#00FFB2',
			'#78d4f8'
		];
		const comp = this;
		const li = document.createElement('li');
		if (!parent) {
			console.log('first line');
		}
		const div = $('<div cont="true"></div>');
		const ul = $('<ul></ul>');
		const conte = $('<div node="true"></div>');
		const copy = $('<h3>copy</h3>');
		const opts = $('<h3>select</h3>');
		const optsCont = $('<div></div>');
		$(optsCont).addClass('logger_obj_options');
		const objKey = path.split('/')[path.split('/').length - 1];
		let link;
		if (typeof obj === typeof 'string' || typeof obj === typeof true || typeof obj === typeof 123) {
			link = $(`<h2>${objKey}: ${obj}</h2>`);
			$(copy).css('display', 'block');
			$(link).css('background-color', 'white');
			$(link).css('color', 'black');
			$(link).css('border', '1px solid black');
		} else {
			link = $(`<h2>${objKey}</h2>`);
			$(link).css('background-color', colors[path.split('/').length - 1]);
			$(copy).css('display', 'none');
		}
		ul.attr('state', 'hidden');
		link.on('click', function (evn) {
			if (ul.attr('state') === 'hidden') {
				ul.attr('state', 'displayed');
				if (Array.isArray(obj)) {
					for (let i = 0; i < obj.length; i++) {
						const node = comp.drawLoggerObject(obj[i], `${path}/${i}`, li);
						ul.append(node);
					}
					
				} else if (typeof obj === typeof {}) {
					for (const key in obj) {
						const node = comp.drawLoggerObject(obj[key], `${path}/${key}`, li);
						ul.append(node);
					}
				}
			} else {
				ul.empty();
				ul.attr('state', 'hidden');
			}
		});
		$(conte).mousemove(function () {
			$(optsCont).css('visibility', 'visible');
		});
		$(conte).mouseleave(function () {
			$(optsCont).css('visibility', 'hidden');
		});
		$(opts).click(function () {
			let pa = path;
			let newPath = pa.split('/').slice(1, pa.split('/').length).join('/');
			console.log(newPath);
			copyToClipboard(newPath);
		});
		$(copy).click(function () {
			// COPY TO CLIPBOARD
			copyToClipboard(obj);
			// console.log($(this).parent().parent().parent().attr('path'));
			// copyToClipboard($(this).parent().parent().parent().attr('path'));
		});
		div.attr('path', path);
		optsCont.append(opts);
		optsCont.append(copy);
		conte.append(link);
		conte.append(optsCont);
		div.append(conte);
		div.append(ul);
		li.append(div.get(0));
		return li;
	} 
	onMounted () {
		// Get all the runs
		// and draw a list to the data_extractor
		const comp = this;
		const closeBtn = this._root.querySelector('h1');
		closeBtn.addEventListener('click', function func_ () {
			closeBtn.removeEventListener('click', func_);
			comp.close();
		});
		if (this._props.log) {
			console.log(
				this._props.log
			);
			this.drawConsole(undefined, this._props.log);
		} else {
			this.drawRunsList();
		}
	}
	close () {
		this._root.innerHTML = '';
		this._root.style.display = 'none';
		this._root.style.visibility = 'hidden';
		const scripts = document.head.querySelectorAll('script');
		for (const script of scripts) {
			if (script.getAttribute('name') === 'logger_script') {
				script.remove();
			}
		}
	}
	render () {
		return (
			`
				<h1></h1>
				<div class="data_extractor"></div>
				
			`
		)
	}
}
