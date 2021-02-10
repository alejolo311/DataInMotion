class Edu extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/Edu.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'edu');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'edu') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	async onMounted () {
		// check if user is authorized
		const req = await fetch(
			`${global.prot}://${global.domain}${global.apiPort}/api/v1/auth/`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		);
		if (req.status !== 200) {
			window.location.replace(`${global.prot}://${global.domain}/login`);
		}
		const comp = this;
		const home = this._root.querySelector('.edu_home');
		home.addEventListener('click', function (evn) {
			window.location.replace(`${global.prot}://${global.domain}`);
		});
		const edu_admin = this._root.querySelector('.edu_admin');
		edu_admin.addEventListener('click', function (evn) {
			comp.renderSchoolManager();
		});
		const edu_student = this._root.querySelector('.edu_student');
		edu_student.addEventListener('click', function (evn) {
			window.location.replace(`${global.prot}://${global.domain}`);
		});
	}
	renderSchoolManager () {
		DOMManager.render(
			SchoolsManager,
			document.getElementById('admin')
		);
	}
	renderPublicCourses () {

	}
	render() {
		return (
			`
				<div class="edu_banner">
					<div class="logo">
						<h1></h1>
						<h2>Explore<br>Create and Learn!!</h2>
						<p>Choose:<br><br>
							- <span class="highlight">Admin</span>, 
							to create Schools, Modules and courses. or
							<br>
							- <span class="highlight">Student</span>, 
							to start exploring the public courses.
							</p>
					</div>
					<div class="edu_home"></div>
					<div id="menu">
						<div class="edu_admin"><h1>Admin</h1></div>
						<div class="edu_student"><h1>Student</h1></div>
					</div>
				</div>
			`
		);
	}
}