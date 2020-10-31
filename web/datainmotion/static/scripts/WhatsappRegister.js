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
	async removeSession() {
		const req = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/whatsapp_session`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		const resSession = await req.json();
		console.log(resSession);
		this.close({});
	}
	async onMounted () {
		console.log('Mounted Component');
		// check if session exists
		const req = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/whatsapp_sessions`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': localStorage.getItem('token')
				}
			}
		)
		const resSession = await req.json();
		console.log(resSession);
		const comp = this;
		if (resSession.state === 'true') {
			const register = this._root.querySelector('.register');
			register.removeEventListener('click', this.functions['register']);
			register.innerHTML = 'remove session';
			const h1 = comp._root.querySelector('h1');
			h1.innerHTML = 'Session stored';
			const p = comp._root.querySelector('p');
			p.innerHTML = 'You have and open session do you want delete it?';
			const phone = comp._root.querySelector('input');
			phone.style.display = 'none';
			register.addEventListener('click', function func_(evn) {
				register.removeEventListener('click', func_);
				comp.removeSession();
			});
			console.log('remove session');
		}
	}
	async testService (evn, json, phoneNumber) {
		evn.target.style.display = 'none';
		const img = this._root.querySelector('img');
		img.src = '/static/images/wait.gif';
		img.style.display = 'block';
		const h1 = this._root.querySelector('h1');
		const p = this._root.querySelector('p');
		h1.innerHTML = 'Sending test message';
		p.innerHTML = 'You will receive a message from yourself initializing the service.<br>This process can take more than a minute.';
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
		if (response.error) {
			console.log(response);
			const comp = this;
			h1.innerHTML = 'Oops!!';
			p.innerHTML = `Seems like the session is not saved, please try again:
							<br>1 - Delete the last session in your phone's app.
							<br>2 - Place the camera on the below image and click the register button`;
			evn.target.innerHTML = 'try again';
			evn.target.style.display = 'block';
			evn.target.style.visibility = 'visible';
			evn.target.addEventListener('click', function func_ (evn) {
				evn.target.removeEventListener('click', func_);
				comp.register(evn);
			});
			// console.log(await testReq.json())
		} else {
			console.log(response);
			h1.innerHTML = 'Congrats!!';
			p.innerHTML = 'Your are now registered to DataInMotion WhatsApp service, start sending your messages now!!'
			img.src = '/static/images/whatsapp_logo.png';
			evn.target.style.display = 'block';
			evn.target.style.visibility = 'visible';
			evn.target.innerHTML = 'continue';
			const comp = this;
			evn.target.addEventListener('click', function func_(evn) {
				evn.target.removeEventListener('click', func_);
				comp.close({});
			});
		}
		// await sleep(10000);
		// this.close({});
	}
	async register (evn) {
		console.log(evn);
		// Hidde button and input and display the loading image
		evn.target.style.visibility = 'hidden';
		const phoneNumber = document.querySelector('[name="phone_test"]').value;
		this.phoneNumber = phoneNumber;
		document.querySelector('[name="phone_test"]').style.display = 'none';
		console.log('Start Code Scanner status');
		this._root.querySelector('img').style.display = 'block';
		const p = this._root.querySelector('p');
		p.innerHTML = 'Generating the QRCode, prepare to scan it.'
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
			// hide the loading image
			this._root.querySelector('img').style.display = 'none';
			// wait for the user to test the phon number
			this._root.querySelector('h1').innerHTML = 'Session stored';
			this._root.querySelector('p').innerHTML = 'Please add yourself to the contacts list in your phone to test the registration, then press the button.';
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
		const button = this._root.querySelector('.register');
		for (const func in this.functions) {
			
			button.removeEventListener('click', this.functions[func]);
		}
		this._root.innerHTML = '';
		this._root.style.visibility = 'hidden';
	}
	render () {
		return (
			`
			<div class="whatsapp_register">
				<h1>WhatsApp Register</h1>
				<p>Register to whatsapp to start sending your free messages.
				 Just follow this simple steps:
				 <br>
				 <br> <span style="color: #33d6a0; font-weight: bold;">1</span>
				 	 - Provide your phone number.
				 <br> <span style="color: #33d6a0; font-weight: bold;">2</span>
				 	 - Open the "WhatsApp Web" option in your phone's app, then the + icon.
				 <br> <span style="color: #33d6a0; font-weight: bold;">3</span>
					  - Press register to generate the QRCode, and scan it with your phone.
				</p>
				<h2></h2>
				<img class="qrcode"/>
				<input name="phone_test" placeholder="Your phone number"></input>
				<button class="register" click="${ this.register.name }">register</button>
				<button class="close" click="${ this.close.name }"></button>
			</div>
			`
		);
	}
}