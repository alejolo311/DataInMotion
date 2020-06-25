function loadMedia(obj) {
	console.log(tmpOut);
	const viewer = $(obj).parent().parent().find('.media_cont');
	const width = $(obj).parent().parent().width();
	const nodeN = $(obj).parent().parent().attr('name').replace('_cont', '');
	console.log(width);
	let height = width;
	console.log();
	if ($(viewer).css('display') === 'none') {
		$(viewer).css('display', 'block');
		$(viewer).css('width', width * 1.5);
	} else {
		$(viewer).css('display', 'none');
	}
	if ('headers' in tmpOut[nodeN]) {
		// console.log(tmpOut[nodeN]['headers']);
		const conType = tmpOut[nodeN]['headers']['Content-Type'];
		if (conType === undefined) {
			conType = tmpOut[nodeN]['headers']['content-type'];
		}
		let dataString = 'data:' + conType + ';base64,';
		const raw = tmpOut[nodeN]['raw'];
		dataString += raw;
		const img = new Image();
		img.src = dataString;
		viewer.empty();
		viewer.append($(img));
	} else {
		if ('url' in tmpOut[nodeN]) {
			const img = new Image();
			img.src = tmpOut[nodeN]['url'];
			viewer.empty();
			viewer.append($(img));
		}
	}

};

function setMediaPlayerListeners () {
	$('.media_player').on('click', function (evn) {
		console.log('media_viewer node id');
		console.log($(this).attr('id'));
		if (tmpOut !== undefined) {
			loadMedia(this);
		}
	});
};