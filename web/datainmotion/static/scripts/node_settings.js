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
			$('[name=n_name]').val(node.name);
			if (node.type === 'service') {
				$('[name=is_service]').prop('checked', true);
			} else {
				$('[name=is_service]').prop('checked', false);
			}
			$('[name=w_type]').val(node.work_type);
			$('[name=n_url]').val(node.api_url);
			$('[name=an_mode]').val(node.analisis_mode);
			$('[name=string]').val(node.string);
			$('.node_cont_info').css('top', evn.pageY + 20);
			$('.node_cont_info').css('left', evn.pageX - 30);
			$('.progress').css('top', evn.pageY - 26);
			$('.progress').css('left', evn.pageX + 80);
			$('.close_node').css('top', evn.pageY);
			$('.close_node').css('left', evn.pageX - 30);
			$('.close_node').on('click', function () {
				node = null;
				$('.new_node_cont').css('display', 'none');
			});
			$('.step').css('display', 'none');
			newNodeFlow(node.id);
		}
	});
};
