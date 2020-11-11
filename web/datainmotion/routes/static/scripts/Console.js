
function loadRuns () {
	const bId = document.getElementById('board').getAttribute('board_id');
	console.log('LoadRuns');
	showConsole(bId, undefined);
	// call the API to get the last runs
	// draw a View to manage the list of runs
	// and the on click will call showConsole

}
/**
 * showConsole - Entrypoint to render the TestRunner Component
 * 
 * @param {Object} output - contains the data from the run
 */
function showConsole (boardId, output) {
	// Add the Logger script to head
	// remove previous script node
	if (window['LoggerManager']) {
		DOMManager.render(
			LoggerManager,
			document.getElementsByClassName('console_cont')[0],
			{
				'boardId': boardId,
				'log': output
			}
		);
	} else {
		let script = document.createElement('script');
		script.setAttribute('name', 'logger_script');
		script.type = 'text/javascript';
		script.onload = function(some) {
			window['LoggerManager'] = LoggerManager;
			DOMManager.render(
				LoggerManager,
				document.getElementsByClassName('console_cont')[0],
				{
					'boardId': boardId,
					'log': output
				}
			);
		}
		script.src = `/static/scripts/Logger.js?${uuid()}`;
		document.head.appendChild(script);
	}
}
function hideConsole () {
  $('.console_cont').css('display', 'none');
}
function copyToClipboard (value) {
	const inp = document.createElement('input');
	console.log(value);
	// const paths = value.split('/');
	inp.value = value;
	document.body.appendChild(inp);
	inp.select();
	inp.setSelectionRange(0, 99999);
	document.execCommand('copy');
	document.body.removeChild(inp);
	console.log('The node value was copied to clipboard');
}
// Definer the log button
$(window).on('load', function () {
	$('.toggle_console').on('click', function () {
		loadRuns();
	});
	const consoleLogger = document.getElementsByClassName('console')[0];
	if (consoleLogger) {
		consoleLogger.addEventListener('click', function(evn) {
			evn.target.classList.toggle('console_displayed');
			try {
				let string = '';
				for (const proc of processMessages) {
					string += `${proc}<br>`;
				}
				evn.target.innerHTML = string;
				console.log(processMessages);
			} catch (err) {
				console.log(err);
			}
		});
	}
});
