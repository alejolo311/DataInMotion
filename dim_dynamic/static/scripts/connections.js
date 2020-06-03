const drawLine = function (a, b, canvas) {
	// console.log('drawLine', a, b);
	let contx = canvas.getContext('2d');
	contx.strokeStyle = '#DDEAC8';
	contx.lineWidth = 4;
	contx.beginPath();
	contx.moveTo(a.x - 1, a.y - 124);
	contx.lineTo(b.x - 1, b.y - 124);
	contx.stroke();
	contx.closePath();
};

function drawConnections () {
	// console.log('drawin connections');
	// console.log($('.node_container').toArray());
	$('#canvas_connections').attr('width', $(' .container').outerWidth());
	$('#canvas_connections').attr('height', $('.container').outerHeight());
	let canvas = document.getElementById('canvas_connections');
	// console.log(canvas);
	for (child of $('.connections button').toArray()) {
		// console.log($(child));

		if ($(child).attr('peer') !== undefined) {
			// console.log($(child).attr('peer'));
			const peer = $(child).attr('peer');
			const type = $(child).attr('type');
			const offset = $(child).offset();
			if (type === 'in') {
				let a = {'x': offset.left, 'y': offset.top};
				const p = $('.innodes').find('button[in_id="' + peer + '"]').toArray();
				let b = {'x': $(p[0]).offset().left, 'y': $(p[0]).offset().top};
				drawLine(a, b, canvas);
			}
			if (type === 'out') {
				let a = {'x': offset.left, 'y': offset.top};
				const p = $('.outnodes').find('button[out_id="' + peer + '"]').toArray();
				let b = {'x': $(p[0]).offset().left, 'y': $(p[0]).offset().top};
				drawLine(a, b, canvas);
				// console.log(a, b);
			}
			// console.log($(child).attr('type'));
		}
	}
};