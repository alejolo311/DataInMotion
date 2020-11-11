// Controls the nodes popup elements like colorpicker
// Grabber etc...
function unbindAll () {
	console.log('unbinding all container content');
	unbindContainer();
	unbinNodeEditor();
	unbindWpp();
}
function unbindContainer () {
	const container = document.querySelector('.container');
	for (const child of container.querySelectorAll('*')) {
		const $nd = $(child);
		$nd.unbind();
		$nd.off();
		$nd.off('click');
		$nd.off('mousemove');
		$nd.off('mouseleave');
		$nd.off('keypress');
	}
	$('.container').children().remove();
}
function unbindWpp () {
	const wppCont = document.querySelector('.wpp_cont');
	const wppChilds = wppCont.querySelectorAll('*');
	for (const nod of wppChilds) {
		const $nd = $(nod);
		$nd.unbind();
		$nd.off();
		$nd.off('click');
		$nd.off('mousemove');
		$nd.off('mouseleave');
		$nd.off('keypress');
	}
}
function unbinNodeEditor () {
	const newNodeCont = document.querySelector('.new_node_cont');
	const childs = newNodeCont.querySelectorAll('*');
	for (const nod of childs) {
		const $nd = $(nod);
		$nd.unbind();
		$nd.off();
		$nd.off('click');
		$nd.off('mousemove');
		$nd.off('mouseleave');
		$nd.off('keypress');
	}
}
function unbindCanvas () {
	const container = document.querySelector('canvas');
	container.off();
	container.off('click');
	container.off('mousemove');
	container.off('mouseleave');
	container.off('keypress');
}