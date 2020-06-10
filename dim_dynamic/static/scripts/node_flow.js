function newNodeFlow(id, node) {
	let pos = 0;
	let tmpAnPm = node.analisis_params;
	$('.new_node_cont').css('display', 'block');
	$('[step=0]').css('display', 'block');

	// This block defines the flow buttons listeners
	// forward step 0 to 1
	$('[step=0]').find('.next').on('click', function (evn) {
		const name = $('[name=n_name]').val();
		console.log(name);
		if (name !== '' && name !== undefined) {
			node.name = name;
			$('[step=0]').css('display', 'none');
			$('[step=1]').css('display', 'block');
			pos = 1;
		}
	});
	// Close node options
	$('[step=0]').find('.back').on('click', function (evn) {
		$('.new_node_cont').css('display', 'none');	
	});
	// forward step 1 to 2
	$('[step=1]').find('.next').on('click', function () {
		const service = $('[name=is_service]').prop('checked');
		if (service) {
			node.type = 'service';
		} else {
			node.type = 'custom';
		}
		$('[step=1]').css('display', 'none');
		$('[step=2]').css('display', 'block');
	});
	// backward step 1 to 0
	$('[step=1]').find('.back').on('click', function (evn) {
		$('[step=1]').css('display', 'none');
		$('[step=0]').css('display', 'block');
	});
	// forward step 2 to 3 or 5 depending on the work_type selected
	$('[step=2]').find('.next').on('click', function (evn) {
		const type = $('[name=w_type]').val();
		node.work_type = type;
		if (type === 'request') {
			$('[step=2]').css('display', 'none');
			$('[step=3]').css('display', 'block');
		} else {
			$('[step=2]').css('display', 'none');
			$('[step=5]').css('display', 'block');
		}
	});
	// backward step 2 to 1
	$('[step=2]').find('.back').on('click', function (evn) {
		$('[step=2]').css('display', 'none');
		$('[step=1]').css('display', 'block');
	});
	// forward step 3 to 4
	$('[step=3]').find('.next').on('click', function (evn) {
		const url = $('[name=n_url]').val();
		if (url !== '') {
			node.api_url = url;
			$('[step=3]').css('display', 'none');
			$('[step=4]').css('display', 'block');
			reloadHeaders();
		}
	});
	// backward step 3 to 2
	$('[step=3]').find('.back').on('click', function (evn) {
		$('[step=3]').css('display', 'none');
		$('[step=2]').css('display', 'block');
	});
	// forward step 4 to 5
	$('[step=4]').find('.next').on('click', function (evn) {
		$('[step=4]').css('display', 'none');
		$('[step=5]').css('display', 'block');
		reloadData();
	});
	// backward step 4 to 3
	$('[step=4]').find('.back').on('click', function (evn) {
		$('[step=4]').css('display', 'none');
		$('[step=3]').css('display', 'block');
	});
	// forward step 5 to 6
	$('[step=5]').find('.next').on('click', function (evn) {
		$('[step=5]').css('display', 'none');
		$('[step=6]').css('display', 'block');
	});
	// backward step 5 to 4 or 2 depending
	$('[step=5]').find('.back').on('click', function (evn) {
		if (node.work_type == 'request') {
			$('[step=5]').css('display', 'none');
			$('[step=4]').css('display', 'block');
		} else {
			$('[step=5]').css('display', 'none');
			$('[step=2]').css('display', 'block');
		}
	});
	// forward step 6 to 7
	$('[step=6]').find('.next').on('click', function (evn) {
		const am = $('[name=an_mode]').val();
		console.log(am);
		if (am === 'none') {
			$('.new_node_cont').css('display', 'none');
			$('[step=6]').css('display', 'none');
			saveNode(node);
		} else {
			$('[step=6]').css('display', 'none');
			$('[step=7]').css('display', 'block');
			$('[mode]').css('display', 'none');
			$('[mode=' + am + ']').css('display', 'flex');
			reloadParams();
		}
	});
	// backward step 6 to 5
	$('[step=6]').find('.back').on('click', function (evn) {
		$('[step=6]').css('display', 'none');
		$('[step=5]').css('display', 'block');
	});
	// forward step 7 to save()
	$('[step=7]').find('.next').on('click', function (evn) {
		$('[step=7]').css('display', 'none');
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
	});
	// backward step 7 to 6
	$('[step=7]').find('.back').on('click', function (evn) {
		$('[step=7]').css('display', 'none');
		$('[step=6]').css('display', 'block');
	});
	// -------------------end flow listeners--------------
	// reload the headers selector
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
	// reloadHeaders();
	// The headers step
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
	// The data step
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
		}
		node.analisis_mode = val;
		$('[mode]').css('display', 'none');
		$('[mode=' + val + ']').css('display', 'flex');
		getAMInfo(val);
		reloadParams();
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
					reloadParams(node.params);
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
			reloadParams();
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
}

function getAMInfo (mode) {
	let info;
	if (mode == 'comparision') {
		info = 'Mode info: <br>Compares a list of values and returns to you a true or false value';
	} else if (mode == 'JSON') {
		info = 'Mode info: <br>Extracts the value at the given path from the data and store it with the name you define';
	} else if (mode == 'HTML') {
		info = 'Mode info: <br>scrappe an HTML or a text file to find the occurrencies and extract the values until the stop value and store it as you want to name it';
	} else if (mode == 'replace') {
		info = 'Mode info: <br>finds the format keys in the data and put them in the string you customize<br>Ex: "i want {maximum} donnuts please"<br>' +
						'maximum = 20, <br>result: "i want 20 donnuts please"';
	} else if (mode == 'gen_signature') {
		info = 'Mode info: <br>Uses the headers from the connection node and the keys stored in the data to create a HMAC-SHA1 signature';
	} else if (mode == 'none') {
		info = 'Mode info: <br>';
	}
	$('[content=analisis_mode]').html(info);
	$('[content=analisis_info]').html(info);
}

function saveNode(node) {
	$.ajax({
		url: 'http://0.0.0.0:8000/api/v1/nodes/' + node.id + '/save',
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