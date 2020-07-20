$(window).on('load', async function () {
  await checkOnReload();
  setProjectMenu();
  drawGrid();
  const boardId = $('.container').attr('board_id');
  // console.log(boardId);
  if (boardId !== undefined && boardId !== '') {
    getBoardView();
  } else {
    getBoards();
  }
});

async function checkOnReload () {
	console.log('checking on reload');
	// localStorage.running_test = true;
	// localStorage.running_id = instanceId;
	const state = localStorage.getItem('running_test');
	console.log(state === 'true');
	if (state === 'true') {
		console.log('reading pId');
		const pId = localStorage.getItem('running_id');
		console.log(pId);
		const conf = confirm('There is a running process executing, press OK to open it in console, or cancel to stop it')
		if (!conf) {
			await stopProcess(pId);
		} else {
			running_test(pId);
		}
	} else {
		localStorage.running_test = false;
		localStorage.running_id = '';
	}
}
async function stopProcess (pId) {
	const stopFetch = await fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/test/${pId}/stop`)
	const result = await stopFetch.text()
	console.log(result);
	localStorage.running_test = false;
	localStorage.running_id = '';
}