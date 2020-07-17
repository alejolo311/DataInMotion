async function running_test(nodeId) {
	let verifying = false;
	let choosing_gif = false;
	while (true) {
		await timeSleep(2000);
		const resp = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/check_response?id=${nodeId}`, {
			method: "GET",
			headers: {
				'Accept': 'application/json',
			},
		});
		let json = await resp.json();
		if (json.status !== 'choose_gif') {
			choosing_gif = false;
		}
		console.log(json.status);
		// console.log(json.messages);
		// console.log(json.messages[json.messages.length - 1]);
		$('.last_state h1').html(json.messages[json.messages.length - 1]);
		$('.loading ul').empty();
		for (mess of json.messages) {
			const li = $(`<li>${mess}</li>`);
			$('.loading ul').append($(li));
		}
		if (json.status === 'completed') {
			console.log('Test Completed');
			$('.loading').css('display', 'none');
			showConsole(json.logger);
			break;
		} else if (json.status === 'verifying') {
			if (verifying === false) {
				const qrcode = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/web_whatsapp_verify?id=${json.node_id}`, {
					method: "GET"
				});
				const res_qrcode = await qrcode.text();
				console.log(res_qrcode);
				const qr_div = $(res_qrcode);
				if (res_qrcode !== '' && res_qrcode !== 'Failed') {
					verifying = true;
				}
				$('.qr').css('display', 'block');
				$('.qr').append($(qr_div));
				$('.close_qr').on('click', function (evn) {
					$('.qr').css('display', 'none');
				});
			}
		} else if (json.status === 'choose_gif') {
			const len = json.messages.length - 1;
			if (!choosing_gif) {
				const gif_fetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/choose_gif?id=${json.messages[len]}`);
				const gifs = await gif_fetch.text();
				$('.html_viewer').html(gifs);
				$('.html_viewer').css('display', 'block');
				choosing_gif = true;
			}
		} else if (json.status === 'error') {
			$('.loading').css('display', 'none');
			break;
		}else {
			$('.qr').empty();
			$('.qr').css('display', 'none');
			$('.html_viewer').empty();
			$('.html_viewer').css('display', 'none');
			continue;
		}
	}
}

function setOpsListeners() {
	$('.test_button').on('click', function (evn) {
		const nodeId = $(this).attr('n_id');
		// The next wil send a GET request to DataInMotion AP
		// to run the test and return the response
		setTimeout('', 2000);
		$('.new_node_cont').css('display', 'none');
		$('.loading').css('display', 'block');

		$.ajax({
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${nodeId}/run`,
			crossDomain: true,
			contentType: 'application/json',
			dataType: 'json',
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			success: function (data) {
				console.log(data);
				return running_test(nodeId);
			},
			error: function (error) {
				console.log(error);
				$('.loading').css('display', 'none');
			}
		});

		console.log(board);
	});
}
async function timeSleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}