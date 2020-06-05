const drawLine = function (a, b, canvas) {
	// console.log('drawLine', a, b);
	let contx = canvas.getContext('2d');
	contx.strokeStyle = '#DDEAC8';
	contx.lineWidth = '1px';
	contx.beginPath();
	contx.moveTo(a.x - 1, a.y - 124);
	contx.lineTo(b.x - 1, b.y - 124);
	contx.stroke();
	contx.closePath();
};

function drawConnections () {
	// console.log('drawing connections');
	// console.log($('.node_container').toArray());
	$('#canvas_connections').attr('width', $(' .container').outerWidth());
	$('#canvas_connections').attr('height', $('.container').outerHeight());
	let canvas = document.getElementById('canvas_connections');
	// console.log(canvas);
	// Draw outnodes conections
	for (child of $('.outnodes h2').toArray()) {
		// console.log($(child));
		if ($(child).attr('out_id') !== undefined) {
			// console.log($(child).attr('peer'));
			const peer = $(child).attr('out_id');
			const offset = $(child).offset();
			let a = {'x': offset.left + 12, 'y': offset.top + 4};
			const p = $('.connections').find('h2[con_id="' + peer + '"]').toArray();
			let b = {'x': $(p[0]).offset().left + 0, 'y': $(p[0]).offset().top + 4};
			drawLine(a, b, canvas);
		}
	}
	for (child of $('.innodes h2').toArray()) {
		if ($(child).attr('in_id') !== undefined) {
			const peer = $(child).attr('in_id');
			const offset = $(child).offset();
			let a = {'x': offset.left, 'y': offset.top};
			const p = $('.connections').find('h2[con_id="' + peer + '"]').toArray();
			let b = {'x': $(p[0]).offset().left, 'y': $(p[0]).offset().top};
			drawLine(a, b, canvas);
		}
	}
};

