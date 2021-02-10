class SchoolsManager extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/SchoolsManager.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'schools_manager');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'schools_manager') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	backHome (evn) {
		window.location.replace('/');
	}
	onMounted () {
		// console.log('Fetch Schools');
		const btn = this._root.querySelector('.admin');
		const comp = this;
		comp.loadSchoolList();
		const addSchool = this._root.querySelector('.add_school');
		addSchool.addEventListener('click', async function () {
			await comp.createSchool();
			comp.loadSchoolList();
		});
	}
	async loadSchoolList (evn) {
		console.log('Load School list');
		this.showSchoolList();
		const comp = this;
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/schools`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		if (req.status === 200) {
			const resp = await req.json();
			// console.log(resp);
			comp.drawSchoolList(resp.reverse());
		} else if (req.status === 401) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
			console.log('Error', await req.json());
		}
	}
	drawSchoolList (schools) {
		// Sets the actualSchoolIndex to 0 if the list is not empty
		// to undefined when there is no schools created
		const comp = this;
		const list = this._root.querySelector('.schools_list ul');
		list.innerHTML = '';
		let pos = 0;
		for (const school of schools) {
			const li = document.createElement('li');
			const h1 = document.createElement('h1');
			h1.innerHTML = school.name;
			li.appendChild(h1);
			const p = document.createElement('p');
			p.innerHTML = school.description;
			li.appendChild(p);
			const h2 = document.createElement('h2');
			h2.innerHTML = `creator: ${school.admin}`;
			li.appendChild(h2);
			const img = document.createElement('img');
			li.appendChild(img);
			list.appendChild(li);
			li.addEventListener('click', function (evn) {
				comp.actualSchool = school.id;
				comp.actualSchoolIndex = pos;
				comp.school = school;
				document.querySelector('.school_info').innerHTML = '';
				DOMManager.render(
					SchoolEditor,
					document.querySelector('.school_info'),
					{
						parent: comp
					}
				);
				// comp.renderSchool(evn, school);
			});
			pos++;
		}
		if (comp.actualSchoolIndex !== undefined) {
			console.log('no actualIndex');
			// list.querySelectorAll('li')[comp.actualSchoolIndex].click();
		} else {
			try {
				list.querySelectorAll('li')[0].click();
				comp.actualSchoolIndex = 0;
			} catch (err) {
				console.log('modules empty');
			}
		}
	}
	// Controls the show and hidde behavior
	showSchoolList () {
		if (this.scinfo) {
			const sclist = this._root.querySelector('.schools_list');
			const scinfo = this._root.querySelector('.school_info');
			sclist.style.width = this.sclist + 'px';
			scinfo.style.width = this.scinfo + 'px';
			scinfo.style.left = (this.scinfoLeft) + 'px';
			sclist.style.display = 'block';
			const courses = this._root.querySelector('.courses ul');
			courses.style.gridTemplateColumns = 'repeat(2, 46%)';
		}
		
	}
	hiddeSchoolList () {
		const sclist = this._root.querySelector('.schools_list');
		const scinfo = this._root.querySelector('.school_info');
		const computed = window.getComputedStyle(sclist, null);
		const compSCinfo = window.getComputedStyle(scinfo, null);
		const sclistWidth = Math.round(Number(computed.width.slice(0, computed.width.length -2)));
		const scinfoWidth = Math.round(Number(compSCinfo.width.slice(0, compSCinfo.width.length -2)));
		this.sclist = sclistWidth;
		this.scinfo = scinfoWidth + 16;
		this.scinfoLeft = scinfo.getBoundingClientRect().left;
		const w = (scinfoWidth + sclistWidth + 16) + 'px';
		const l = (scinfo.getBoundingClientRect().left - sclistWidth) + 'px';
		scinfo.style.width = w
		scinfo.style.left = l;
		sclist.style.display = 'none';
		console.log(w, l);
		console.log(sclist, scinfo);
		const courses = this._root.querySelector('.courses ul');
		courses.style.gridTemplateColumns = 'repeat(3, 30%)';
	}
	// Call the API to create a new record
	async createSchool (evn) {
		console.log('Create a new School');
		// this.hiddeSchoolList();
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/schools`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify({
					name: 'New School',
					description: 'Description for this New School Enjoy it!!'
				})
			}
		)
		if (req.status === 200) {
			const resp = await req.json();
			console.log(resp);
		} else if (req.status === 401) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
			console.log('Error', await req.json());
		}
	}
	close (evn) {
		this._root.innerHTML = '';
		this._root.style.display = 'none';
	}
	render () {
		return (
			`
				<div>
					<div class="menu_schools">
						<div class="home" click="${ this.close.name }"></div>
					</div>
					<div class="schools_list">
						<h1>Schools you manage</h1>
						<ul class="school_ul">
						</ul>
						<div class="add_school">Create new School</div>
					</div>
					<div class="school_info">
					</div>
				</div>
			`
		);
	}
}