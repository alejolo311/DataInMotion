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
	return new Date(year, month + 1, 0).getDate();
}

class Calendar {
	constructor (date, nodeId) {
		// console.log(date);
		// console.log(monthToText(date[1]));
		this._nodeId = nodeId;
		this._date = date;
	}
	async build(x, y) {
		const viewFetch = await fetch(`${global.prot}://${global.domain}/calendar`);
		const view = await viewFetch.text();
		const parser = new DOMParser();
		let html = parser.parseFromString(view, 'text/html');
		html = html.body.firstChild;
		html.style.left = x + 'px';
		html.style.top = y + 'px';
		document.body.appendChild(html);
		html.querySelector('[nav="prev"]').addEventListener('click', function() {
			if (cal._date[1] == 0) {
				cal._date[1] = 11;
				cal._date[0] = cal._date[0] - 1;
			} else {
				cal._date[1] = cal._date[1] - 1;
			}
			cal.draw();
		});
		const cal = this;
		html.querySelector('[nav="next"]').addEventListener('click', function() {
			if (cal._date[1] == 11) {
				cal._date[1] = 0;
				cal._date[0] = cal._date[0] + 1;
			} else {
				cal._date[1] = cal._date[1] + 1;
			}
			cal.draw();
		});
		html.querySelector('[name="hour"]').addEventListener('change', function(evn) {
			const hour = Number(evn.target.options[evn.target.selectedIndex].text);
			cal._date[3] = hour;
		});
		html.querySelector('[name="minute"]').addEventListener('change', function(evn) {
			cal._date[4] = Number(evn.target.options[evn.target.selectedIndex].text);
		});
		html.querySelector('[save="calendar"]').addEventListener('click', function(evn) {
			cal.save();
		});
		this._html = html;
		this.draw();
	}
	draw() {
		// console.log('Month', this._date[1]);
		this._html.querySelector('.calendar_head h1').innerHTML = monthToText(this._date[1]) + ' - ' + this._date[0];
		const dim = getDaysInMonth(this._date[1], this._date[0]);
		const iPos = new Date(this._date[0], this._date[1], 1).getDay();
		const days = Array.from({
			length: dim + iPos
		}, e => 0);
		const dayUl = this._html.querySelector('.days_selector');
		dayUl.innerHTML = '';
		const cal = this;
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
		if (noonValue == 1) {
			if (cal._date[3] == 12) {
				cal._date[3] = 0;
			} else {
				cal._date[3] = cal._date[3] + 12;
			}
		}
		cal._date[1] += 1;
		const result = await cal.sendDate();
		cal._html.remove();
		console.log(result);
	}
	async sendDate() {
		const now = new Date(Date.now());
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${this._nodeId}/save`,
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'service',
					date: this._date,
					sync_date: [
						now.getFullYear(),
						now.getMonth() + 1,
						now.getDate(),
						now.getHours(),
						now.getMinutes(),
						now.getSeconds(),
						now.getMilliseconds(),
					]
				})
			}
		);
		return await req.json();
	}
}