function setConnectionsListeners() {
	const expandIns = function (obj) {
		const parent = $(obj).parent();
		parent.toggleClass('in_expanded');
		let width = 40;
		let expand;
		for (child of parent.find('h2').toArray()) {
			$(child).toggleClass('expanded');
			if ($(child).hasClass('expanded')) {
				$(child).css('position', 'relative');
				expand = true;
			} else {
				$(child).css('position', 'absolute');
				expand = false;
			}
			width += 20;
		}
		parent.css('width', width.toString() + 'px');
		if (expand) {
			$(obj).css('background-image', 'url(../static/images/back_arrow.png)');
			$('.add_in').css('background-color', 'transparent');
			$(obj).css('background-color', 'transparent');
			$(obj).css('margin-left', '4');
		} else {
			$(obj).css('background-image', '');
			$(obj).css('background-color', 'chartreuse');
			$(obj).css('margin-left', '0');
		}
		drawConnections();

	};
	const expandOuts = function (obj) {
		const parent = $(obj).parent();
		parent.toggleClass('out_expanded');
		let he = 40;
		let expand;
		for (child of parent.find('h2').toArray()) {
			// console.log(child);
			$(child).toggleClass('expanded');
			if ($(child).hasClass('expanded')) {
				$(child).css('position', 'relative');
				expand = true;
			} else {
				$(child).css('position', 'absolute');
				expand = false;
			}
			he += 20;
		}
		parent.css('height', he.toString() + 'px');
		// Changes button color
		// console.log(expand);
		if (expand) {
			$(obj).css('background-image', 'url(../static/images/back_arrow.png)');
			$('.add_out').css('background-color', 'transparent');
			$(obj).css('background-color', 'transparent');
			$(obj).css('margin-left', '4');
		} else {
			$(obj).css('background-image', '');
			$(obj).css('background-color', 'yellow');
			$(obj).css('margin-left', '0');
		}
		drawConnections();
	};
	// $('.outnodes').mouseleave(function () {
	// 	const button = $(this).find('.show_outs');
	// 	expandOuts(button);

	// });
	// This Expands the view for all the outnodes
	$('.show_outs').on('click', function (evn) {
		// console.log('deploy outputs');
		expandOuts(this);
	});
	$('.show_ins').on('click', function (evn) {
		console.log('expand innodes');
		expandIns(this);
	});
	// This creates a new connection
	// Get the id of the presed outnode and track the mouse to the final conection position
	const tmpObj = $('<div class="connections"><h2 con_id="temporal_con"></h2></div>');
	tmpObj.css('position', 'absolute');
	// tmpObj.css('width', '10px');
	// tmpObj.css('height', '10px');
	tmpObj.css('z-index', 0);
	tmpObj.css('visibility', 'hidden');
	$('body').append(tmpObj);
	$('.add_out').on('click', function () {
		console.log('create a new connection');
		const id = $(this).attr('add_out_id');
		$(this).attr('out_id', 'temporal_con');
		$(tmpObj).attr('parent', id);
		//console.log(tmpObj.attr('con_id'));
		//console.log(id);
		const appendNode = $(this);
		$('#canvas_connections').css('cursor', 'crosshair');
		// 
		$(window).mousemove(function (evn) {
			tmpObj.css('top', evn.pageY - 36);
			tmpObj.css('left', evn.pageX - 16);
			drawConnections();
		});
	});
	// This listener cleans the new connection if the user doesn't click any node
	$('#canvas_connections').on('click', function (evn) {
		// console.log('canvas clicked');
		$(this).css('z-index', 1);
		// console.log($(tmpObj).attr('parent'));
		// console.log('clean new connections');
		const outId = $(tmpObj).attr('parent');
		const outnode = $('[add_out_id=' + outId + ']');
		outnode.removeAttr('out_id');
		$(tmpObj).removeAttr('parent');
		$(this).css('cursor', 'default');
		drawConnections();
	});
	// detects a new connection
	// bind the outnode sending the id to connections
	$('.connections h2').on('click', function (evn) {
		const outId = $(tmpObj).attr('parent');
		const conId = $(this).attr('con_id');
		if (conId !== outId && outId !== undefined && conId !== undefined) {
			console.log('new connection upcomming');
			console.log(outId, conId);
			$.ajax({
				type: 'POST',
				url: 'http://0.0.0.0:8000/api/v1/nodes/' + outId + '/add_connection',
				contentType: 'application/json',
				data: JSON.stringify({'con_id': conId, 'type': 'out'}),
				success: function (response) {
					console.log(response);
					location.reload();
				}
			});
		}
	});
	// to select a clicked outnode show options and remove if choosen
	$('.outnodes h2').on('click', function (evn) {
		if ($(this).attr('out_id') !== undefined && !$(this).hasClass('add_out')) {
			console.log('display outnode options');
			console.log(evn.pageX);
			console.log(evn.pageY);
			const parentId = $(this).attr('father');
			const id = $(this).attr('out_id');
			$('.outnode_settings').css('visibility', 'visible');
			$('.outnode_settings').attr('nod', parentId);
			$('.outnode_settings').attr('out', id);
			$('.outnode_settings').css('top', evn.pageY - 20);
			$('.outnode_settings').css('left', evn.pageX - 20);
			$('.outnode_settings').css('z-index', 12);
		}
	});
	// configure onmouse leave to hidde the outnodesettings
	$('.outnode_settings').mouseleave(function (evn) {
		$(this).css('visibility', 'hidden');
	});
	// adding tjhe same listener to the button click
	$('.outnode_settings h2').on('click', function (evn) {
		$('.outnode_settings').css('visibility', 'hidden');
	});
	$('button[action=remove]').on('click', function (evn) {
		const out = $('.outnode_settings').attr('out');
		const node = $('.outnode_settings').attr('nod');
		console.log('remove', out, 'from', node);
		$.ajax({
			type: 'DELETE',
			url: 'http://0.0.0.0:8000/api/v1/nodes/' + node + '/del_connection',
			contentType: 'application/json',
			data: JSON.stringify({
				'con_id': out,
				'type': 'out'
			}),
			success: function (response) {
				location.reload();
			}
		});
	});

	// To remove an existing outnode
};

function reloadNode (nodeId) {
	$.ajax({
		url: 'http://0.0.0.0:8001/nodes/' + nodeId,
		success: function (node) {
			const actual = $('.node_container[node_id=' + nodeId + ']');
			console.log('actual', actual);
			$(actual).remove();
			$('.container').append($(node));
			setGrabbers();
		}
	});
};