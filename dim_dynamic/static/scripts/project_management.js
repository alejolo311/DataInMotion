let board = {};

function createMenu (position, items) {
	const menu = $('.menus');
	menu.css('visibility', 'visible');
	menu.css('left', position - 40);
	for (item of items) {
		let menuString = '';
		// console.log(item);
		menuString += '<li>' + item[0] + '</li>';
		const option = $(menuString);
		option.on('click', item[1]);
		menu.append(option);
	}
	menu.mouseleave(function () {
		$(this).css('visibility', 'hidden');
	});
};

function createProject () {
	console.log('create project');
	const newProject = {};
	newProject.name = prompt('Project name: >');
	newProject.boards = [];
	newProject.boards.push(prompt('Board name: >'));
	console.log(newProject);
}
function openProject() {
	console.log('Open an existing project');
}
function openBoard() {
	console.log('Open an existing board');
}
function createBoard() {
	console.log('Create a new board');
}
function newNode () {
	console.log('Create a new node');
}
function setProjectMenu() {
	$('[menu=project]').on('click', function (evn) {
		
		$('.menus').empty();
		const items = [];
		// items.push(['create new project', createProject])
		// items.push(['open project', openProject]);
		items.push(['create new board', createBoard]);
		items.push(['open board', openBoard]);
		createMenu(evn.pageX, items);
		

	});
	$('[menu=nodes]').on('click', function (evn) {
		$('.menus').empty();
		const items = [];
		items.push(['new node', newNode])
		createMenu(evn.pageX, items);
	});
}