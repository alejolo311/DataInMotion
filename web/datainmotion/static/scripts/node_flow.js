let tmpAnPm;
function newNodeFlow(node, id) {
	$('.node_next').html('');
	$('.node_back').html('');
	const reloadHeaders = function () {
		
		$('[list=headers]').empty();
		// console.log(node);
		for (key in node.headers) {
			// console.log(key, node.headers[key]);
			const li = $('<li></li>');
			$(li).attr('key', key);
			$(li).attr('value', node.headers[key]);
			$(li).text(key + ':  ' + node.headers[key]);
			$(li).on('click', function (evn) {
				const k = $(this).attr('key');
				const val = $(this).attr('value');
				$('[name=h_key] ').val(k);
				$('[name=h_value] ').val(val);
				delete node.headers[k];
				reloadHeaders();
			});
			$('[list=headers]').append($(li));
		}
	};
	// Display the timeline progress
	$('.progress li').mousemove(function (evn) {
		$(this).find('h1').css('display', 'block');
	});
	$('.progress li').mouseleave(function (evn) {
		$(this).find('h1').css('display', 'none');
	});
	let actual = 0;
	// Set the colors to the progress points
	const on = 'yellow';
	const off = 'purple';
	$('[pos]').css('background-color', off);
	$('[pos=0]').css('background-color', on);
	// Event listeners to timeline progress points
	$('.progress li').on('click', function (evn) {
		const pos = $(this).attr('pos');
		$('.step').css('display', 'none');
		$('[step="' + pos + '"]').css('display', 'block');
		switch (actual) {
			case 0:
				const name = $('[name=n_name]').val();
				console.log(name);
				if (name !== '' && name !== undefined) {
					node.name = name;
				}
				break;
			case 1:
				const service = $('[name=is_service]').prop('checked');
				if (service) {
					node.type = 'service';
				} else {
					node.type = 'custom';
				}
				break;
			case 2:
				const type = $('[name=w_type]').val();
				node.work_type = type;
				break;
			case 3:
				const url = $('[name=n_url]').val();
				if (url !== '') {
					node.api_url = url;
				}
				break;
			case 6:
				const am = $('[name=an_mode]').val();
				console.log(am);
				if (am === 'none') {
					tmpAnPm = [];
					node.analisis_mode = '';
					node.analisis_params = [];
					$('.new_node_cont').css('display', 'none');
					saveNode(node);
				} else {
					$('[mode=' + am + ']').css('display', 'flex');
				}
			default:
				break;
		}
		console.log(pos);
		let am;
		$('[pos]').css('background-color', off);
		$('[pos=' + pos.toString() + ']').css('background-color', on);
		switch (Number(pos)) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				console.log('reload headers');
				reloadHeaders();
				break;
			case 5:
				reloadData();
				break;
			case 6:
				am = $('[name=an_mode]').val();
				getAMInfo(am);
				break;
			case 7:
				am = $('[name=an_mode]').val();
				getAMInfo(am);
				console.log(am);
				if (am === 'none') {
					tmpAnPm = [];
					node.analisis_mode = '';
					node.analisis_params = [];
					$('.new_node_cont').css('display', 'none');
					saveNode(node);
					return null;
				} else {
					$('[mode]').css('display', 'none');
					let display = 'flex';
					if (am === 'statistics') {
						display = 'block';
					}
					$('[mode=' + am + ']').css('display', display);
					if (node.analisis_mode !== 'statistics') {
						reloadParams();
					} else {
						reloadStatisticsParams();
					}
				}
				break;
		}
		$('[pos="' + pos + '"]').toggleClass('actual');
		$('[pos="' + actual + '"]').toggleClass('actual');
		actual = pos;
	});
	$('.li_save').on('click', function () {
		saveNode(node);
	});
	let pos = 0;
	tmpAnPm = node.analisis_params;
	const width = window.outerWidth + 400;
	const height = window.outerHeight + 400;
	$('.new_node_cont').css('display', 'block');
	$('.new_node_cont').css('width', width);
	$('.new_node_cont').css('height', height);
	$('[step=0]').css('display', 'block');
	// This block defines the flow buttons listeners
	// forward step 0 to 1
	$('[step=0]').find('.node_next').on('click', function (evn) {
		const name = $('[name=n_name]').val();
		console.log(name);
		if (name !== '' && name !== undefined) {
			node.name = name;
			$('.step').css('display', 'none');
			$('[step=1]').css('display', 'block');
			$('[pos=0]').css('background-color', off);
			$('[pos=1]').css('background-color', on);
			pos = 1;
		}
	});
	// Close node options by clicking back
	$('[step=0]').find('.node_back').on('click', function (evn) {
		$('.new_node_cont').css('display', 'none');
		$('[step]').find('.node_back').unbind('click');
		$('[step]').find('.node_next').unbind('click');
		location.reload();
	});
	// forward step 1 to 2
	$('[step=1]').find('.node_next').on('click', function () {
		const service = $('[name=is_service]').prop('checked');
		if (service) {
			node.type = 'service';
		} else {
			node.type = 'custom';
		}
		$('.step').css('display', 'none');
		$('[step=2]').css('display', 'block');
		$('[pos=1]').css('background-color', off);
		$('[pos=2]').css('background-color', on);
	});
	// backward step 1 to 0
	$('[step=1]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=0]').css('display', 'block');
		$('[pos=1]').css('background-color', off);
		$('[pos=0]').css('background-color', on);
	});
	// forward step 2 to 3 or 5 depending on the work_type selected
	$('[step=2]').find('.node_next').on('click', function (evn) {
		const type = $('[name=w_type]').val();
		node.work_type = type;
		if (type === 'request') {
			$('.step').css('display', 'none');
			$('[step=3]').css('display', 'block');
			$('[pos=2]').css('background-color', off);
			$('[pos=3]').css('background-color', on);
		} else {
			$('.step').css('display', 'none');
			$('[step=5]').css('display', 'block');
			$('[pos=2]').css('background-color', off);
			$('[pos=5]').css('background-color', on);
		}
	});
	// backward step 2 to 1
	$('[step=2]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=1]').css('display', 'block');
		$('[pos=2]').css('background-color', off);
		$('[pos=1]').css('background-color', on);
	});
	// forward step 3 to 4
	$('[step=3]').find('.node_next').on('click', function (evn) {
		const url = $('[name=n_url]').val();
		if (url !== '') {
			node.api_url = url;
			$('.step').css('display', 'none');
			$('[step=4]').css('display', 'block');
			$('[pos=3]').css('background-color', off);
			$('[pos=4]').css('background-color', on);
			reloadHeaders();
		}
	});
	// backward step 3 to 2
	$('[step=3]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=2]').css('display', 'block');
		$('[pos=3]').css('background-color', off);
		$('[pos=2]').css('background-color', on);
	});
	// forward step 4 to 5
	$('[step=4]').find('.node_next').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=5]').css('display', 'block');
		$('[pos=4]').css('background-color', off);
		$('[pos=5]').css('background-color', on);
		reloadData();
	});
	// backward step 4 to 3
	$('[step=4]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=3]').css('display', 'block');
		$('[pos=4]').css('background-color', off);
		$('[pos=3]').css('background-color', on);
	});
	// forward step 5 to 6
	$('[step=5]').find('.node_next').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=6]').css('display', 'block');
		$('[pos=5]').css('background-color', off);
		$('[pos=6]').css('background-color', on);
	});
	// backward step 5 to 4 or 2 depending
	$('[step=5]').find('.node_back').on('click', function (evn) {
		if (node.work_type == 'request') {
			$('.step').css('display', 'none');
			$('[step=4]').css('display', 'block');
			$('[pos=5]').css('background-color', off);
			$('[pos=4]').css('background-color', on);
		} else {
			$('.step').css('display', 'none');
			$('[step=2]').css('display', 'block');
			$('[pos=5]').css('background-color', off);
			$('[pos=2]').css('background-color', on);
		}
	});
	// forward step 6 to 7
	$('[step=6]').find('.node_next').on('click', function (evn) {
		const am = $('[name=an_mode]').val();
		console.log(am);
		if (am === 'none') {
			tmpAnPm = [];
			node.analisis_mode = '';
			node.analisis_params = [];
			$('.new_node_cont').css('display', 'none');
			$('.step').css('display', 'none');
			saveNode(node);
			return null;
		} else {
			$('.step').css('display', 'none');
			$('[step=7]').css('display', 'block');
			$('[pos=6]').css('background-color', off);
			$('[pos=7]').css('background-color', on);
			$('[mode]').css('display', 'none');
			$('[mode=' + am + ']').css('display', 'flex');
			if (node.analisis_mode !== 'statistics') {
				reloadParams();
			} else {
				$('[mode=' + am + ']').css('display', 'block');
				if (node.analisis_params === []) {
					node.analisis_params = [{'parameters': {}, 'samples': {}}];
				}
				reloadStatisticsParams();
			}
		}
	});
	// backward step 6 to 5
	$('[step=6]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=5]').css('display', 'block');
		$('[pos=6]').css('background-color', off);
		$('[pos=5]').css('background-color', on);
	});
	// forward step 7 to save()
	$('[step=7]').find('.node_next').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('.new_node_cont').css('display', 'none');
		const finAP = [];
		for (params of tmpAnPm) {
			if (params !== null) {
				finAP.push(params);
			}
		}
		node.analisis_params = finAP;
		node.string = $('[name=string]').val();
		saveNode(node);
		return null;
	});
	// backward step 7 to 6
	$('[step=7]').find('.node_back').on('click', function (evn) {
		$('.step').css('display', 'none');
		$('[step=6]').css('display', 'block');
	});
	// -------------------end flow listeners--------------
	//
	//
	// Detect when a header is added
	$('[step=4] button').on('click', function (evn) {
		const key = $('[name=h_key] ').val();
		let value = $('[name=h_value] ').val();
		if (key !== '' && value !== '') {
			node.headers[key] = value;
			reloadHeaders();
			$('[name=h_key] ').val('');
			$('[name=h_value] ').val('');
		}
	});
	// Detects Auth checkbox
	// show the form with the oauth required fields
	$('[name=auth_check]').on('click', function () {
		console.log($(this).prop('checked'));
		const checked = $(this).prop('checked');
		if (checked) {
			console.log('show oauth form');
			$('.auth_inputs').css('display', 'block');
		} else {
			console.log('hidde oauth form');
			$('.auth_inputs').css('display', 'none');
		}
	});
	$('[name=auth-protocol]').change(function () {
		console.log($(this).val());
	});
	const reloadData = function () {
		$('[list=data]').empty();
		for (key in node.data) {
			// console.log(key, node.data[key]);
			const li = $('<li></li>');
			$(li).attr('key', key);
			$(li).attr('value', node.data[key]);
			$(li).text(key + ':  ' + node.data[key]);
			$(li).on('click', function (evn) {
				const k = $(this).attr('key');
				const val = $(this).attr('value');
				$('[name=d_key] ').val(k);
				$('[name=d_value] ').val(val);
				delete node.data[k];
				reloadData();
			});
			$('[list=data]').append($(li));
		}
	};
	// Detects inputs on the data fields
	$('[step=5] button').on('click', function () {
		const key = $('[name=d_key] ').val();
		let value = $('[name=d_value] ').val();
		if (key !== '' && value !== '') {
			node.data[key] = value;
			reloadData();
			$('[name=d_key] ').val('');
			$('[name=d_value] ').val('');
		}
	});
	// Detects changes in the analisis mode variable
	$('[name=an_mode]').change(function () {
		const val = $(this).val();
		console.log(val);
		if (node.analisis_mode === val) {
			tmpAnPm = node.analisis_params;
		} else {
			tmpAnPm = [];
			if (val === 'statistics') {
				tmpAnPm.push({'parameters': {}, 'samples': {}});
			}
		}
		node.analisis_mode = val;
		$('[mode]').css('display', 'none');
		$('[mode=' + val + ']').css('display', 'flex');
		getAMInfo(val);
		if (val !== 'statistics') {
			reloadParams();
		} else {
			reloadStatisticsParams();
		}
	});
	// reload params list
	const reloadParams = function () {
		$('[list=params]').empty();
		let pos = 0;
		if (tmpAnPm.length > 0) {
			for (param of tmpAnPm) {
				const li = $('<li pos="' + pos + '"></li>');
				let string = '';
				for (key in param) {
					//string += key + ': ';
					if (key == 'discard') {
						if (param['discard']) {
							string += '<span style="font-weight: bold; color: grey;">discard occurence</span>  ';
						}
						//string += param[key] + ', ';
					} else {
						string += param[key] + ', ';
					}
				}
				$(li).html(string.slice(0, -2));
				$(li).on('click', function () {
					const p = $(this).attr('pos');
					if (node.analisis_mode == 'comparision') {
						$('[name=an_d_key]').val(tmpAnPm[p].key);
						$('[name=cond]').val(tmpAnPm[p].cond);
						$('[name=comp_value]').val(tmpAnPm[p].comp);
					} else if (node.analisis_mode == 'replace') {
						const key = $('[name=r_key]').val(tmpAnPm[p].key);
					} else if (node.analisis_mode == 'JSON') {
						$('[name=j_key]').val(tmpAnPm[p].key);
						$('[name=j_path]').val(tmpAnPm[p].path);
					} else if (node.analisis_mode == 'HTML') { 
						$('[name=html_occ]').val(tmpAnPm[p].occurrence);
						$('[name=html_stop]').val(tmpAnPm[p].stop);
						$('[name=html_disc]').prop('checked', tmpAnPm[p].discard);
					}
					delete tmpAnPm[p];
					reloadParams();
				});
				pos++;
				$('[list=params]').append($(li));
			}
		}
	}
	// Detect input elements to analisis_params when analisis_mode is 
	// Comparision
	$('[mode=comparision] button').on('click', function (evn) {
		const key = $('[name=an_d_key]').val();
		const condition = $('[name=cond]').val();
		const comp = $('[name=comp_value]').val();
		if (key !== '' && condition !== '' && comp !== '') {
			// console.log('store comparision params');
			// console.log(key, condition, comp);
			tmpAnPm.push({'key': key, 'cond': condition, 'comp': comp});
			if (node.analisis_mode !== 'statistics') {
				reloadParams();
			} else {
				reloadStatisticsParams();
			}
			$('[name=an_d_key]').val('');
			$('[name=cond]').val('==');
			$('[name=comp_value]').val('');
		}
	});
	// Detect input elements to analisis_params when analisis_mode is 
	// replace
	$('[mode=replace] button').on('click', function (evn) {
		const key = $('[name=r_key]').val();
		const string = $('[name=string]').val();
		if (key !== '' && string !== '') {
			// console.log('store comparision params');
			// console.log(key);
			tmpAnPm.push({'key': key});
			node.string = string;
			reloadParams();
			$('[name=r_key]').val('');
		}
	});
	// Detect input elements to analisis_params when analisis_mode is 
	// JSON
	$('[mode=JSON] button').on('click', function (evn) {
		const key = $('[name=j_key]').val();
		const path = $('[name=j_path]').val();
		if (key !== '' && path !== '') {
			// console.log('store comparision params');
			// console.log(key);
			tmpAnPm.push({'key': key, 'path': path});
			reloadParams();
			$('[name=j_key]').val('');
			$('[name=j_path]').val('');
		}
	});
	// Detect input elements to analisis_params when analisis_mode is 
	// HTML
	$('[mode=HTML] button').on('click', function (evn) {
		// html_disc, html_occ, html_stop
		const occurrence = $('[name=html_occ]').val();
		const discard = $('[name=html_disc]').prop('checked');
		const stop = $('[name=html_stop]').val();
		if (key !== '' && stop !== '') {
			// console.log('store comparision params');
			// console.log(key);
			tmpAnPm.push({'occurrence': occurrence, 'stop': stop, 'discard': discard});
			reloadParams();
			$('[name=html_stop]').val('');
			$('[name=html_occ]').val('');
		}
	});
	// Detect input elements to analisis_params when analisis_mode is 
	// gen_signature
	$('[mode=gen_signature] input').change(function (evn) {
		// html_disc, html_occ, html_stop
		const k_secret = $('[name=g_key1]').val();
		const t_secret = $('[name=g_key2]').val();
		if (k_secret !== '' && t_secret !== '') {
			tmpAnPm= [];
			tmpAnPm.push(k_secret);
			tmpAnPm.push(t_secret);
		}
	});
	// Detect input elements to analisis_params when analisis_mode is 
	// get_updates
	$('[mode=get_updates] button').on('click', function (evn) {
		// html_disc, html_occ, html_stop
		const key = $('[name=upd_key]').val();
		const path = $('[name=upd_path]').val();
		if (key !== '' && path !== '') {
			tmpAnPm.push({'key': key, 'path': path});
			reloadParams();
			$('[name=upd_key]').val('');
			$('[name=upd_path]').val('');
		}
	});
	// Draw the parameters stored for Statistics
	const reloadStatisticsParams = function () {
		const listSamples = $('[list=statistics_samples]');
		const listParams = $('[list=statistics_parameters]');
		$(listSamples).empty();
		$(listParams).empty();
		const samplesTitle = $('<h1>Samples</h1>');
		const paramsTitle = $('<h1>Parameters</h1>');
		$(listSamples).append(samplesTitle);
		$(listParams).append(paramsTitle);
		const changeParam = function (obj) {
			const type = $(obj).attr('type');
			const key = $(obj).attr('key');
			const param = tmpAnPm[0][type][key];
			delete tmpAnPm[0][type][key];
			reloadStatisticsParams();
			$('[name=' + type + ']').val(key);
		};
		console.log(tmpAnPm);
		for (sample in tmpAnPm[0]['samples']) {
			console.log(sample);
			const li = $('<li></li>');
			$(li).text(sample);
			$(li).attr('type', 'samples');
			$(li).attr('key', sample);
			$(li).on('click', function (evn) {
				changeParam(this);
			});
			$(listSamples).append($(li));
		}
		for (parameter in tmpAnPm[0]['parameters']) {
			console.log(parameter);
			const li = $('<li></li>');
			$(li).attr('type', 'parameters');
			$(li).attr('key', parameter);
			$(li).text(parameter);
			$(li).on('click', function (evn) {
				changeParam(this);
			});
			$(listParams).append($(li));
		}
	}
	// Detect input elements to analisis_params when analisis_mode is 
	// statistics
	// for parameters
	$('[mode=statistics] button[for="parameters"]').on('click', function (evn) {
		const parameter = $('[name=parameters]').val();
		if (parameter !== '') {
			tmpAnPm[0]['parameters'][parameter] = true;
			$('[name=parameters]').val('');
			reloadStatisticsParams();
		}
	});
	// for samples
	$('[mode=statistics] button[for="samples"]').on('click', function (evn) {
		const sample = $('[name=samples]').val();
		if (sample !== '') {
			tmpAnPm[0]['samples'][sample] = true;
			$('[name=samples]').val('');
			reloadStatisticsParams();
		}
	});
	reloadData();
}

