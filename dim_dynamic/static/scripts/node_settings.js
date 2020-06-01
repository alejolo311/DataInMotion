function setNodeSettings () {
	$('.colors button').on('click', function (evn) {
		const nodeId = $(this).attr('tag_id');
		const color = $(this).attr('color');
		console.log(nodeId, color);
		$('[node_id="' + nodeId + '"]').attr('tag_color', color);
		$('[node_id="' + nodeId + '"]').css('border-color', color);
		$('[node_id="' + nodeId + '"]').find('.tag_color').css('background-color', color);
	});
};