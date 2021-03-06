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
			// $('[cont_node_id="' + nodeId + '"]').css('background-color', 'red');
			let y = evn.pageY - offY;
			let x = evn.pageX - offX;
			let bar_height = Number($('.top_bar').css('height').slice(0, -2));
			// console.log(y, Number($('.top_bar').css('height').slice(0, -2)))
			const trashCan = $('.trash_can');
			const tX = $(trashCan).position().left;
			const tY = $(trashCan).position().top;
			// if (y < 40) {
			// 	$('.trash_can').css('background-color', 'white');
			// } else {
			// 	$('.trash_can').css('background-color', ' #d6ccd6');
			// }
			$('.trash_can').css('background-color', '#165185');
			if ((x > tX) ||  y > 40) {
				$('[cont_node_id="' + nodeId + '"]').css('top', (evn.pageY - offY).toString());
			}
			if ((x > tX) &&  y < 40) {
				$('.trash_can').css('background-color', 'purple');
			}
			if (nodeId !== '') {
				board.nodes[nodeId] = {'x': evn.pageX - offX, 'y': evn.pageY - offY};
			}
			if ((x > tX) && y < 40 || y > 40) {
				$('[cont_node_id="' + nodeId + '"]').css('left', (evn.pageX - offX).toString());
			}
			$('[cont_node_id="' + nodeId + '"]').find('.grabber').css('visibility', 'visible');
			drawConnections();
		}
	});
	$('.node_container').mousemove(function (evn) {
		if (nodeName === '') {
			// console.log('focus');
			// console.log(this);
			$(this).css('z-index', '10');
		}
	});
	$('.node_container').mouseleave(function (evn) {
		if (nodeName === '') {
			// console.log('focus');
			// console.log(this);
			$(this).css('z-index', '2');
		}
	});
	$('.grabber').on('mousedown', function (evn) {
		// console.log('grabber clicked');
		$('.selected').text('Selected Node: ' + $(this).attr('parent'));
		// console.log(evn.originalEvent.layerX, evn.originalEvent.layerY)
		// console.log(evn);
		//if (nodeId !== $(this).attr('parent')) {
			// offX = evn.originalEvent.layerX;
			// offY = evn.originalEvent.layerY;
			nodeId = $(this).attr('parent');
			nodeName = $('[cont_node_id="' + nodeId + '"]').attr('name');
			$(this).css('cursor', 'grabbing');
			$(this).css('z-index', '10');
			const color = $('[cont_node_id="' + nodeId + '"]').attr('tag_color');
			// console.log(color);
			$('[cont_node_id="' + nodeId + '"]').css('z-index', '100');
			$('[cont_node_id="' + nodeId + '"]').css('box-shadow', '0px 0px 40px #73466a');
		//} else {
			// // Checking the position to choose if delete the node
			// const y = $(this).parent().position().top;
			// let del = false;
			// if (y < 40) {
			// 	del = confirm("You are about to delete this node?\nThis can't be undone\nContinue"); // + nodeName + '\nContinue?');
			// }
			// if (del) {
			// 	console.log('Deleting Node');
			// 	deleteNode(nodeId);
			// } else {
			// 	if (y < 40) {
			// 		$(this).parent().css('top', y + 160);
			// 		board.nodes[nodeId].y = y + 160;
			// 	}
			// 	autosave(null);
			// }
			// // console.log('Testing Y position:', y);
			// $(this).css('cursor', 'grab');
			// $(this).css('z-index', '2');
			// // const color = $('[cont_node_id="' + nodeId + '"]').attr('tag_color');
			// // console.log(color);
			// $('[cont_node_id="' + nodeId + '"]').css('z-index', '1');
			// $('[cont_node_id="' + nodeId + '"]').css('box-shadow', 'none');
			// nodeName = '';
			// nodeId = '';
			// $('.selected').text('Selected Node: ');
		//}
	});
	$('.grabber').mouseup( function() {
		const y = $(this).parent().position().top;
			let del = false;
			if (y < 40) {
				del = confirm("You are about to delete this node?\nThis can't be undone\nContinue");
			}
			if (del) {
				console.log('Deleting Node');
				deleteNode(nodeId);
			} else {
				if (y < 40) {
					$(this).parent().css('top', y + 160);
					board.nodes[nodeId].y = y + 160;
				}
				autosave(null);
			}
			$(this).css('cursor', 'grab');
			$(this).css('z-index', '2');
			$('[cont_node_id="' + nodeId + '"]').css('z-index', '1');
			$('[cont_node_id="' + nodeId + '"]').css('box-shadow', 'none');
			nodeName = '';
			nodeId = '';
			$('.selected').text('Selected Node: ');
	});
};