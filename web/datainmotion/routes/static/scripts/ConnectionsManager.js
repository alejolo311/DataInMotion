class ConnectionsManager {
	constructor (canvas) {
		this.canvas = canvas;
		this.board = {};
	}
	drawLine (a, b, color) {
		const contx = this.canvas.getContext('2d');
		if (color !== undefined && color !== null && color !== '') {
			contx.strokeStyle = color;
		} else {
			contx.strokeStyle = '#ffffff';
		}
	
		contx.lineWidth = 3;
		contx.beginPath();
		const rect = this.canvas.getBoundingClientRect();
		const offY = rect.top - 10 + window.pageYOffset;
		const offX = 10 + this.board._root.scrollLeft;
		contx.moveTo(a.x, a.y); // + offX, a.y - offY);
		contx.lineTo(b.x, b.y) // + offX, b.y - offY);
		contx.stroke();
		contx.closePath();
	}
	setConnectionsListeners () {
		// The Expand handlers
		const comp = this;
		const expandIns = function (obj) {
			const parent = $(obj).parent();
			parent.toggleClass('in_expanded');
			let width = 40;
			let expand;
			// measuring the correct width summing each connection
			for (const child of parent.find('h2').toArray()) {
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
			comp.board.drawConnections();
		};
		const expandOuts = function (obj) {
			const parent = $(obj).parent();
			parent.toggleClass('out_expanded');
			let he = 40;
			let expand;
			for (const child of parent.find('h2').toArray()) {
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
			// $(obj).css('margin-left', '0');
			console.log($(parent).css('top', '6px'));
			}
			comp.board.drawConnections();
		};
		// The Expand Listeners
		$('.show_outs').on('click', function (evn) {
			// console.log('deploy outputs');
			expandOuts(this);
		});
		$('.show_ins').on('click', function (evn) {
			// console.log('expand innodes');
			expandIns(this);
		});
		// This creates a new connection element in the DOM to track a new connection and draw in the canvas
		// Get the id of the pressed outnode and track the mouse to the final conection position
		// --------------------------------
		$('.add_out').on('click', function (evn) {
			const tmpObj = $('<div><div class="connections"><h2 con_id="temporal_con"></h2></div></div>');
			comp.canvas.parentNode.querySelector('.container').appendChild($(tmpObj).get(0));
			tmpObj.css('position', 'absolute');
			tmpObj.css('z-index', 0);
			tmpObj.css('visibility', 'hidden');
			console.log('create a new connection');
			const id = $(this).attr('add_out_id');
			$(this).attr('out_id', 'temporal_con');
			$(tmpObj).find('h2').attr('parent', id);
			$(tmpObj).find('h2').attr('type', 'out');
			// Shows a cross when tracking a new connection
			$('#canvas_connections').css('cursor', 'crosshair');
			comp.canvas.parentNode.parentNode.addEventListener('mousemove', function (evn) {
				if (evn.target.tagName === 'CANVAS') {
					console.log(evn.clientX, evn.clientY);
					tmpObj.css('top', evn.clientY - evn.target.getBoundingClientRect().top + 4);
					tmpObj.css('left', evn.clientX - 28);
					tmpObj.css('background-color', 'red');
					comp.board.drawConnections();
				}
				// Change the new connection tracker position
				// and reloads the canvas
			});
		});
		$('.add_in').on('click', function () {
			const tmpObj = $('<div><div class="connections"><h2 con_id="temporal_con"></h2></div></div>');
			comp.canvas.parentNode.querySelector('.container').appendChild($(tmpObj).get(0));
			tmpObj.css('position', 'absolute');
			tmpObj.css('z-index', 0);
			tmpObj.css('visibility', 'hidden');
			console.log('creating a new innode connection');
			const id = $(this).attr('add_in_id');
			$(this).attr('in_id', 'temporal_con');
			$(tmpObj).find('h2').attr('parent', id);
			$(tmpObj).find('h2').attr('type', 'in');
			// Shows a cross when tracking a new connection
			$('#canvas_connections').css('cursor', 'crosshair');
			$(window).mousemove(function (evn) {
				// Change the new connection tracker position
				// and reloads the canvas
				if (evn.target.tagName === 'CANVAS') {
					tmpObj.css('top', evn.pageY - evn.target.getBoundingClientRect().top + 4);
					tmpObj.css('left', evn.pageX - 28);
					comp.board.drawConnections();
				}
			});
		});
		// This listener cleans the new connection if the user doesn't click any node
		$('#canvas_connections').on('click', function (evn) {
			try {
				$(this).css('z-index', 1);
				const tmpObj = document.querySelector('[con_id="temporal_con"]');
				// const parent = document.querySelector(`${tmpObj.getAttribute('parent')}`);
				const outId = tmpObj.getAttribute('parent');
				const type = tmpObj.getAttribute('type');
				const outnode = $('[add_' + type + '_id=' + outId + ']');
				outnode.removeAttr(type + '_id');
				tmpObj.remove();
				$(this).css('cursor', 'default');
				comp.board.drawConnections();
			} catch (err) {
				console.log(err);
			}
			
		});
		// detects a new connection incoming from another node
		// bind the outnode sending the id to connections
		$('.connections h2').on('click', function (evn) {
			const tmpObj = document.querySelector('[con_id="temporal_con"]');
			const outId = tmpObj.getAttribute('parent');
			const ty = tmpObj.getAttribute('type');
			const conId = $(this).attr('con_id');
			if (conId !== outId && outId !== undefined && conId !== undefined) {
			console.log('new connection upcomming');
			console.log(outId, conId);
			$.ajax({
				type: 'POST',
				url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${outId}/add_connection`,
				contentType: 'application/json',
				data: JSON.stringify({ con_id: conId, type: ty }),
				success: function (response) {
					console.log(response);
					location.reload();
				}
			});
			}
		});
		// Show the outnodes options
		// Remove: deletes the outnode id
		// Reindex: changes the index to the users selection <-- This feature needs to be created
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
			$('.outnode_settings').attr('type', 'out');
			$('.outnode_settings').css('top', evn.pageY);
			$('.outnode_settings').css('left', evn.pageX);
			$('.outnode_settings').css('z-index', 12);
			}
		});
		// configure onmouse leave to hidde the outnodesettings
		$('.outnode_settings').mouseleave(function (evn) {
			$(this).css('visibility', 'hidden');
		});
		// adding the same listener to the button when the user click it
		$('.outnode_settings h2').on('click', function (evn) {
			$('.outnode_settings').css('visibility', 'hidden');
		});
		// Display Innodes options
		// (Change index, remove)
		$('.innodes h2').on('click', function (evn) {
			// console.log('innodes options');
			if ($(this).attr('in_id') !== undefined && !$(this).hasClass('add_in')) {
			console.log('display innode options');
			console.log(evn.pageX);
			console.log(evn.pageY);
			const parentId = $(this).attr('father');
			const id = $(this).attr('in_id');
			$('.outnode_settings').css('visibility', 'visible');
			$('.outnode_settings').attr('nod', parentId);
			$('.outnode_settings').attr('out', id);
			$('.outnode_settings').attr('type', 'in');
			$('.outnode_settings').css('top', evn.pageY );
			$('.outnode_settings').css('left', evn.pageX);
			$('.outnode_settings').css('z-index', 12);
			}
		});
		// listener to remove a connection
		// To remove an existing outnode
		// Here the button can detects innodes and outnodes by checking the value in the outnode_settings
		$('button[action=remove]').on('click', function (evn) {
			const out = $('.outnode_settings').attr('out');
			const typ = $('.outnode_settings').attr('type');
			const node = $('.outnode_settings').attr('nod');
			console.log('remove', out, 'from', node);
			$.ajax({
			type: 'DELETE',
			url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${node}/del_connection`,
			contentType: 'application/json',
			data: JSON.stringify({
				con_id: out,
				type: typ
			}),
			success: function (response) {
				location.reload();
			}
			});
		});
	}

}

// Set the connection listeners
// the expand and collapse buttons for the innodes and outnodes