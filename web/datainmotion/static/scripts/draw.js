function drawGrid () {
	$('#canvas_grid').attr('width', $(' .container').outerWidth());
	$('#canvas_grid').attr('height', $('.container').outerHeight());
	const canvas = document.getElementById('canvas_grid');
	const ctx = canvas.getContext('2d')
	const width = $(' .container').outerWidth();
	const height = $(' .container').outerHeight();
	// console.log(width, height);
	const anchor = 10;
	ctx.beginPath();
	ctx.fillStyle = '#e6e6e620';
	for (let i = 0; i < width; i += anchor) {
		for (let j = 0; j < height; j += anchor) {
			ctx.moveTo(i, j);
			ctx.arc(i, j, 1, 0, 2*Math.PI);
		}
	}
	ctx.fill();
};