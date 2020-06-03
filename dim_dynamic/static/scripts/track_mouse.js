function setGrabbers() {
	let nodeName = '';
	let nodeId = '';
	let offX = 15;
	let offY = 115;
	$(window).mousemove(function (evn) {
		$('.x').text('x: ' + evn.pageX.toString());
		$('.y').text('y: ' + evn.pageY.toString());
		if (nodeName !== '') {
			// console.log(nodeName);
			// $('[name="' + nodeName + '"]').css('background-color', 'red');
			let y = evn.pageY - offY;
			let bar_height = Number($('.top_bar').css('height').slice(0, -2));
			// console.log(y, Number($('.top_bar').css('height').slice(0, -2)))
			if (y > 40) {
				$('[name="' + nodeName + '_cont"]').css('top', (evn.pageY - offY).toString());
			}
			if (nodeId !== '') {
				board[nodeId] = {'x': evn.pageX - offX, 'y': evn.pageY - offY};
				drawConnections();
			}
			$('[name="' + nodeName + '_cont"]').css('left', (evn.pageX - offX).toString());
			$('[name="' + nodeName + '_cont"]').find('.grabber').css('visibility', 'visible');
			$('.container').width($(window).width());// .css('background-image', 'linear-gradient(to right, #511845 , #10040d);');
		}

	});
	$('.node_container').mousemove(function (evn) {
		if (nodeName === '') {
			// console.log('focus');
			// console.log(this);
			$(this).css('z-index', '8');
		}
	});
	$('.node_container').mouseleave(function (evn) {
		if (nodeName === '') {
			// console.log('focus');
			// console.log(this);
			$(this).css('z-index', '0');
		}
	});
	$('.grabber').on('click', function (evn) {
		// console.log('grabber clicked');
		$('.selected').text('Selected Node: ' + $(this).attr('parent'));
		// console.log(evn.originalEvent.layerX, evn.originalEvent.layerY)
		// console.log(evn);
		if (nodeName !== $(this).attr('parent')) {
			// offX = evn.originalEvent.layerX;
			// offY = evn.originalEvent.layerY;
			nodeName = $(this).attr('parent');
			nodeId = $('[name="' + nodeName + '_cont"]').attr('node_id');
			$(this).css('cursor', 'grabbing');
			$(this).css('z-index', '10');
			const color = $('[name="' + nodeName + '_cont"]').attr('tag_color');
			// console.log(color);
			$('[name="' + nodeName + '_cont"]').css('z-index', '100');
			$('[name="' + nodeName + '_cont"]').css('box-shadow', '0px 0px 40px #73466a');
		} else {
			$(this).css('cursor', 'grab');
			$(this).css('z-index', '2');
			const color = $('[name="' + nodeName + '_cont"]').attr('tag_color');
			// console.log(color);
			$('[name="' + nodeName + '_cont"]').css('z-index', '1');
			$('[name="' + nodeName + '_cont"]').css('box-shadow', 'none');
			nodeName = '';
			nodeId = '';
			autosave(null);
			$('.selected').text('Selected Node: ');
		}
	});
};