function getAMInfo (mode) {
	let info;
	if (mode == 'comparision') {
		info = 'Compares a list of values and returns to you a true or false value';
	} else if (mode == 'JSON') {
		info = 'Extracts the value at the given path from the data and store it with the name you define, in the path you can define the keyword "random" to choose a random index in a list';
	} else if (mode == 'HTML') {
		info = 'Scrappe an HTML or a text file to find the occurrencies and extract the values until the stop value and store it as you want to name it<br>You can use wildcards "*" to extract values from the previous nodes and put them in the occurrence pattern<br>Example: my_url = sponges<br>href="some/url/*my_url*<br> Result -> some/url/sponges';
	} else if (mode == 'replace') {
		info = 'Finds the {key} formats and replace them with the correspoding data value, the keys are a cumulative of all the output, lom that means, you can find a value of a node much further back in the flow<br>And the output of this node will be stored with the key "content" to be used in the forward of the flow<br>Run a test and check the output for the keys you need';
	} else if (mode == 'gen_signature') {
		info = 'Uses the headers from the connection node and the keys stored in the data to create a HMAC-SHA1 signature';
	} else if (mode == 'none') {
		info = '';
	} else if (mode == 'media_player') {
		info = 'when this option is selected, the caller node should pass a value with the key "url" in order to load the source file, if you connect this node with a download node, we will handle the media for you'
	} else if (mode == 'get_updates'){
		info = 'set the key to store the extracted data, and the path to get the value<br>this options finds if there is new records in the input data and extract the last one by checking the parameter counter stored in the node to use this option set the value "count" to 0 or whatever value you need in the previous section';
	} else if (mode == 'statistics'){
		info = 'samples:<br>parameters:<br>';
	}
	$('[content=analisis_mode]').html(info);
	$('[content=analisis_info]').html(info);
}

