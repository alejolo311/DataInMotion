$(window).on('load', async function () {
  await checkOnReload();
  setProjectMenu();
//   try {
// 	drawGrid();
//   } catch (error) {
// 	console.log('No grid');
//   }
  const boardId = document.getElementById('board');
  // console.log(boardId);
//   console.log(boardId);
  if (boardId && boardId.getAttribute('board_id') !== '') {
	//   console.log('getBoardVIew');
      getBoardView();
  } else {
	  document.body.style.overflowY = 'hidden';
     getBoards();
  }
});

async function checkOnReload () {
	// console.log('checking on reload');
	// localStorage.running_test = true;
	// localStorage.running_id = instanceId;
	const state = localStorage.getItem('running_test');
	// console.log(state === 'true');
	if (state && localStorage.getItem('running_id')) {
		console.log('reading PID');
		const pId = localStorage.getItem('running_id');
		console.log(pId);
		const conf = confirm('There is a running process executing, press OK to stop it, or cancel and wait to the process to end')
		if (conf) {
			await stopProcess(pId);
		} else {
			running_test(pId);
		}
	} else {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if (urlParams.has('check_process')) {
			running_test(urlParams.get('id'));
		} else {
			localStorage.running_test = false;
			localStorage.running_id = '';
		}
	}
}
async function stopProcess (pId) {
	const stopFetch = await fetch(
		`${global.prot}://${global.domain}${global.apiPort}/api/v1/test/${pId}/stop`,
		{
			method: 'GET',
			headers: {
				'Authorization': localStorage.getItem('token')
			}
		}
		)
	const result = await stopFetch.text();
	console.log(result);
	localStorage.running_test = false;
	localStorage.running_id = '';
}