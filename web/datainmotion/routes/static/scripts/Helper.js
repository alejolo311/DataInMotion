class MenuHelper extends Component {
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/Helper.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'helper');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'helper') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	async onMounted() {
		const helper = this._root;
		const newNodeBtn = document.querySelector('[menu="nodes"]');
		const computed = window.getComputedStyle(newNodeBtn, null);
		const helpComputed = window.getComputedStyle(helper, null);
		const width = Number(computed.width.slice(0, computed.width.length - 2));
		const height = Number(computed.height.slice(0, computed.height.length - 2));
		const helpHeight = Number(helpComputed.height.slice(0, helpComputed.height.length - 2));
		const left = Math.round(width + newNodeBtn.getBoundingClientRect().left);
		const top = Math.round(newNodeBtn.getBoundingClientRect().top - (helpHeight));
		console.log(top);
		console.log(left, newNodeBtn.getBoundingClientRect().left);
		helper.style.left = left + 8;
		helper.style.top = top;
		newNodeBtn.style.borderBottom = '1px solid white';
		helper.querySelector('p').innerHTML = 'Start creating a new Node.'

		// const container = document.getElementsByClassName('container')[0];
		// const wind = document.querySelector('#helper');
		// const computed = window.getComputedStyle(document.body, null);
		// wind.style.width = computed.width;
		// wind.style.height = computed.height;
		// const focusObject = this._root.querySelector('ul').querySelector('li');
		// const description = this._root.querySelector('p');
		// console.log(focusObject, description);
		// const menuNodes = document.querySelector('.sub_nav');
		// // console.log(menuNodes, menuNodes.innerHTML, window.getComputedStyle(menuNodes, null));
		// const newMenuNodes = document.createElement('ul');
		// const childs = menuNodes.childNodes;
		// const newChilds = newMenuNodes.childNodes;
		// for (let i = 0; i < childs.length; i++) {

		// 	try {
		// 		newChilds[i].style = window.getComputedStyle(childs[i], null);
		// 	} catch (err) {
		// 		continue;
		// 	}
		// }
		// focusObject.innerHTML = '';
		// focusObject.appendChild(newMenuNodes);
		// focusObject.parentNode.classList.add('utility_menu');
		// const mainContainer = focusObject.parentNode.parentNode;
		// mainContainer.classList.add('top_bar');
		// mainContainer.style.height = 60;
		// mainContainer.style.paddingLeft = 20;
		// mainContainer.style.width = 'fit-content';
		// mainContainer.style.borderRadius = '8px';
		// mainContainer.style.position = 'absolute';
		// mainContainer.style.top = menuNodes.getBoundingClientRect().top - 10;
		// mainContainer.style.left = menuNodes.getBoundingClientRect().left - 20;
		// newMenuNodes.outerHTML = menuNodes.outerHTML;
		// newMenuNodes.style = window.getComputedStyle(menuNodes, null);
		// console.log(newMenuNodes);
		// console.log(this._root);
	}
	render () {
		return (
			`
				<p>Info description</p>
			`
		);
	}
}