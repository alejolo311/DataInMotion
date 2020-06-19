function popup () {
	$('.node_container').mousemove(function (evn) {
		$(this).find('.grabber').css('visibility', 'visible');
	});
	$('.node_container').mouseout(function (evn) {
		$(this).find('.grabber').css('visibility', 'hidden');
	});
	$('.tag_color').on('click', function (evn) {
		const id = $(this).attr('id');
		console.log('tag color', id);
		$('[node_id="' + id + '"] .colors').css('display', 'grid');
	});
	$('.colors h2').on('click', function () {
		const id = $(this).attr('n_id');
		console.log('save', id);
		const node = $('[node_id="' + id + '"]');
		console.log('color: ', node.attr('tag_color'));
		node.find('.colors').css('display', 'none');
		$.ajax({
			type: 'POST',
			url: `http://${global.apiDirection}:8080/api/v1/nodes/${id}/savecolor`,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				'color': node.attr('tag_color')
			}),
			success: function (data) {
				console.log(data);
			}
		});

	});
};