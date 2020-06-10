function setNodeSettings () {
	let nodeActual = {};
	$('.colors button').on('click', function (evn) {
		const nodeId = $(this).attr('tag_id');
		const color = $(this).attr('color');
		// console.log(nodeId, color);
		$('[node_id="' + nodeId + '"]').attr('tag_color', color);
		$('[node_id="' + nodeId + '"]').css('border-color', color);
		$('[node_id="' + nodeId + '"]').find('.tag_color').css('background-color', color);
	});
	const reloadDict = function (group, reset) {
		const target = $('[group=' + group + ']');
		target.empty();
		// console.log(nodeActual);
		// console.log(nodeActual[group]);
		for (let key of Object.keys(nodeActual[group])) {
			// console.log(group + ': ', key);
			let li = '<li '
			li += 'key="' + key + '"'
			li += '>' + key + ': ' + nodeActual[group][key] + '</li><hr>';
			target.append($(li));
		}
		target.find('li').on('click', function (evn) {
			const liKey = $(this).attr('key');
			$('[name=' + group + '_key]').val(liKey);
			$('[name=' + group + '_value]').val(nodeActual[group][liKey]);
			$('[name=' + group + '_key]').css('background-color', nodeActual.color);
			$('[name=' + group + '_value]').css('background-color', nodeActual.color);
			$('[name=' + group + '_key]').on('click', function () {

			});
			$('[name=head_value]')
			delete nodeActual[group][liKey];
			reloadDict(group, false);
		});
		if (reset) {
			$('[name=' + group + '_key]').val('');
			$('[name=' + group + '_value]').val('');
			$('[name=' + group + '_key]').css('background-color', 'white');
			$('[name=' + group + '_value]').css('background-color', 'white');
		}
	};
	$('input').mousemove(function () {
		$(this).css('background-color', 'white');
	});
	$('.value').on('mousemove', function (evn) {
		$(this).css('background-color', 'white');
		$(this).css('width', 'fit-content');
		// $(this).css('height', '');
		$(this).css('max-height', '1000px');
		$(this).css('max-width', '400px');
		// $(this).autoResize();
		$(this).css('overflow-wrap', 'break-word');

		// $(this).attr('size', $(this).val().length);
	});
	$('.value').mouseleave(function () {
		$(this).css('width', '90px');
		$(this).css('max-height', '30px');
	});
	$('.head_add').on('click', function (evn) {
		const key = $('[name=headers_key]').val();
		const value = $('[name=headers_value]').val();
		if (key !== '' && value !== '') {
			// console.log('adding', key, value);
			nodeActual['headers'][key] = value;
			// console.log(Object.keys(nodeActual));
			reloadDict('headers', true);
		}
	});
	$('.data_add').on('click', function (evn) {
		const key = $('[name=data_key]').val();
		const value = $('[name=data_value]').val();
		if (key !== '' && value !== '') {
			// console.log('adding', key, value);
			nodeActual['data'][key] = value;
			// console.log(Object.keys(nodeActual));
			reloadDict('data', true);
		}
	});
	const addValue = function() {};
	const loadNode = function (id) {
		// console.log(id);
		$.ajax({
			url: 'http://0.0.0.0:8080/api/v1/nodes/' + id,
			success: function (node) {
				nodeActual = node;
				// console.log(node.color);
				$('.node_settings_tag').css('background-color', node.color);
				$('[name=node_name]').val(node.name);
				$('[name=work_type]').val(node.work_type);
				$('[name=analisis_mode]').val(node.analisis_mode);
				$('[name=node_url]').val(node.api_url);
				$('[name=node_url]').css('width', '280px');
				$('[name=node_url]').css('max-width', '280px');
				$('[name=node_endpoint]').val(node.api_endpoint);
				if (node.work_type === 'process') {
					$('[field=url]').css('display', 'none');
					$('[field=endpoint]').css('display', 'none');
					$('[field=headers]').css('display', 'none');
				} else {
					$('[field=url]').css('display', 'block');
					$('[field=endpoint]').css('display', 'block');
					$('[field=headers]').css('display', 'block');
				}
				if (node.string === 'auth') {
					// console.log('node requires auth');
					if ($('.switch input').attr('checked') === undefined) {
						$('.switch input').trigger('click');
					}
				} else {
					// $('.switch input').removeAttr('checked');
					if ($('.switch input').attr('checked') === 'checked') {
						$('.switch input').trigger('click');
					}
				}
				reloadDict('headers', true);
				reloadDict('data', true);
			}
		});
	};
	// Detect when a node is pressed two times
	// and display the node form
	let node_id = '';
	$('.up').on('click', function () {
		if (node_id === '') {
			node_id = $(this).attr('p_id');
		} else if (node_id === $(this).attr('p_id')) {
			node_id = '';
			$('.node_settings').css('display', 'block');
			for (input of $('.node_settings'))
			// console.log('show node form');
			loadNode($(this).attr('p_id'));
		} else {
			node_id = '';
		}
	});
	$('.save_node').on('click', function (evn) {
		const name = $('[name=node_name]').val();
		nodeActual.name = name
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			url: 'http://0.0.0.0:8080/api/v1/nodes/' + nodeActual.id + '/save',
			data: JSON.stringify(nodeActual),
			success:  function (resp) {
				console.log(resp);
				const nameLabel = $('[p_id=' + nodeActual.id + ']').find('.tag_name');
				$(nameLabel).text(nodeActual.name);
			},
			error: function (error) {
				console.log(error);
			}
		});
		$('.node_settings').css('display', 'none');
	});


	/**
	 * Utilities for new releases
	 * concept probes
	 */
	// 
	$('.switch input').on('click', function (evn) {
		// console.log($(this).attr('checked'));
		if ($(this).attr('checked') === 'checked') {
			
			$(this).removeAttr('checked');
			nodeActual.string = '';
		} else if ($(this).attr('checked') === undefined){
			$(this).attr('checked', 'checked');
			nodeActual.string = 'auth';
		}
	});

};
