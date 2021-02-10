function monthToText(month) {
	var months = [
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
		"December"];
	return months[month];
}

function getDaysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

class Calendar {
	constructor (date, nodeId, root) {
		// console.log(date);
		// console.log(monthToText(date[1]));
		this._nodeId = nodeId;
		this._date = date;
		this.root = root;
		// Add style link to head
		var head = document.getElementsByTagName('head')[0];
		const link = document.createElement('link');
		link.href = `/static/styles/calendar.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'calendar');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'calendar') {
				link.remove();
			}
		}
		head.appendChild(link);
	}
	set context(value) {
		this._context = value;
	}
	async build(x, y) {
		const viewFetch = await fetch(`${global.prot}://${global.domain}/calendar`);
		const view = await viewFetch.text();
		const parser = new DOMParser();
		let html = parser.parseFromString(view, 'text/html');
		html = html.body.firstChild;
		html.style.left = x + 'px';
		html.style.top = y + 'px';
		this.root.appendChild(html);
		const prev = html.querySelector('[nav="prev"]');
		prev.addEventListener('click', function() {
			if (cal._date[1] == 0) {
				cal._date[1] = 11;
				cal._date[0] = cal._date[0] - 1;
			} else {
				cal._date[1] = cal._date[1] - 1;
			}
			cal.draw();
		});
		const cal = this;
		console.log(cal);
		cal._date[5] = 0;
		const next = html.querySelector('[nav="next"]');
		next.addEventListener('click', function() {
			if (cal._date[1] == 11) {
				cal._date[1] = 0;
				cal._date[0] = cal._date[0] + 1;
			} else {
				cal._date[1] = cal._date[1] + 1;
			}
			cal.draw();
		});
		html.querySelector('[name="hour"]').addEventListener('change', function(evn) {
			const hour = Number(evn.target.options[evn.target.selectedIndex].value);
			evn.target.text = hour;
			cal._date[3] = hour;
			console.log(cal._date);
		});
		html.querySelector('[name="minute"]').addEventListener('change', function(evn) {
			cal._date[4] = Number(evn.target.options[evn.target.selectedIndex].value);
			evn.target.text = cal._date[4];
			console.log(cal._date);
		});
		html.querySelector('[save="calendar"]').addEventListener('click', function(evn) {
			cal.save();
		});
		this._html = html;
		this.draw();
	}
	draw() {
		console.log('Month', this._date[1]);
		this._html.querySelector('.calendar_head h1').innerHTML = monthToText(this._date[1]) + ' - ' + this._date[0];
		const dim = getDaysInMonth(this._date[1], this._date[0]);
		const iPos = new Date(this._date[0], this._date[1], 1).getDay();
		const days = Array.from({
			length: dim + iPos
		}, e => 0);
		const dayUl = this._html.querySelector('.days_selector');
		dayUl.innerHTML = '';
		const cal = this;
		cal._date[5] = 0;
		const col_active = getComputedStyle(document.documentElement)
											.getPropertyValue('--active');
		const col_uns = getComputedStyle(document.documentElement)
											.getPropertyValue('--unselected');
		const col_today = getComputedStyle(document.documentElement)
											.getPropertyValue('--today');
		function setDay(evn) {
			const newDay = Number(evn.target.getAttribute('day'));
			const last = document.querySelector(`[day="${cal._date[2]}"`);
			try {
				last.style.backgroundColor = 'white';
				last.style.color = col_uns;
			} catch (err) {
				console.log(err);
			}
			cal._date[2] = Number(newDay);
			evn.target.style.backgroundColor = col_active;
			evn.target.style.color = 'white';
			const now = new Date(Date.now());
			if (now.getDate() !== newDay && now.getMonth() === cal._date[1]) {
				const todayNode = document.querySelector(`[day="${now.getDate()}"`);
				todayNode.style.backgroundColor = col_today;
				todayNode.style.color = 'white';
			}
			// console.log(newDay, cal);
		}
		// Draw the saved day
		const toRemove = document.querySelectorAll('.days_selector li');
		for (const li of toRemove) {
			li.removeEventListener('click', setDay);
		}
		for (let i = 0, k = 1 - iPos; i < days.length; i++, k++) {
			// console.log(i, k);
			const li = document.createElement('li');
			if (k > 0) {
				li.setAttribute('day', k);
				li.className = 'day';
				li.innerHTML = k;
				li.addEventListener('click', setDay);
			}
			dayUl.appendChild(li);
		}
		const now = new Date(Date.now());
		if (now.getDate() !== cal._date[2] && now.getMonth() === cal._date[1]) {
			const todayNode = document.querySelector(`[day="${new Date(Date.now()).getDate()}"`);
			todayNode.style.backgroundColor = col_today;
			todayNode.style.color = 'white';
		}
		const dayNode = document.querySelector(`[day="${cal._date[2]}"`);
		try {
			dayNode.style.backgroundColor = col_active;
			dayNode.style.color = 'white';
		} catch (err) {
			console.log(err);
		}
		const hour = document.querySelector('[name="hour"]');
		const noon = document.querySelector('[name="noon"]');
		if (this._date[3] > 12) {
			hour.value = this._date[3] - 12;
			noon.value = 1;
		} else {
			hour.value = this._date[3];
			noon.value = 0;
		}
		const minute = document.querySelector('[name="minute"]');	
		minute.value = this._date[4];
		
	}
	async save() {
		const cal = this;
		const hour = cal._html.querySelector('[name="hour"]');
		console.log(hour.options[hour.selectedIndex]);
		cal._date[3] = Number(hour.options[hour.selectedIndex].value);
		const minute = cal._html.querySelector('[name="minute"]');
		cal._date[4] = Number(minute.options[minute.selectedIndex].value);
		const noon = cal._html.querySelector('[name="noon"]');
		const noonValue = Number(noon.options[noon.selectedIndex].value);
		console.log(noon, noonValue);
		// configure hour if noon or morning
		if (noonValue == 1) {
			if (cal._date[3] == 12) {
				cal._date[3] = 0;
			} else {
				cal._date[3] = cal._date[3] + 12;
			}
		}
		cal._html.remove();
		cal.root.style.display = 'none';
		if (this._context) {
			// this._context.data.analisis_params['date'] = cal._date;
			const date = cal._date.map(e => Array.isArray(e) ? e.clone() : e);
			this._context.data.analisis_params['date'] = cal._date;
			this._context.printFormatedDate(this._context.triggerDateContainer, date);
		}
		const result = await cal.sendDate();
	}
	async sendDate() {
		const now = new Date(Date.now());
		console.log(this._date);
		this._date[1] += 1;
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
		console.log('Date from Calendar component: ', sync_date);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this._nodeId}/save`,
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify({
					type: 'service',
					analisis_params: {
						date: this._date,
						sync_date: sync_date
					}
				})
			}
		);
		return await req.json();
	}
	close() {
		this._html.remove();
	}
}