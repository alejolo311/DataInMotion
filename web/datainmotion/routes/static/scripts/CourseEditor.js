class CourseEditor extends Component {
	constructor() {
		super();
		const link = document.createElement('link');
		console.log(global.domain);
		link.href = `${global.prot}://${global.domain}/static/styles/CourseEditor.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'course_editor');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'course_editor') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	render () {
		return (
			`
				<div>
					<div id="courses">
						<ul>
						</ul>
						<div class="add_course">Add Course</div>
					</div>
					<div id="editor">
						<div class="creator_tools">
							<button>save</button>
						</div>
						<div class="title_container">
							<input placeholder="Title"></input>
						</div>
						<div class="description_container">
							<textarea placeholder="Description"></textarea>
						</div>
					</div>
				</div>
			`
		);
	}
}