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
		console.log('Fetch Schools');
		const btn = this._root.querySelector('.admin');
		const comp = this;
		btn.addEventListener('click', function () {
			comp.loadSchoolList();
		});
		const addSchool = this._root.querySelector('.add_school');
		addSchool.addEventListener('click', function () {
			comp.createSchool()
		});
	}
	async loadSchoolList (evn) {
		console.log('load School');
		this.showSchoolList();
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
			console.log(resp);
		} else {
			console.log('Error', await req.json());
		}
	}
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
	hideSchoolList () {
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
	async createSchool (evn) {
		console.log('Create a new School');
		this.hideSchoolList();
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/edu/schools`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify({
					name: 'Test School',
					description: 'Test description for the test school Enjoy!!'
				})
			}
		)
		if (req.status === 200) {
			const resp = await req.json();
			console.log(resp);
		} else {
			console.log('Error', await req.json());
		}
	}
	renderSchool (evn) {
		console.log(evn.target.getAttribute('school_id'));
	}
	render () {
		return (
			`
				<div>
					<div class="menu_schools">
						<div class="home" click="${ this.backHome.name }"></div>
						<div class="admin"><h1>Admin</h1></div>
						<div class="student" click=""><h1>Student</h1></div>
					</div>
					<div class="schools_list">
						<h1>Schools you manage</h1>
						<ul class="school_ul">
							<li>
								<h1>School name</h1>
								<p>short school description</p>
								<h2>Creator for the school</h>
								<img>
								
							</li>
						</ul>
						<div class="add_school">Create new School</div>
					</div>
					<div class="school_info">
						<h1>School Name</h1>
						<p>school description</p>
						<div class="admins">
							CREATORS
						</div>
						<div class="modules">
							<ul>
								<li class="add_module">create new module</li>
								<li>Nasa fetcher</li>
								<li>Labs</li>
								<li>Gif Workers</li>
								<li>Mail Services</li>
								<li>Whatsapp Automation</li>
								<li>Services</li>
								<li>Credentials</li>
								<li>Connections</li>
							</ul>
						</div>
						<div class="courses">
							<ul>
								<li class="add_course">
									<h3></h3>
									<h1>Add new Course</h1>
									<p>create a new course in "module_name"</p>
								</li>
								<li>
									<div class="options">
									</div>
									<img>
									<h1>Course Title</h1>
									<p>description</p>
								</li>
								<li>
									<div class="options">
									</div>
									<img>
									<h1>Course Title</h1>
									<p>description</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
			`
		);
	}
}