let node;
let node_id = '';
function setNodeSettings () {
	// Detect when a node is pressed two times
	// and display the node form
	$('.tag_name').on('click', function (evn) {
		if (node_id === '') {
			node_id = $(this).attr('p_id');
		} else if (node_id === $(this).attr('p_id')) {
			console.log(evn.pageX);
			console.log(evn.pageY);
			loadNode($(this).attr('p_id'), evn);
		} else {
			node_id = '';
		}
	});
};
const loadNode = function (id, evn) {
	$.ajax({
		url:`http://${global.apiDirection}:8080/api/v1/nodes/${id}`,
		success: function (n) {
			node = n;
			if (node.work_type === 'sender') {
				WhatsAppFlow(node);
			} else {
				setNodeView(node, evn);
			}
		}
	});
};
