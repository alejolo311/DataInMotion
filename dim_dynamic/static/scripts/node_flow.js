function newNodeFlow(id, node) {
	$('[step=0]').css('display', 'block');
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


	$('[name=an_mode]').change(function () {
		const val = $(this).val();
		console.log(val);
		node.analisis_mode = val;
		getAMInfo(val);
	});

}

function getAMInfo (mode) {
	if (mode == 'comparision') {
		const info = 'Mode info: <br>Compares a list of values and returns to you a true or false value';
		$('[content=analisis_mode]').html(info)
	} else if (mode == 'JSON') {
		const info = 'Mode info: <br>Extracts the value at the given path from the data and store it with the name you define';
		$('[content=analisis_mode]').html(info)
	} else if (mode == 'HTML') {
		const info = 'Mode info: <br>scrappe an HTML or a text file to find the occurrencies and extract the values until the stop value and store it as you want to name it';
		$('[content=analisis_mode]').html(info)
	} else if (mode == 'replace') {
		const info = 'Mode info: <br>finds the format keys in the data and put them in the string you customize<br>Ex: "i want {maximum} donnuts please"<br>' +
						'maximum = 20, <br>result: "i want 20 donnuts please"';
		$('[content=analisis_mode]').html(info)
	} else if (mode == 'gen_signature') {
		const info = 'Mode info: <br>Uses the headers from the connection node and the keys stored in the data to create a HMAC-SHA1 signature';
		$('[content=analisis_mode]').html(info)
	} else if (mode == 'none') {
		const info = 'Mode info: <br>';
		$('[content=analisis_mode]').html(info)
	}
}