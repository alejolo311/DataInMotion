function drawGrid () {
  const width = document.getElementsByTagName('body')[0].scrollWidth;
  const height = document.getElementsByTagName('body')[0].scrollHeight;
  $('#canvas_grid').attr('width', width);
  $('#canvas_grid').attr('height', height);
  const canvas = document.getElementById('canvas_grid');
  const ctx = canvas.getContext('2d')
  // const width = $('body').outerWidth();
  // const height = $('body').outerHeight();
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