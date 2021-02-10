class SchoolEditor extends Component {
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
	onMounted () {
		console.log(this._props.parent);
		this.renderSchool({}, this._props.parent.school);
	}
	close () {
		this._root.innerHTML = '';
	}
	render () {
		return (
			`	
				<div id="dialog"></div>
				<div class="name_editor">
					<h1>School Name</h1>
					<input placeholder="School Name"></input>
					<button></button>
				</div>
				<div class="description_editor">
					<p>school description</p>
					<input placeholder="School Description"></input>
					<button></button>
				</div>
				<div class="info_options">
					<button class="admins">CREATORS</button>
					<button class="delete">DELETE SCHOOL</button>
				</div>
				<div class="modules">
					<ul>
						<li class="add_module">create new module</li>
					</ul>
					<div class="module_info">
						<div editor="name">
							<h1 class="name">Module name</h1>
							<input></input>
							<button></button>
						</div>
						<div editor="description">
							<p class="description">description</p>
							<input></input>
							<button></button>
						</div>
						<div>
							<button class="delete_module">DELETE MODULE</button>
						</div>
					</div>
				</div>
				<div class="courses">
					<ul>
					</ul>
				</div>
			`
		);
	}
	//
	async renderSchool (evn, school) {
		// this.hiddeSchoolList();
		// console.log(school);
		const comp = this;
		comp.school = school;
		const schoolInfo = this._root;
		const nEditor = schoolInfo.querySelector('.name_editor button');
		const nEditorCopy = nEditor.cloneNode(true);
		const fanc_ = async function (evn) {
			evn.target.removeEventListener('keypress', func_);
			evn.target.removeEventListener('blur', fanc_)
			evn.target.style.display = 'none';
			school.name = evn.target.value;
			await comp.saveSchool(evn, school);
			comp._props.parent.loadSchoolList();
		};
		const func_ = async function (evn) {
			if (evn.key === 'Enter') {
				evn.target.removeEventListener('keypress', func_);
				evn.target.removeEventListener('blur', fanc_);
				school.name = evn.target.value;
				await comp.saveSchool(evn, school);
				evn.target.style.display = 'none';
				comp._props.parent.loadSchoolList();
			}
		}
		nEditorCopy.addEventListener('click', function ded_(evn) {
			evn.target.removeEventListener('click', ded_);
			const input = evn.target.parentNode.querySelector('input');
			const inputCopy = input.cloneNode(true);
			inputCopy.style.display = 'flex';
			inputCopy.value = school.name;
			inputCopy.addEventListener('blur', fanc_);
			inputCopy.addEventListener('keypress', func_);
			input.parentNode.replaceChild(inputCopy, input);
		});
		nEditor.parentNode.replaceChild(nEditorCopy, nEditor);
		schoolInfo.querySelector('.name_editor h1').innerHTML = school.name;
		const dEditor = schoolInfo.querySelector('.description_editor button');
		const janc_ = async function (evn) {
			evn.target.style.display = 'none';
			school.description = evn.target.value;
			await comp.saveSchool(evn, school);
			comp._props.parent.loadSchoolList();
		};
		const junc_ = async function (evn) {
			if (evn.key === 'Enter') {
				school.description = evn.target.value;
				await comp.saveSchool(evn, school);
				evn.target.style.display = 'none';
				comp._props.parent.loadSchoolList();
			}
		};
		dEditor.addEventListener('click', function ded_(evn) {
			evn.target.removeEventListener('click', ded_);
			const input = evn.target.parentNode.querySelector('input');
			const inputCopy = input.cloneNode(true);
			inputCopy.style.display = 'flex';
			inputCopy.value = school.description;
			inputCopy.addEventListener('blur', janc_);
			inputCopy.addEventListener('keypress', junc_);
			input.parentNode.replaceChild(inputCopy, input);
		});
		schoolInfo.querySelector('.description_editor p').innerHTML = school.description;

		const schoolOptions = this._root.querySelector('.info_options');
		// Options to admin the creators and to delete the school
		const delbtn = schoolOptions.querySelector('.delete');
		const copyBtn = delbtn.cloneNode(true);
		copyBtn.addEventListener('click', function func_ (evn) {
			DOMManager.render(
				YesNoDialog,
				document.getElementById('dialog'),
				{
					title: `Delete ${school.name}`,
					message: 'Are you sure about deleting this School?',
					yesCallback: comp.deleteSchool.name,
					noCallback: undefined,
					context: comp
				}
			);
		});
		delbtn.parentNode.replaceChild(copyBtn, delbtn);
		this.loadModules(school);
	}
	// Call to API to save the school information
	async saveSchool (evn, data) {
		console.log('Save school', data);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/schools/${data.id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(data)
			}
		);
		console.log(req.status);
		this.renderSchool({}, data);
	}
	async deleteSchool () {
		console.log('delete school');
		const comp = this;
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/schools/${comp.school.id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		);
		console.log(req.status);
		comp._props.parent.loadSchoolList();
		this.close();
	}
	async loadModules (school) {
		const comp = this;
		// console.log('load modules for', school.name);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${school.id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
			}
		)
		if (req.status == 200) {
			// console.log('renderModules');
			console.log();
			comp.renderModules(await req.json());
		} else if (req.status === 401) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
			console.log(req.status);
			console.log('Fail to load modules');
		}
	}
	renderModules (modules) {
		// console.log(modules);
		const comp = this;
		const modulesUl = this._root.querySelector('.modules ul');
		// console.log(modulesUl);
		const addUl = modulesUl.querySelector('li');
		modulesUl.innerHTML = '';
		const addUlCopy = addUl.cloneNode(true);
		addUlCopy.addEventListener('click', function func_(evn) {
			addUlCopy.removeEventListener('click', func_);
			console.log('create new module');
			comp.createModule();
		});
		modulesUl.appendChild(addUlCopy);
		for (const mod of modules) {
			const li = document.createElement('li');
			li.setAttribute('module_id', mod.id);
			li.innerHTML = mod.name;
			li.addEventListener('click', function (evn) {
				console.log('Render module Courses for', mod.name);
				for (const l of modulesUl.querySelectorAll('li')) {
					l.classList.remove('module_selected');
				}
				evn.target.classList.add('module_selected');
				comp.loadCourses(mod);
			});
			modulesUl.appendChild(li);
		}
		try {
			modulesUl.querySelectorAll('li')[1].click();
		} catch (err) {
			console.log('modules empty');
			const coursesUl = comp._root.querySelector('.courses ul');
			coursesUl.innerHTML = '';
		}
	}
	async createModule () {
		const comp = this;
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${comp.school.id}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(
					{
						name: 'New Module',
						description: 'A description for this new module'
					}
				)
			}
		)
		if (req.status == 200) {
			console.log('renderCourses');
			console.log(await req.json());
			comp.loadModules(comp.school);
		} else if (req.status === 401) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
			console.log(req.status);
			console.log('Fail to load courses');
		}
	}
	async loadCourses (mod) {
		const comp = this;
		// console.log('load courses for', mod.name);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${mod.id}/courses`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
			}
		)
		if (req.status == 200) {
			console.log('renderCourses');
			comp.renderCourses(mod, await req.json());
		} else {
			console.log(req.status);
			console.log('Fail to load courses');
		}
	}
	async saveModule (mod) {
		const comp = this;
		console.log('reload', mod.school);
		// console.log(mod.id);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${comp.module.id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(comp.module)
			}
		)
		if (req.status === 200) {
			this.loadModules(comp.school);
		} else {
			console.log(await req.json());
		}
	}
	async deleteModule () {
		const comp = this;
		// console.log(mod.id);
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${comp.module.id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		if (req.status === 200) {
			console.log(req.status);
			console.log(comp.school);
			comp.renderSchool({}, comp.school);
		}
	}
	renderCourses (mod, courses) {
		const comp = this;
		comp.module = mod;
		const title = this._root.querySelector('.modules .name');
		const desc = this._root.querySelector('.modules .description');
		title.innerHTML = mod.name;
		desc.innerHTML = mod.description;
		// Add name and description editor
		const fanc_ = function (evn) {
			evn.target.removeEventListener('blur', fanc_);
			evn.target.removeEventListener('keypress', func_);
			comp.module.name = evn.target.value;
			evn.target.style.display = 'none';
			comp.saveModule(comp.module);
		};
		const func_ = function (evn) {
			if (evn.key === 'Enter') {
				evn.target.removeEventListener('blur', fanc_);
				evn.target.removeEventListener('keypress', func_);
				comp.module.name = evn.target.value;
				evn.target.style.display = 'none';
				comp.saveModule(comp.module);
			}
		};
		const nEditor = comp._root.querySelector('[editor="name"]');
		nEditor.querySelector('button').addEventListener('click', function ded_ (evn) {
			evn.target.removeEventListener('click', ded_);
			const input = nEditor.querySelector('input');
			const inputCopy = input.cloneNode(true);
			inputCopy.style.display = 'flex';
			inputCopy.value = comp.module.name;
			inputCopy.addEventListener('blur', fanc_);
			inputCopy.addEventListener('keypress', func_);
			input.parentNode.replaceChild(inputCopy, input);
		});
		const janc_ = function (evn) {
			evn.target.removeEventListener('blur', junc_);
			evn.target.removeEventListener('keypress', janc_);
			comp.module.name = evn.target.value;
			evn.target.style.display = 'none';
			comp.saveModule(comp.module);
		};
		const junc_ = function (evn) {
			if (evn.key === 'Enter') {
				evn.target.removeEventListener('blur', fanc_);
				evn.target.removeEventListener('keypress', func_);
				comp.module.description = evn.target.value;
				evn.target.style.display = 'none';
				comp.saveModule(comp.module);
			}
		};
		const dEditor = comp._root.querySelector('[editor="description"]');
		dEditor.querySelector('button').addEventListener('click', function ded_ (evn) {
			evn.target.removeEventListener('click', ded_);
			const input = dEditor.querySelector('input');
			const inputCopy = input.cloneNode(true);
			inputCopy.style.display = 'flex';
			inputCopy.value = comp.module.description;
			inputCopy.addEventListener('blur', janc_);
			inputCopy.addEventListener('keypress', junc_);
			input.parentNode.replaceChild(inputCopy, input);
		});
		// add delete listeners
		const fonc_ = function (evn) {
			deleteBtn.removeEventListener('click', fonc_);
			console.log('delete module', mod.name);
			DOMManager.render(
				YesNoDialog,
				document.getElementById('dialog'),
				{
					title: `Delete ${mod.name}`,
					message: 'Are you sure about deleting this Module?',
					yesCallback: comp.deleteModule.name,
					noCallback: undefined,
					context: comp
				}
			);
		}
		const deleteBtn = comp._root.querySelector('.delete_module');
		const copyBtn = deleteBtn.cloneNode(true);
		copyBtn.removeEventListener('click', fonc_);
		copyBtn.addEventListener('click', fonc_);
		deleteBtn.parentNode.replaceChild(copyBtn, deleteBtn);
		// console.log(courses);
		const coursesUl = this._root.querySelector('.courses ul');
		const addBtn = document.createElement('li');
		coursesUl.innerHTML = '';
		// console.log('listener added');
		coursesUl.appendChild(addBtn);
		addBtn.outerHTML = `
			<li class="add_course">
				<h3></h3>
				<h1>Add new Course</h1>
				<p>create a new course in <br>${mod.name}</p>
			</li>
		`;
		coursesUl.querySelector('li').addEventListener('click', function func_ (evn) {
			addBtn.removeEventListener('click', func_);
			console.log('create a new course');
			comp.createCourse(mod);
		});
		for (const course of courses) {
			const li = document.createElement('li');
			const options = document.createElement('div');
			options.classList.add('options');
			const img = document.createElement('img');
			const h1 = document.createElement('h1');
			h1.innerHTML = course.name;
			const p = document.createElement('p');
			p.innerHTML = course.description;
			li.appendChild(options);
			li.appendChild(img);
			li.appendChild(h1);
			li.appendChild(p);
			coursesUl.appendChild(li);
		}
	}
	async createCourse(mod) {
		const comp = this;
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/modules/${mod.id}/courses`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify({
					name: 'New Course',
					description: 'Description of New Course'
				})
			}
		);
		if (req.status === 200) {
			console.log('New course added');
			comp.loadCourses(comp.module);
		} else if (req.status === 401){
			window.location.replace(`${global.prot}://${global.domain}/login`);
			console.log('Create course fail');
		}
	}
}