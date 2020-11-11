/**
 * NodeEditor - This class render a flow to modify a node object
 * by comparing the type and mode it render the views dinamically
 */
class NodeEditor {
	/**
	 * constructor - defines the root and the close behavior
	 * @param {HTML node} root the container
	 * @param {String} nodeId 
	 */
	constructor(root, nodeId) {
		this.root = root;
		this.root.parentNode.style.visibility = 'visible';
		// const canvas = document.querySelector('#canvas_connections');
		// if (canvas) {
		// 	console.log(canvas.style.width, canvas.style.height);
		// 	this.root.parentNode.style.width = canvas.style.width;
		// 	this.root.parentNode.style.height = canvas.style.height;
		// }
		this.id = nodeId;
		this.getData();
		this.setClose();
		this.title = document.querySelector('.title');
		this.description = document.querySelector('.description');
		const link = document.createElement('link');
		link.href = `/static/styles/node_editor.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'editor');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'editor') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	/**
	 * setpos - defines where to draw the node editor
	 * @param {Object} evn the caller node used to get the position on the page
	 */
	setpos (evn) {
		this.root.style.height = document.getElementById('board').clientHeight - 200;
		evn.pageY = 0;
		this.root.style.top = evn.pageY;
		let computedRootWidth = window.getComputedStyle(this.root, null);
		computedRootWidth = Number(computedRootWidth.width.slice(0, computedRootWidth.width.length - 2));
		console.log(computedRootWidth / 2, window.screen.width / 2);
		const xPos = 0;
		console.log('Node Editor container position: ', xPos);
		this.root.style.left = xPos;
		const close = document.querySelector('.close_node');
		close.style.left = xPos + 2;
		close.style.top = 0;
	}
	/**
	 * setClose - define the close button behavior
	 */
	setClose () {
		const editor = this;
		const close = document.querySelector('.close_node');
		close.addEventListener('click', function _func() {
			close.removeEventListener('click', _func)
			editor.close();
		});
	}
	/**
	 * close - remove the view from the main DOM
	 */
	close () {
		console.log('close');
		if (this.calendar) {
			this.calendar.close();
		}
		const next = document.querySelector('.next');
		const back = document.querySelector('.node_nav .back');
		next.removeEventListener('click', this.goNext);
		back.removeEventListener('click', this.goBack);
		this.root.parentNode.style.display = 'none';
	}
	/**
	 * Get the data to display the stored configuration
	 */
	getData() {
		const url = `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this.id}`;
		fetch(url,
			{
				method: 'GET',
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(res => {
				if (res.status === 200) {
					return res.json()
				} else {
					console.log('Unauthorized');
				}
			})
			.then(json => {
				console.log(json);
				this.data = json;
				this.renderNodeName();
			});
	}
	/**
	 * renderNodeName - Draw the name input
	 */
	renderNodeName() {
		// Draw title and description
		this.title.innerHTML = 'Node name'
		this.description.innerHTML = 'Give your node the name that describes it the best!';
		const nameCont = document.createElement('div');
		// Draw the input element
		nameCont.innerHTML = `<label>Node name</label><input type="text" placeholder="Node name" value="${this.data.name}">`;
		const cont = document.getElementById('cont');
		cont.innerHTML = '';
		cont.appendChild(nameCont);
		// Define the navigation buttons
		const next = document.querySelector('.next');
		const back = document.querySelector('.node_nav .back');
		next.innerHTML = 'next';
		const editor = this;
		editor.goNext = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			editor.data.name = nameCont.querySelector('input').value;
			if (editor.data.type === 'service') {
				// editor.renderServiceOptions();
				editor.renderCalendar();
			} else {const back = document.querySelector('.node_nav .back');
				if (editor.data.work_type === 'request') {
					editor.renderUrl();
				} else if (editor.data.work_type === 'process') {
					editor.renderProcess();
				}
			}
		}
		editor.goBack = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			editor.close();
		}
		next.addEventListener('click', editor.goNext);
		back.addEventListener('click', editor.goBack);
	}
	renderServiceOptions () {

	}
	printFormatedDate (node, date) {
		const month = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		][date[1]];
		node.innerHTML = `${month} ${date[2]} ${date[0]}<br>${date[3]}:${date[4]}`;
	}
	/**
	 * renderCalendar - Draw the Date configuration component
	 */
	renderCalendar () {
		const editor = this;
		console.log(editor.data);
		const parser = new DOMParser();
		this.title.innerHTML = 'Trigger configuration';
		this.description.innerHTML = 'Select a start date and a frequency to setup the alert';
		const cont = document.getElementById('cont');
		cont.innerHTML = '';
		const selectDate = document.createElement('button');
		selectDate.className = 'select_date';
		selectDate.innerHTML = 'select date';
		const dateText = document.createElement('h1');
		dateText.style.textAlign = 'center';
		editor.triggerDateContainer = dateText;
		// Defines the date if the node has one
		if (editor.data.analisis_params['date']) {
			const date = editor.data.analisis_params['date'].map(e => Array.isArray(e) ? e.clone() : e);
			date[1] -= 1;
			editor.printFormatedDate(dateText, date);
		}
		// Set the click on the date selector to render the calendar
		selectDate.addEventListener('click', function (evn) {
			let date = editor.data.analisis_params.date;
			if (date) {
				if (date[1] > 0) {
					date[1] = date[1];
				} else {
					date[1] = 0;
				}
			} else {
				const d = new Date(Date.now());
				date = [
					d.getFullYear(),
					d.getMonth(),
					d.getDate(),
					d.getHours(),
					d.getMinutes(),
					d.getSeconds(),
					d.getMilliseconds()
				]
			}
			// Render Calendar component
			const cal = new Calendar(date, editor.data.id, document.body);
			console.log(typeof editor.data.analisis_params);
			console.log(editor.data.analisis_params);
			if (Array.isArray(editor.data.analisis_params)) {
				console.log('Change data to object');
				editor.data.analisis_params = {};
			}
			cal.context = editor;
			editor.calendar = cal;
			const rect = evn.target.getBoundingClientRect();
			cal.build(rect.left - 40 + document.body.scrollLeft, evn.pageY - 150)
			.then(() => {
				cal._html.style.position = 'absolute';
			});
		});
		// Draw the frequency configuration
		const triggerOptions = document.createElement('div');
		const actDiv = document.createElement('div');
		triggerOptions.appendChild(actDiv);
		triggerOptions.appendChild(dateText);
		triggerOptions.appendChild(selectDate);
		triggerOptions.appendChild(parser.parseFromString(`<label>FREQUENCY</label>`, 'text/html').body.firstChild);
		const options = [
			'hourly',
			'daily',
			'weekly',
			'monthly',
		]
		const select = document.createElement('select');
		for (const option of options) {
			const optDOM = document.createElement('option');
			optDOM.value = option;
			optDOM.innerHTML = option;
			select.appendChild(optDOM);
		}
		select.value = editor.data.analisis_params['frequency'];
		actDiv.classList = ['active_container'];
		const actStatus = document.createElement('h1');
		actStatus.innerHTML = '';
		const activeButton = document.createElement('div');
		const slide = document.createElement('h3');
		activeButton.appendChild(slide);
		actDiv.appendChild(actStatus);
		actDiv.appendChild(activeButton);
		activeButton.classList.add('activation_slide');
		/**
		 * drawActivationButton - helper to draw a toggle button
		 * for the active state manipulator
		 */
		function drawActivationButton () {
			if (editor.data.analisis_params['active']) {
				actStatus.innerHTML = 'Active';
				activeButton.classList.add('active');
				activeButton.classList.remove('off');
			} else {
				actStatus.innerHTML = 'Off';
				activeButton.classList.add('off');
				activeButton.classList.remove('active');
			}
			const style = getComputedStyle(slide);
			setTimeout(() => {
				actStatus.style.color = style['background-color'];	
			}, 600);
			
		}
		drawActivationButton();
		activeButton.addEventListener('click', function () {
			console.log(editor.data.analisis_params['active']);
			if (editor.data.analisis_params['active']) {
				editor.data.analisis_params['active'] = false;
			} else {
				editor.data.analisis_params['active'] = true;
			}
			console.log(editor.data.analisis_params['active']);
			drawActivationButton();
		});
		triggerOptions.appendChild(select);
		cont.innerHTML = '';
		cont.appendChild(triggerOptions);

		// Navigation Listeners
		const next = document.querySelector('.next');
		next.innerHTML = 'save';
		const back = document.querySelector('.node_nav .back');
		editor.goNext = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			console.log(editor.data);
			const now = new Date(Date.now());
			editor.data.analisis_params['sync_date'] = [
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				now.getHours(),
				now.getMinutes(),
				now.getSeconds(),
				now.getMilliseconds(),
			];
			editor.data.analisis_params['frequency'] = select.value;
			editor.save();
		}
		editor.goBack = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			console.log('going back');
			editor.renderNodeName();
		}
		next.addEventListener('click', editor.goNext);
		back.addEventListener('click', editor.goBack);

	}
	/**
	 * renderUrl - draw the tool to store the url, headers and query parameters into a node
	 */
	renderUrl () {
		const editor = this;
		// Draw the title and description
		this.title.innerHTML = 'Request Configuration'
		this.description.innerHTML = 'Use "GET" or "POST" at the begining followed by a space to specify the method to this request.';
		const urlCont = document.createElement('div');
		// Draw the URL input and set the change listener
		urlCont.innerHTML = `<label>URL</label><input type="text" placeholder="Ex. GET http://webpage.com" value="${this.data.api_url}">`;
		const urlInput = urlCont.querySelector('input');
		urlInput.addEventListener('change', function (evn) {
			editor.data.api_url = evn.target.value;
			console.log(editor.data.api_url);
		});
		const cont = document.getElementById('cont');
		cont.innerHTML = '';
		cont.appendChild(urlCont);
		// Draw the headers tool
		const headersCont = document.createElement('div');
		headersCont.className = 'head_cont';
		const hTitle = document.createElement('p');
		hTitle.innerHTML = 'HEADERS';
		cont.appendChild(hTitle);
		let focus = [0, 0];
		/**
		 * drawHeaders - helper to recreate and refresh the headers view
		 */
		function drawHeaders() {
			// Draw the tags
			let headsHTML = `<div class="fields"><h1>KEY</h1><h1>VALUE</h1></div>`;
			let count = 0;
			// Draw the inputs for each stored value
			for (const head in editor.data.headers) {
				// one row creation
				headsHTML += `<div name="row" index="${count}" class="row"><input type="text" placeholder="Key" value="${head}">`;
				headsHTML += `<input type="text" placeholder="Value" value='${editor.data.headers[head]}'></div>`;
				count++;
			}
			// Draw the last empty input
			// this one is used to create new values in the headers
			headsHTML += `<div class="row"><input name="new" type="text" placeholder="Key" value="">`;
			headsHTML += `<input type="text" placeholder="Value" value=""></div>`;
			headersCont.innerHTML = headsHTML;
			const allRows = document.querySelectorAll('[name="row"]');
			// Defines the listeners to keep track on value changes
			allRows.forEach(row => {
				const inputs = row.querySelectorAll('input');
				if (Number(row.getAttribute('index')) === focus[0]) {
						inputs[focus[1]].focus();
						inputs[focus[1]].selectionStart = inputs[focus[1]].selectionEnd = inputs[focus[1]].value.length;
				}
				// inputs makes references to both inputs in each row
				// inputs[0] checks for delete actions in order to mantain the object clean
				inputs[0].addEventListener('input', function _func(evn) {
					inputs[0].removeEventListener('input', _func);
					focus = [Number(row.getAttribute('index')), 0];
					const key = evn.target.value;
					let oldKey = key.slice(0, -1);
					if (evn.inputType === "deleteContentBackward") {
						for (const k in editor.data.headers) {
							if (k.slice(0, -1) === key) {
								oldKey = k;
							}
						}
					}
					const value = editor.data.headers[oldKey]
					editor.data.headers[key] = value;
					delete editor.data.headers[oldKey]
					drawHeaders();
				});
				inputs[1].addEventListener('change', function _func(evn) {
					console.log(evn.target.value);
					inputs[1].removeEventListener('change', _func);
					focus = [Number(row.getAttribute('index')), 1];
					const key = inputs[0].value.toString();
					editor.data.headers[key] = evn.target.value;
					drawHeaders();
				});
			});
			const lastRow = document.querySelector('[name="new"]');
			lastRow.addEventListener('input', function _funct(evn) {
				focus = [count, 0];
				lastRow.removeEventListener('change', _funct);
				editor.data.headers[evn.target.value] = '';
				evn.target.value = '';
				drawHeaders();
			});
		}
		cont.appendChild(headersCont);
		// Call to draw the stored headers
		drawHeaders();
		// Draw the query data
		const queryCont = document.createElement('div');
		queryCont.className = 'query_cont';
		const qTitle = document.createElement('p');
		qTitle.innerHTML = 'QUERY DATA';
		cont.appendChild(qTitle);
		let focus_q = [0, 0];
		/**
		 * drawQuery - render helper to refresh the query values
		 */
		function drawQuery() {
			let headsHTML = `<div class="fields"><h1>KEY</h1><h1>VALUE</h1></div>`;
			let count = 0;
			for (const q in editor.data.data) {
				// one row creation
				headsHTML += `<div name="row" index="${count}" class="row"><input type="text" placeholder="Key" value="${q}">`;
				headsHTML += `<input type="text" placeholder="Value" value='${editor.data.data[q]}'></div>`;
				count++;
			}
			headsHTML += `<div class="row"><input name="new_q" type="text" placeholder="Key" value="">`;
			headsHTML += `<input type="text" placeholder="Value" value=""></div>`;
			queryCont.innerHTML = headsHTML;
			const allRows = document.querySelectorAll('.query_cont [name="row"]');
			allRows.forEach(row => {
				const inputs = row.querySelectorAll('input');
				if (Number(row.getAttribute('index')) === focus[0]) {
						inputs[focus[1]].focus();
						inputs[focus[1]].selectionStart = inputs[focus[1]].selectionEnd = inputs[focus[1]].value.length;
				}
				inputs[0].addEventListener('input', function _func(evn) {
					inputs[0].removeEventListener('input', _func);
					focus_q = [Number(row.getAttribute('index')), 0];
					const key = evn.target.value;
					let oldKey = key.slice(0, -1);
					if (evn.inputType === "deleteContentBackward") {
						for (const k in editor.data.data) {
							if (k.slice(0, -1) === key) {
								oldKey = k;
							}
						}
					}
					const value = editor.data.data[oldKey]
					editor.data.data[key] = value;
					delete editor.data.data[oldKey];
					drawQuery();
				});
				inputs[1].addEventListener('change', function _func(evn) {
					// console.log(evn.target.value);
					inputs[1].removeEventListener('change', _func);
					focus = [Number(row.getAttribute('index')), 1];
					const key = inputs[0].value.toString();
					editor.data.data[key] = evn.target.value;
					drawQuery();
				});
			});
			const lastRow = document.querySelector('[name="new_q"]');
			lastRow.addEventListener('input', function _funct(evn) {
				focus_q = [count, 0];
				lastRow.removeEventListener('change', _funct);
				editor.data.data[evn.target.value] = '';
				evn.target.value = '';
				drawQuery();
			});
		}
		cont.appendChild(queryCont);
		// Draw the stored query parameters
		drawQuery();
		// Define back and next listeners
		const next = document.querySelector('.next');
		next.innerHTML = 'next';
		const back = document.querySelector('.node_nav .back');
		editor.goNext = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);

			console.log(editor.data);
			editor.renderProcess();
		}
		editor.goBack = function () {
			next.removeEventListener('click', goNext);
			back.removeEventListener('click', goBack);
			console.log('going back');
			editor.renderNodeName();
		}
		next.addEventListener('click', editor.goNext);
		back.addEventListener('click', editor.goBack);
	}
	/**
	 * renderProcess - Draw a process list and defines the listener
	 * to keep track of the mode change and call to getProcessView on each change
	 */
	renderProcess () {
		const editor = this;
		// draw a title and a description
		this.title.innerHTML = 'Process Configuration'
		this.description.innerHTML = 'Setup the "process mode" and check the "info" tag to get a "how to do" about the choosed mode';
		const selectMode = document.createElement('select');
		const modes = [
			"",
			"statistics",
			"comparision",
			"replace",
			"JSON",
			"HTML",
			// "get_updates",
			"media_player",
			"media_twitter",
			"contacts_list",
			"list_ops",
		]
		// creates an option for each mode
		// and append it to the select list
		for (const mode of modes) {
			const md = document.createElement('option');
			md.setAttribute('value', mode);
			md.innerHTML = mode;
			selectMode.appendChild(md);
		}
		const cont = document.getElementById('cont');
		cont.innerHTML = '';
		const label = document.createElement('label');
		label.innerHTML = 'Process mode';
		cont.appendChild(label);
		cont.appendChild(selectMode);
		selectMode.querySelector(`[value="${editor.data.analisis_mode}"]`).setAttribute("selected", "true");
		selectMode.addEventListener('change', function(evn) {
			console.log(evn.target.value);
			editor.data.analisis_mode = evn.target.value;
			editor.data.analisis_params = [{}];
			editor.getProcessView(editor.data.analisis_mode);
		});
		// Draw the view for the actual analisis_mode
		editor.getProcessView(editor.data.analisis_mode);
		// Define back and next listeners
		const next = document.querySelector('.next');
		const back = document.querySelector('.node_nav .back');
		next.innerHTML = 'save';
		editor.goNext = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			setTimeout(function () {
				console.log(editor.data);
			}, 100);
			editor.save();
		}
		editor.goBack = function () {
			next.removeEventListener('click', editor.goNext);
			back.removeEventListener('click', editor.goBack);
			console.log('going back');
			if (editor.data.work_type === 'process') {
				editor.renderNodeName();
			} else {
				editor.renderUrl();
			}
		}
		next.addEventListener('click', editor.goNext);
		back.addEventListener('click', editor.goBack);
	}
	/**
	 * getProcessView - Return a tool view containing the required fields
	 * depending on the mode
	 * @param {String} mode - the type of tool to return
	 */
	getProcessView(mode) {
		const editor = this;
		const cont = document.getElementById('cont');
		const select = cont.querySelector('select');
		const label = cont.querySelector('label');
		cont.innerHTML = '';
		if (mode !== 'replace') {
			editor.data.string = '';
		}
		cont.appendChild(label);
		cont.appendChild(select);
		const infoTag = document.createElement('h1');
		infoTag.innerHTML = 'INFO';
		infoTag.classList.add('info_tag');
		const infoContent = document.createElement('p')
		infoContent.innerHTML = info[mode];
		infoContent.classList.add('info_content');
		infoTag.addEventListener('click', function (evn) {
			const computed = window.getComputedStyle(infoContent, null);
			if (computed.display === 'block') {
				infoContent.style.display = 'none';
			} else {
				infoContent.style.display = 'block';
			}
			
		});
		cont.appendChild(infoTag);
		cont.appendChild(infoContent);
		console.log(select);
		const modes = {
			"statistics": function() {
				const cont = document.getElementById('cont');
				const samplesCont = document.createElement('div');
				samplesCont.className = 'samples_cont';
				const sTitle = document.createElement('p');
				sTitle.innerHTML = 'POPULATION';
				let samps = [];
				let pars = [];
				let focus = [0, 0];
				try {
					samps = Object.keys(editor.data.analisis_params[0]['samples']);
					pars = Object.keys(editor.data.analisis_params[0]['parameters']);
				} catch (err) {
					console.log(err);
				}
				function drawSamples() {
					console.log(focus, samps, pars);
					let sHTML = `<div class="fields"><h1>PARAMETERS</h1><h1>SAMPLES</h1></div>`;
					sHTML += `<div class="row"><div column="left"></div><div column="right"></div></div>`;
					samplesCont.innerHTML = sHTML;
					const rightColumn = document.querySelector('[column="right"]');
					let pos = 0;
					if ('samples' in editor.data.analisis_params[0]) {
						for (const samp of samps) {
							if (samp === '' || samp === undefined) {
								samps.splice(pos, 1);
								drawSamples();
								return;
							}
							const input = document.createElement('input');
							input.setAttribute('index', pos);
							input.value = samp;
							rightColumn.append(input);
							input.addEventListener('change', function(evn) {
								if (evn.target.value === '') {
									console.log('deleting');
									delete samps[evn.target.getAttribute('index')];
									const newSamps = []
									for (const sam of samps) {
										if (sam) {
											newSamps.push(sam);
										}
									}
									editor.data.analisis_params[0]['samples'] = newSamps;
									samps = newSamps;
								} else {
									samps[evn.target.getAttribute('index')] = evn.target.value;
								}
								drawSamples();
							});
							if (focus[0] === pos && focus[1] === 1) {
								input.focus();
								input.selectionStart = input.selectionEnd = input.value.length;
								console.log('focus');
							}
							pos++;
						}
					}
					const addSample = document.createElement('input');
					addSample.addEventListener('change', function _func(evn) {
						if (evn.target.value !== '') {
							addSample.removeEventListener('change', _func);
							const value = evn.target.value;
							samps.push(value);
							focus = [samps.length - 1, 1];
							const nSp = {};
							for (const sp of samps) {
								nSp[sp] = true;
							}
							editor.data.analisis_params[0]['samples'] = nSp;
							drawSamples();
						}
					});
					rightColumn.appendChild(addSample);
					pos = 0;
					const leftColumn = document.querySelector('[column="left"]');
					if ('parameters' in editor.data.analisis_params[0]) {
						for (const par of pars) {
							if (par === '' || par === undefined) {
								pars.splice(pos, 1);
								drawSamples();
								return;
							}
							const input = document.createElement('input');
							input.setAttribute('index', pos);
							input.value = par;
							leftColumn.append(input);
							input.addEventListener('change', function(evn) {
								if (evn.target.value === '') {
									delete pars[evn.target.getAttribute('index')];
									const newPars = []
									for (const par of pars) {
										if (par) {
											newPars.push(par);
										}
									}
									editor.data.analisis_params[0]['parameters'] = newPars;
									pars = newPars;
								}
								drawSamples();
							});
							if (focus[0] === pos && focus[1] === 0) {
								input.focus();
								input.selectionStart = input.selectionEnd = input.value.length;
							}
							pos++;
						}	
					}
					const addPar = document.createElement('input');
					addPar.addEventListener('change', function _func(evn) {
						if (evn.target.value !== '') {
							addPar.removeEventListener('change', _func);
							const value = evn.target.value;
							pars.push(value);
							focus = [pars.length - 1, 1];
							const nPr = {};
							for (const pr of pars) {
								nPr[pr] = true;
							}
							editor.data.analisis_params[0]['parameters'] = nPr;
							drawSamples();
						}
					});
					leftColumn.appendChild(addPar);
				}
				cont.appendChild(sTitle);
				cont.appendChild(samplesCont);
				drawSamples();
			},
			"comparision": function () {
				const cont = document.getElementById('cont');
				const conditionsCont = document.createElement('div');
				conditionsCont.className = 'samples_cont';
				const cTitle = document.createElement('p');
				cTitle.innerHTML = 'CONDITIONS';
				function drawComp() {
					let cHTML = `<div class="fields cond"><h1>VALUE 1</h1><h1>CONDITION</h1><h1>VALUE 2</h1></div>`;
					const options = [
						"==",
						"<",
						">",
						"in"
					];
					function rowString(cond) {
						let input = '';
						if (cond.input) {
							input = 'name="add"';
						}
						let html = `<div class="row cond" ${input}>`;
						html += `<input class="cond_input" value="${cond.key}">`;
						html += `<select class="cond_select">`;
						for (const opt of options) {
							let selected = '';
							if (opt === cond.cond) {
								selected = 'selected="true"'
							}
							html += `<option value="${opt}" ${selected}">"${opt}"</option>`;
						}
						html += `</select>`;
						html += `<input class="cond_input" value="${cond.comp}">`;
						html += `</div>`;
						return html;
					}
					if (editor.data.analisis_params[0] && 'cond' in editor.data.analisis_params[0]) {
						for (const cond of editor.data.analisis_params) {
							cHTML += rowString(cond);
							// cHTML += ` ${cond.cond} ${cond.key}`;
						}
					}
					cHTML += rowString({
						cond: "==",
						key: "",
						comp: "",
						input: true
					});
					conditionsCont.innerHTML = cHTML;
					const rows = document.querySelectorAll('.row');
					for (let i = 0; i < rows.length - 1; i++) {
						console.log(rows[i]);
						const inputs = rows[i].querySelectorAll('input');
						const select = rows[i].querySelector('select');
						console.log(inputs);
						inputs[0].addEventListener('change', function _func(evn) {
							inputs[0].removeEventListener('change', _func);
							if (evn.target.value === '') {
								// console.log('delete item');
								if (i === 0 && editor.data.analisis_params.length === 1) {
									editor.data.analisis_params[i] = {};
								} else {
									delete editor.data.analisis_params[i];
									const newPars = [];
									for (const par of editor.data.analisis_params) {
										if (par) {
											newPars.push(par);
										}
									}
									editor.data.analisis_params = newPars;
								}
								drawComp();
							} else {
								editor.data.analisis_params[i].key = evn.target.value;
							}
							inputs[0].addEventListener('change', _func);
						});
						inputs[1].addEventListener('change', function _func(evn) {
							inputs[1].removeEventListener('change', _func);
							editor.data.analisis_params[i].comp = evn.target.value;
							inputs[1].addEventListener('change', _func);
						});
						select.addEventListener('change', function _func(evn) {
							select.removeEventListener('change', _func);
							editor.data.analisis_params[i].cond = evn.target.value;
							select.addEventListener('change', _func);
						});
					}
					console.log(rows);
					const addRow = document.querySelector('[name="add"] input');
					addRow.addEventListener('change', function _func(evn) {
						addRow.removeEventListener('change', _func);
						if (editor.data.analisis_params.length >= 1 && 'key' in editor.data.analisis_params[0]) {
							editor.data.analisis_params.push({
								key: evn.target.value,
								cond: '==',
								comp: ''
							});
						} else {
							editor.data.analisis_params[0] = {
								key: evn.target.value,
								cond: '==',
								comp: ''
							};
						}
						drawComp();
					});
					console.log(addRow);
				}
				cont.appendChild(cTitle);
				cont.appendChild(conditionsCont);
				drawComp();
			},
			"replace": function () {
				const cont = document.getElementById('cont');
				const replaceCont = document.createElement('div');
				replaceCont.className = 'message_cont';
				const rTitle = document.createElement('p');
				rTitle.innerHTML = 'MESSAGE';
				function drawMessageInput() {
					let rHTML = `<textarea type="text" wrap="hard" cols="10" rows="2"></textarea>`;
					replaceCont.innerHTML = rHTML;
					const textInput = document.querySelector('.message_cont textarea');
					textInput.value = editor.data.string;
					textInput.addEventListener('change', function (evn) {
						editor.data.string = evn.target.value;
					});
					console.log(textInput);
				}
				cont.appendChild(rTitle);
				cont.appendChild(replaceCont);
				drawMessageInput();
			},
			"JSON": function () {
				const cont = document.getElementById('cont');
				const jsonCont = document.createElement('div');
				jsonCont.className = 'json_cont';
				const jTitle = document.createElement('p');
				jTitle.innerHTML = 'VALUES';
				function drawJSONFields() {
					while (jsonCont.hasChildNodes()) {
						jsonCont.removeChild(jsonCont.firstChild);
					}
					let jHTML = `<div class="fields"><h1>SAVE AS</h1><h1>PATH FROM FLOW</h1></div>`;
					jsonCont.innerHTML = '';
					jsonCont.innerHTML = jHTML;
					function row(i) {
						const div = document.createElement('div');
						div.className = 'row';
						const inputKey = document.createElement('input');
						const inputPath = document.createElement('input');
						if (i !== undefined) {
							inputKey.value = editor.data.analisis_params[i].key;
							inputPath.value = editor.data.analisis_params[i].path;
							inputKey.addEventListener('change', function (evn) {
								console.log('change in key');
								editor.data.analisis_params[i].key = evn.target.value;
							});
							inputPath.addEventListener('change', function (evn) {
								editor.data.analisis_params[i].path = evn.target.value;
							});
						} else {
							inputKey.addEventListener('change', function _func(evn) {
								inputKey.removeEventListener('change', _func);
								if (editor.data.analisis_params.length > 0) {
									if (Object.keys(editor.data.analisis_params[0]).length === 0 ) {
										editor.data.analisis_params = [];
									}
								}
								console.log('change in key', editor.data.analisis_params);
								editor.data.analisis_params.push({
									key: evn.target.value,
									path: ''
								});
								drawJSONFields();
							});
							inputPath.addEventListener('change', function _func(evn) {
								inputPath.removeEventListener('change', _func);
								editor.data.analisis_params.push({
									key: '',
									path: evn.target.value
								});
								drawJSONFields();
							});
						}
						div.appendChild(inputKey);
						div.appendChild(inputPath);
						jsonCont.appendChild(div);
					}
					for (let i = 0; i < editor.data.analisis_params.length; i++) {
						if ('key' in editor.data.analisis_params[i]) {
							row(i);
						} else {
							break;
						}
					}
					row(undefined);
				}
				cont.appendChild(jTitle);
				cont.appendChild(jsonCont);
				drawJSONFields();
			},
			"HTML": function () {
				const cont = document.getElementById('cont');
				const htmlCont = document.createElement('div');
				htmlCont.className = 'html_cont';
				const hTitle = document.createElement('p');
				hTitle.innerHTML = 'VALUES';
				function drawHTMLFields() {
					let hHTML = `<div class="fields"><h1>OCCURRENCE</h1><h1>STOP SEQUENCE</h1></div>`;
					htmlCont.innerHTML = '';
					htmlCont.innerHTML = hHTML;
					function row(i) {
						const div = document.createElement('div');
						div.className = 'row';
						const inputOcc = document.createElement('input');
						const inputStop = document.createElement('input');
						if (i !== undefined) {
							inputOcc.value = editor.data.analisis_params[i].occurrence;
							inputStop.value = editor.data.analisis_params[i].stop;
							inputOcc.addEventListener('change', function (evn) {
								editor.data.analisis_params[i].occurrence = evn.target.value;
							});
							inputStop.addEventListener('change', function (evn) {
								editor.data.analisis_params[i].stop = evn.target.value;
							});
						} else {
							inputOcc.addEventListener('change', function _func(evn) {
								inputOcc.removeEventListener('change', _func);
								if (editor.data.analisis_params.length >= 1 && 'stop' in editor.data.analisis_params[0]) {
									editor.data.analisis_params.push({
										occurrence: evn.target.value,
										stop: '',
										discard: false
									});
								} else {
									editor.data.analisis_params[0] = {
										occurrence: evn.target.value,
										stop: '',
										discard: false
									};
								}
								drawHTMLFields();
							});
						}
						div.appendChild(inputOcc);
						div.appendChild(inputStop);
						htmlCont.appendChild(div);
					}
					for (let i = 0; i < editor.data.analisis_params.length; i++) {
						if ('occurrence' in editor.data.analisis_params[i]) {
							row(i);
						}
						console.log(editor.data.analisis_params);
					}
					row(undefined);
				}
				cont.appendChild(infoTag);
				cont.appendChild(infoContent);
				cont.appendChild(hTitle);
				cont.appendChild(htmlCont);
				drawHTMLFields();
			},
			"get_updates": function () {
			},
			"media_player": function () {
				const cont = document.getElementById('cont');
				const formatCont = document.createElement('div');
				formatCont.className = 'format_cont';
				const hTitle = document.createElement('p');
				hTitle.innerHTML = 'This proccess is automatic, continue by saving this configuration and exit';
				cont.appendChild(hTitle);
			},
			"media_twitter": function () {
				const cont = document.getElementById('cont');
				const formatCont = document.createElement('div');
				formatCont.className = 'format_cont';
				const hTitle = document.createElement('p');
				hTitle.innerHTML = 'This proccess is automatic, continue by saving this configuration and exit';
				cont.appendChild(hTitle);
			},
			"contacts_list": function () {
				const cont = document.getElementById('cont');
				const formatCont = document.createElement('div');
				formatCont.className = 'format_cont';
				const hTitle = document.createElement('p');
				hTitle.innerHTML = 'This proccess is automatic, continue by saving this configuration and exit';
				cont.appendChild(hTitle);
			},
			"list_ops": function () {
				const cont = document.getElementById('cont');
				const conditionsCont = document.createElement('div');
				conditionsCont.className = 'samples_cont';
				const cTitle = document.createElement('p');
				cTitle.innerHTML = 'LISTS AND OPERATIONS';
				function drawComp() {
					let cHTML = `<div class="fields cond"><h1>LIST NAME</h1><h1>OPERATION</h1><h1>VALUE IN LIST ITEM</h1></div>`;
					const options = [
						"+",
						"-",
						"*",
						"/"
					];
					function rowString(cond) {
						let input = '';
						if (cond.input) {
							input = 'name="add"';
						}
						let html = `<div class="row cond" ${input}>`;
						html += `<input class="cond_input" value="${cond.list}">`;
						html += `<select class="cond_select">`;
						for (const opt of options) {
							let selected = '';
							if (opt === cond.opt) {
								selected = 'selected="true"'
							}
							html += `<option value="${opt}" ${selected}">"${opt}"</option>`;
						}
						html += `</select>`;
						html += `<input class="cond_input" value="${cond.value}">`;
						html += `</div>`;
						return html;
					}
					if ('list' in editor.data.analisis_params[0]) {
						for (const cond of editor.data.analisis_params) {
							cHTML += rowString(cond);
							// cHTML += ` ${cond.cond} ${cond.key}`;
						}
					}
					cHTML += rowString({
						opt: "+",
						list: "",
						value: "",
						input: true
					});
					conditionsCont.innerHTML = cHTML;
					const rows = document.querySelectorAll('.row');
					for (let i = 0; i < rows.length - 1; i++) {
						console.log(rows[i]);
						const inputs = rows[i].querySelectorAll('input');
						const select = rows[i].querySelector('select');
						console.log(inputs);
						inputs[0].addEventListener('change', function _func(evn) {
							inputs[0].removeEventListener('change', _func);
							if (evn.target.value === '') {
								console.log('delete item');
								if (i === 0 && editor.data.analisis_params.length === 1) {
									editor.data.analisis_params[i] = {};
								} else {
									delete editor.data.analisis_params[i];
									const newPars = [];
									for (const par of editor.data.analisis_params) {
										if (par) {
											newPars.push(par);
										}
									}
									editor.data.analisis_params = newPars;
								}
								drawComp();
							} else {
								editor.data.analisis_params[i].list = evn.target.value;
							}
							inputs[0].addEventListener('change', _func);
						});
						inputs[1].addEventListener('change', function _func(evn) {
							inputs[1].removeEventListener('change', _func);
							editor.data.analisis_params[i].value = evn.target.value;
							inputs[1].addEventListener('change', _func);
						});
						select.addEventListener('change', function _func(evn) {
							select.removeEventListener('change', _func);
							editor.data.analisis_params[i].opt = evn.target.value;
							select.addEventListener('change', _func);
						});
					}
					console.log(rows);
					const addRow = document.querySelector('[name="add"] input');
					addRow.addEventListener('change', function _func(evn) {
						addRow.removeEventListener('change', _func);
						if (editor.data.analisis_params.length >= 1 && 'list' in editor.data.analisis_params[0]) {
							editor.data.analisis_params.push({
								list: evn.target.value,
								opt: '+',
								value: ''
							});
						} else {
							editor.data.analisis_params[0] = {
								list: evn.target.value,
								opt: '+',
								value: ''
							};
						}
						drawComp();
					});
					console.log(addRow);
				}
				cont.appendChild(cTitle);
				cont.appendChild(conditionsCont);
				drawComp();
			},
			"": function () {
			}
		}
		return modes[mode]();
	}
	save() {
		const now = new Date(Date.now());
		const editor = this;
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
		if (editor.data.type === 'service' && editor.data.analisis_params.date) {
			editor.data.analisis_mode = '';
			editor.data.work_type = 'process';
			editor.data.analisis_params.sync_date = sync_date;
			for (let i = 0; i < editor.data.analisis_params.date.length; i++) {
				editor.data.analisis_params.date[i] = Number(editor.data.analisis_params.date[i]);
			}
		}
		console.log('Data to save from node editor:', editor.data);
		fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${editor.data.id}/save`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(editor.data)
			}
		).then(res => res.json)
		.then(json => {
			console.log(json);
			getBoardView();
			$('.new_node_cont').css('display', 'none');
		})
	}
}
let info = {
	comparision: `<span style="font-weight: bold; color:purple;">VALUE 1:</span><br>The key from the flow to use at the comparission
				<br><br><span style="font-weight: bold; color:purple;">CONDITION:</span><br>The condition to compare against
				<br><br><span style="font-weight: bold; color:purple;">VALUE 2:</span><br>A value to compare with VALUE 1`,


	JSON: `Use <span style="font-weight: bold; color:purple;">SAVE AS</span> to define the key to store the value.
			<br>and <span style="font-weight: bold; color:purple;">PATH FROM FLOW</span> to define the route to extract the value from the stored data`,


	HTML: `Scrappe an HTML or a text file to find the occurrencies and extract the values.
			<br>
			<br><span style="font-weight: bold; color:purple;">OCCURRENCE:</span>
			<br>An HTML tag or any similarity to start extracting the value.
			<br>
			<br><span style="font-weight: bold; color:purple;">STOP SEQUENCE:</span>
			<br>An stop character sequence to stop collecting and save the value.
			<br>
			<br><span style="font-weight: bold; color: blue;">Note:</span>
			<br>You can use wildcards "*" to extract values from the 
				previous nodes and put them in the occurrence pattern
			<br>
			<br><span style="font-weight: bold; color: green;">Example:</span>
			<br><span style="font-weight: bold; color: orange;">my_url</span> = sponges
			<br><br>if you apply the wildcard then the string:
			<br><span style="font-weight: bold; color: #fc0356;">href="some/url/*my_url*</span>
			<br>Becomes: <span style="font-weight: bold; color: #fc0356;">href="some/url/sponges</span>`,


	replace: `
				Write your message and use the format 
				<span style="font-weight: bold; color: #fc0356;">{key}</span> to extract a value from the flow's data.
				<br><br><span style="color: #6ad498; font-weight: bold;">Example: </span>
				<br><span style="color: orange;">color</span> = 'red'
				<br>My bike is <span style="color: orange;">{color}</span>, and I like it
				<br>Becomes:
				<br>My bike is <span style="color: orange;">red</span>, and I like it
			`,


	gen_signature: 'Uses the headers from the connection node and the keys stored in the data to create a HMAC-SHA1 signature',


	'': 'When none is selected the node will return the data with no proccessing',


	media_player: `When this option is selected, 
					the caller node should pass a value with the key "url" 
					in order to load the source file, if you connect this node with a download node, 
					we will handle the media for you`,


	get_updates: `set the key to store the extracted data, and the path to get the value
					<br>this options finds if there is new records in the input data and 
					extract the last one by checking the parameter counter stored in the 
					node to use this option set the value "count" to 0 or whatever value 
					you need in the previous section`,


	statistics: `samples:
				<br>parameters:<br>`

}