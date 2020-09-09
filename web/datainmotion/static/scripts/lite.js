function setLiteView(data) {
	connections = data[1];
	nodes = data[0];
	// console.log(nodes);
	// get witdh and height, by checking on connections
	// create fixed grid
	const grid = $('<ul grid="columns"></ul>');
	
	// Fill the first column with al the nodes
	// const JSgrid = $(grid).get(0);
	// const firstColumn = JSgrid.querySelectorAll('[grid="rows"]')[0];
	// console.log(firstColumn);
	// const cells = firstColumn.querySelectorAll('li');
	// console.log(cells);
	// for (let i = 0; i < nodes.length; i++) {
	// 	cells[i].innerHTML = nodes[i];
	// }
	// organize the board by flow
	// set borad coordinates
	const boardCoors = {};
	let lengths = []
	let service = '';
	// console.log(connections);
	for (nod of Object.keys(connections)) {
		if (connections[nod].type === 'service') {
			service = nod;
			lengths.push(innodesDeep(connections, nod));

		}
	}
	const inDepth = Math.max.apply(Math, lengths);
	// console.log(inDepth);
	lengths = [];
	for (innode of connections[service].innodes) {
		// console.log('node:', connections[innode]);
		for (inn of connections[innode].innodes) {
			lengths.push(outnodesDeep(connections, inn));
		}
		lengths.push(outnodesDeep(connections, innode));
	}
	
	// console.log(lengths);
	const lengthDepth = Math.max.apply(Math, lengths);
	// console.log(inDepth, lengthDepth, inDepth + lengthDepth);
	
	// assign size to grid
	$(grid).css('grid-template-columns', `repeat(${inDepth + lengthDepth + 2}, 180px)`);
	// check the flow and draw it
	drawServiceFlows(grid, connections, inDepth, lengthDepth, service);
}

function drawServiceFlows(grid, connections, servicePivot, lengthDepth, mainService) {

	for (conn in connections) {
		if (conn.type === 'service') {
			console.log('Service to render');
		}
		// drawInnodes(grid, connections, conn);
		// drawOutnodes(grid, connections, conn);
	}
	const height = flowHeight(connections, mainService);
	let witdh = servicePivot + lengthDepth + 2;
	// console.log('Nodes:', nodes.length);
	$(grid).empty();
	for (let x = 0; x < witdh; x++) {
		const column = $('<li class="col"><ul grid="rows"></ul></li>');
		const ul = $(column).find('[grid="rows"]');
		for (let y = 0; y < height; y++) {
			$(ul).append($('<li></li>'));
		}
		$(grid).append($(column));
	}
	$('.container').empty();
	$('.container').append($(grid));
	const columns = document.querySelectorAll('[grid="columns"] .col');
	// console.log('columns', columns);
	// get the cell for the first service to draw
	const cell = getCell(columns, servicePivot, 0);
	let x = servicePivot, y = 0;
	console.log(cell, x, y);
	cell.innerHTML = connections[mainService].template;

	// Draw the innodes
	drawInnodes(columns, connections, mainService, {'x': x, 'y': y, 'h': height});

	
}

function getCell(data, x, y) {
	console.log(x, y);
	let cell = data[x].querySelectorAll('[grid="rows"] li')[y];
	let offset = 1;
	while (cell.innerHTML !== '') {
		cell = data[x].querySelectorAll('[grid="rows"] li')[y + offset];
		offset += 1;
	}
	return cell;
}

function drawInnodes (data, connections, node, dims) {
	if (connections[node].innodes.length > 0) {
		for (let i = 0; i < connections[node].innodes.length; i++) {
			const cell = getCell(data, dims.x - 1, i + dims.y);
			cell.innerHTML = connections[connections[node].innodes[i]].template;
			drawInnodes(data, connections, connections[node].innodes[i], {'x': dims.x - 1, 'y': dims.y, 'h': dims.h});
			drawOutnodes(data, connections, connections[node].innodes[i], {'x': dims.x, 'y': dims.y, 'h': dims.h});
		}
	} else {

	}
}

function drawOutnodes (data, connections, node, dims) {
	if (connections[node].outnodes.length > 0) {
		for (let i = 0; i < connections[node].outnodes.length; i++) {
			const cell = getCell(data, dims.x, i + dims.y);
			cell.innerHTML = connections[connections[node].outnodes[i]].template;
			drawInnodes(data, connections, connections[node].outnodes[i], {'x': dims.x, 'y': dims.y, 'h': dims.h});
			drawOutnodes(data, connections, connections[node].outnodes[i], {'x': dims.x + 1, 'y': dims.y, 'h': dims.h});
		}
	} else {

	}	
}

function flowHeight (connections, id) {
	function innodesWidth (cons, ID) {
		if (cons[ID].innodes.length > 0) {
			const lengths = [];
			for (innode of cons[ID].innodes) {
				lengths.push(innodesWidth(cons, innode))
			}
			return (Math.max.apply(Math, lengths) + cons[ID].innodes.length);
		} else {
			return (0);
		}
	}
	function outnodesWidth (cons, ID) {
		if (cons[ID].outnodes.length > 0) {
			const lengths = [];
			for (outnode of cons[ID].outnodes) {
				lengths.push(outnodesWidth(cons, outnode))
			}
			return (Math.max.apply(Math, lengths) + cons[ID].outnodes.length);
		} else {
			return (0);
		}
	}
	const inW = innodesWidth(connections, id);
	const lengths = [];
	for (const innode of connections[id].innodes) {
		lengths.push(outnodesWidth(connections, innode));
	}
	// const outW = outnodesWidth(connections, id);
	const outW = Math.max.apply(Math, lengths);
	// console.log(inW, outW);
	return Math.max.apply(Math, [inW, outW]);
}


function innodesDeep(connections, id) {
	if (connections[id].innodes.length > 0) {
		const lengths = [];
		for (innode of connections[id].innodes) {
			lengths.push(innodesDeep(connections, innode));
		}
		return (Math.max(lengths) + 1);
	} else {
		return 0;
	}
}

function outnodesDeep(connections, id) {
	if (connections[id].outnodes.length > 0) {
		const lengths = [];
		for (outnode of connections[id].outnodes) {
			lengths.push(outnodesDeep(connections, outnode));
		}
		let max = Math.max.apply(Math, lengths);
		if (isNaN(max)) {
			max = 0;
		}
		return (max + 1);
	} else {
		return 0;
	}
}