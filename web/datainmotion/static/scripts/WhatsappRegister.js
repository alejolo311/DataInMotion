function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
const DOMManager  = {
	render: function(html, root) {
		const component = new html();
		const node = document.createElement('div');
		root.appendChild(node);
		root.style.visibility = 'visible';
		node.outerHTML = component.render();
		const clicks = root.querySelectorAll('[click]');
		for (const el of clicks) {
			console.log(el);
			el.addEventListener('click', function func_ (evn) {
				el.removeEventListener('click', func_);
				component[el.getAttribute('click')](evn);
			});
		}
		console.log(root);
		component.root(root);
		console.log(component);
		component.onMounted();
	}
}

function uuid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

class Component {
	constructor () {

	}
	onMounted () {
	}
}

class WhatsAppRegister extends Component{
	constructor () {
		super();
		const link = document.createElement('link');
		link.href = `/static/styles/whatsapp.css?${uuid()}`;
		link.rel = 'stylesheet';
		link.setAttribute('name', 'whatsapp');
		const links = document.head.querySelectorAll('link');
		for (const link of links) {
			if (link.getAttribute('name') === 'whatsapp') {
				link.remove();
			}
		}
		document.head.appendChild(link);
	}
	root(value) {
		this._root = value;
	}
	testFunction (evn) {
		console.log('clicking');
		console.log(evn);
		return true;
	}
	onMounted () {
		console.log('Mounted Component');
	}
	async testService (evn, json, phoneNumber) {
		evn.target.style.display = 'none';
		const img = this._root.querySelector('img');
		img.src = 'url()';
		img.style.display = 'block';
		const p = this._root.querySelector('p');
		p.innerHTML = 'You will receive a message from yourself initializing the service.';
		const testReq = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/test_whatsapp_service`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				},
				body: JSON.stringify(
					{
						instance_id: json.instance_id,
						phone: phoneNumber
					}
				)
			}
		)
		const response = await testReq.json();
		console.log(response);
		const h1 = this._root.querySelector('h1');
		h1.innerHTML = 'Congrats!!';
		p.innerHTML = 'Your are now registered to DataInMotion WhatsApp service, start sending your messages now!!'
		img.style.display = 'none';
		await sleep(4000);
		this.close({});
	}
	async register (evn) {
		console.log(evn);
		evn.target.style.visibility = 'hidden';
		const phoneNumber = document.querySelector('[name="phone_test"]').value;
		document.querySelector('[name="phone_test"]').style.display = 'none';
		console.log('Start Code Scanner status');
		this._root.querySelector('img').style.display = 'block';
		// Fetch QR from server
		const res = await fetch (`${global.prot}://${global.domain}${global.apiPort}/api/v1/whatsapp_register`,
			{
				method: 'GET',
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		);
		const json = await res.json();
		console.log(json);
		if (json.url) {
			const QRcodeReq = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/${json.url}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': localStorage.getItem('token')
					}
				}
			)
			const image = await QRcodeReq.text();
			console.log(image);
			this._root.querySelector('img').outerHTML = image;
			this._root.querySelector('img').classList.add('qrcode');
			this._root.querySelector('img').style.display = 'block';
			const codeScanedReq = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/session_status`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': localStorage.getItem('token')
					},
					body: JSON.stringify(
						{
							instance_id: json.instance_id
						}
					)
				}
			)
			const status = await codeScanedReq.json();
			console.log(status);
			this._root.querySelector('img').style.display = 'none';
			// wait for the user to test the phon number
			this._root.querySelector('p').innerHTML = 'Please add yourself to the contacts list in your phone to test the registration.';
			this._root.querySelector('p').style.color = '#3277a8';
			this._root.querySelector('h2').innerHTML = '';
			evn.target.style.visibility = 'visible';
			evn.target.innerHTML = 'test phone number'
			const register = this;
			evn.target.addEventListener('click', function funct_ (evn) {
				evn.target.removeEventListener('click', funct_);
				register.testService(evn, json, phoneNumber);
			});
		}
	}
	close (evn) {
		console.log(this);
		this._root.innerHTML = '';
		this._root.style.visibility = 'hidden';
	}
	render () {
		return (
			`
			<div class="whatsapp_register">
				<h1>WhatsApp Register</h1>
				<p>Register to whatsapp to start sending your free messages, provide your phone number,
				 then open the "WhatsApp Web" option in your phone's app and press register to generate the QRCode.</p>
				<h2></h2>
				<img class="qrcode"/>
				<input name="phone_test" placeholder="Your phone number"></input>
				<button class="register" click="${ this.register.name }">register</button>
			</div>
			`
		);
	}
}