let node_id = '';
function setNodeSettings () {
	// Detect when a node is pressed two times
	// and display the node form
	$('.tag_name').off('click');
	$('.tag_name').on('click', function (evn) {
		if (node_id === '') {
			node_id = $(this).attr('p_id');
		} else if (node_id === $(this).attr('p_id')) {
			console.log(evn.pageX);
			// console.log(evn.pageY);
			// window.location.replace(`${global.prot}://${global.domain}/node_editor?id=${node_id}`);
			loadNode($(this).attr('p_id'), evn);
			node_id = '';
		} else {
			node_id = '';
		}
	});
};
const loadNode = function (id, evn) {
	$.ajax({
		url:`${global.prot}://${global.domain}${global.apiPort}/api/v1/nodes/${id}`,
		success: function (n) {
			const node = n;
			if (node.work_type === 'sender') {
				WhatsAppFlow(node, evn);
			} else {
				$('.new_node_cont').css('display', 'block');
				const root = document.getElementById('node_editor');
				const editor = new NodeEditor(root, id);
				editor.setpos(evn);
				console.log(editor);
				// setNodeView(node, evn);
			}
		}
	});
};
