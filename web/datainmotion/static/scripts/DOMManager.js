const DOMManager  = {
	render: function(html, root, params) {
		const component = new html();
		const node = document.createElement('div');
		root.appendChild(node);
		root.style.visibility = 'visible';
		node.outerHTML = component.render();
		const clicks = root.querySelectorAll('[click]');
		component.functions = {};
		for (const el of clicks) {
			console.log(el);
			const func_ = function (evn) {
				evn.target.removeEventListener('click', func_);
				component[evn.target.getAttribute('click')](evn);
			}
			el.addEventListener('click', func_);
			component.functions[el.getAttribute('click')] = func_;
		}
		// console.log(root);
		component.root(root);
		// console.log(params);
		component.props(params);
		console.log('Mounted Component: ', component);
		component.onMounted();
	}
}
class Component {
	constructor () {

	}
	onMounted () {
	}
	root(value) {
		this._root = value;
	}
	props(value) {
		this._props = value;
	}
}
function uuid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}