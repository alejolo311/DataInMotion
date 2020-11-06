
function setGrabbers() {
	let nodeName = '';
	let nodeId = '';
	
	$(window).mousemove(function (evn) {
		$('.x').text('x: ' + evn.pageX.toString());
		$('.y').text('y: ' + evn.pageY.toString());
		let offX = - 10;
		const canvas = document.getElementById('canvas_connections');
		const rect = canvas.getBoundingClientRect()
		const offY = rect.top + 15 + window.pageYOffset;
		if (nodeName !== '') {
			let y = evn.pageY - offY;
			let x = evn.pageX - offX;
			// let bar_height = Number($('.top_bar').css('height').slice(0, -2));
			const trashCan = $('.trash_can');
			const tX = $(trashCan).position().left;
			// const tY = $(trashCan).position().top;
			$('.trash_can').css('background-color', '#165185');
			if ((x > tX) ||  y > 0) {
				$('[cont_node_id="' + nodeId + '"]').css('top', (evn.pageY - offY).toString());
			}
			if ((x > tX) &&  y < 0) {
				$('.trash_can').css('background-color', 'purple');
			}
			if (nodeId !== '') {
				const width = $('[cont_node_id="' + nodeId + '"]').outerWidth();
				board.nodes[nodeId] = {'x': evn.pageX - (width + 15), 'y': evn.pageY - offY};
			}
			if ((x > tX) && y < 40 || y > 40) {
				const width = $('[cont_node_id="' + nodeId + '"]').outerWidth();
				$('[cont_node_id="' + nodeId + '"]').css('left', (evn.pageX - (width + 15)).toString());
			}
			$('[cont_node_id="' + nodeId + '"]').find('.grabber').css('visibility', 'visible');
			drawConnections();
		}
	});
	$('.node_container').mousemove(function (evn) {
		if (nodeName === '') {
			$(this).css('z-index', '10');
		}
	});
	$('.node_container').mouseleave(function (evn) {
		if (nodeName === '') {
			$(this).css('z-index', '2');
		}
	});
	$('.grabber').on('mousedown', function (evn) {
		// console.log('grabber clicked');
		$('.selected').text('Selected Node: ' + $(this).attr('parent'));
			nodeId = $(this).attr('parent');
			nodeName = $('[cont_node_id="' + nodeId + '"]').attr('name');
			// evn.target.style.cursor = 'grabbing';
			// 	$(this).css('cursor', 'grabbing');
			$(this).css('z-index', '10');
			const color = $('[cont_node_id="' + nodeId + '"]').attr('tag_color');
			$('[cont_node_id="' + nodeId + '"]').css('z-index', '100');
			$('[cont_node_id="' + nodeId + '"]').css('box-shadow', '0px 0px 40px #73466a');
	});
	$('.grabber').mouseup( function() {
		const y = $(this).parent().position().top;
		let del = false;
		if (y < 10) {
			del = confirm("You are about to delete this node?\nThis can't be undone\nContinue");
		}
		if (del) {
			console.log('Deleting Node');
			deleteNode(nodeId);
		} else {
			if (y < 10) {
				$(this).parent().css('top', y + 140);
				board.nodes[nodeId].y = y + 140;
			}
			autosave(null);
		}
		// $(this).css('cursor', 'grab');
		$(this).css('z-index', '2');
		$('[cont_node_id="' + nodeId + '"]').css('z-index', '1');
		$('[cont_node_id="' + nodeId + '"]').css('box-shadow', 'none');
		nodeName = '';
		nodeId = '';
		$('.selected').text('Selected Node: ');
		drawConnections();
	});
};