function saveNode(node) {
	const name = $('[name=n_name]').val();
	console.log(name);
	if (name !== '' && name !== undefined) {
		node.name = name;
	}
	const url = $('[name=n_url]').val();
	if (url !== '') {
		node.api_url = url;
	}
	const finAP = [];
	for (params of tmpAnPm) {
		if (params !== null) {
			finAP.push(params);
		}
	}
	node.analisis_params = finAP;
	const workerType = $('[name=w_type]').val();
	node.work_type = workerType;
	node.string = $('[name=string]').val();
	$.ajax({
		url: `http://${global.apiDirection}:8080/api/v1/nodes/${node.id}/save`,
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(node),
		success: function (resp) {
			console.log(resp);
			location.reload();
		}
	});
}
async function loadContactList(nodeId) {
	const node_fetch = await fetch(`http://${global.apiDirection}:8080/api/v1/nodes/${nodeId}`);
	const node = await node_fetch.json();
	return node;
}
async function loadContactsNodes() {
	const boardId = $('.container').attr('board_id');
	const conts_lists_fetch = await fetch(`http://${global.apiDirection}:8080/api/v1/boards/${boardId}/contacts_list`);
	const conts_lists = await conts_lists_fetch.json();
	return conts_lists;
}
async function WhatsAppFlow(node) {
	const col = '#00bfa5';
	let tmpGif = node.data.gif;
	const reloadContactsView = function () {
		const ul = $('[contacts="true"] ul');
		$(ul).empty();
		for (cont in contact_list) {
			const li = $(`<li>${cont}</li>`);
			$(li).on('click', function () {
				const name = $('[name="contact_name"]');
				const number = $('[name="contact_number"]');
				const contact = contact_list[$(this).text()];
				name.val($(this).text());
				number.val(contact);
				delete contact_list[$(this).text()];
				reloadContactsView();
			});
			$(ul).append($(li));
		}
	};
	// Show list
	const showList = function () {

		if (contacts_node !== undefined) {
			$('[contacts="true"] label').text(`Contacts in ${contacts_node.name}:`);	
		} else {
			$('[contacts="true"] label').text('New Contacts List');	
		}
		$('.contacts_lists').css('display', 'none');
		$('[contacts="true"]').css('display', 'block');
		$('[select="contacts"]').css('display', 'none');
		$('[show="true"]').text('List options');
		$('[show="true"]').addClass('list_opts');
		$('[show="true"]').on('click', function (evn) {
			$(this).removeClass('list_opts');
			$(this).text('Select an option:');
			$('[select="contacts"]').css('display', 'block');
			$('[contacts="true"]').css('display', 'none');
			$('[edit="true"]').css('display', 'block');
			$('[edit="true"]').on('click', function (evn) {
				showList();
			});
		});
		reloadContactsView();
	};
	// Show view an set close button
	let contact_list = {};
	let contacts_node;
	// Load contactList
	// if node is linked to a list
	if (node.innodes.length > 0) {
		contact_list = node.innodes;
		contacts_node = await loadContactList(contact_list[0]);
		contact_list = contacts_node.data;
		console.log(contact_list);
		showList();
	}
	// Display the container
	const container = $('div[form="whatsapp_node"]');
	$('.wpp_cont').css('display', 'block');
	container.css('display', 'block');
	if (node.data.gif !== '') {
		$('[name="giphy"]').val(node.data.gif);
		$('[name="giphy"]').css('display', 'block');
		$('[select="gif"] h2').css('background-color', 'white');
		$('[select="gif"] h2').css('color', col);
	}
	// Close container
	$('[close="whatsapp"]').on('click', function (evn) {
		container.css('display', 'none');
		$('.wpp_cont').css('display', 'none');
		location.reload();
	});
	// Detects changes in admin value
	$('[name="wpp_admin"]').val(node.data.admin);
	$('[name="wpp_admin"]').keypress(function (key) {
		console.log($(this).val());
		node.data.admin = $(this).val();
	});
	
	// Gif button listener show the search input
	$('[select="gif"] h2').on('click', function () {
		if ($('[name="giphy"]').css('display') === 'none') {
			$('[name="giphy"]').css('display', 'block');
			$(this).css('background-color', 'white');
			$(this).css('color', col);
		} else {
			$('[name="giphy"]').css('display', 'none');
			$('[name="giphy"]').val('');
			$(this).css('background-color', col);
			$(this).css('color', 'white');
			node.data.gif = '';
		}
	});
	// Input listener for Giphy search
	$('[name="giphy"]').keypress(function (key) {
		node.data.gif = $(this).val() + key.key;
		// console.log(key.key);
		console.log(node.data.gif);
	});
	// Click to create new list
	$('[create="true"]').on('click', function (evn) {
		contact_list = {};
		contacts_node = undefined;
		showList();
	});
	// Load contacts from other node
	$('[connect="true"]').on('click', async function (evn) {
		lists = await loadContactsNodes();
		console.log(lists);
		$('.contacts_lists').css('display', 'block');
		const ul = $('.contacts_lists ul');
		$(ul).empty();
		for (list of lists) {
			const li = $(`<li contacts_id="${list.id}">${list.name}</li>`);
			$(li).on('click', function (evn) {
				console.log('click');
				for (lis of lists) {
					if (lis.id === $(this).attr('contacts_id')) {
						contact_list = lis.data;
						contacts_node = lis;
						showList();
					}
				}
			});
			$(ul).append($(li));
		}
	});
	// add a contact to the list
	$('[contacts="true"] button').on('click', function (evn) {
		const name = $('[name="contact_name"]');
		const number = $('[name="contact_number"]');
		if (name.val() !== '' && number.val() !== '') {
			console.log(name.val(), number.val());
			contact_list[name.val()] = number.val();
			name.val('');
			number.val('');
			reloadContactsView();
		} else {
			console.log('empty values');
		}
	});
	// Save Whatsapp Node
	$('[save="whatsapp"]').on('click', function (evn) {
		saveWhatsappNode(node, contacts_node, contact_list)
	});
	console.log(node);
}
// Save Whatsapp Node
async function saveWhatsappNode(node, contacts_node, contacts_list) {
	let contactsNode = contacts_node;
	// Detects existing contactsnode
	if (contactsNode!== undefined) {
		node.innodes = [contactsNode.id];
		contactsNode.data = contacts_list
		const c_fetch = await fetch(`http://${global.apiDirection}:8080/api/v1/nodes/${contactsNode.id}/save`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(contactsNode)
		});
		const contacts_saved = await c_fetch.json();
	}
	else {
		// Creates a new contacts node
		const boardId = $('.container').attr('board_id');
		const new_conts = await fetch(`http://${global.apiDirection}:8080/api/v1/boards/${boardId}/create_node`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: contacts_list,
				type: 'contacts_list'
			})
		});
		contactsNode= await new_conts.json();
		node.innodes = [contactsNode.id];
	}
	const r_fetch = await fetch(`http://${global.apiDirection}:8080/api/v1/nodes/${node.id}/save`, {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(node)
	});
	const resp = await r_fetch.json();
	$('.wpp_cont').css('display', 'none');
	console.log(node, contacts_node, contacts_list);
	location.reload();	
}