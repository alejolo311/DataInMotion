function autosave (evn) {
  const boardId = $('.container').attr('board_id');
  $.ajax({
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}`,
    data: JSON.stringify(board),
    success: function (resp) {
      console.log(resp);
    },
    error: function (error) {
      // console.log(error);
    }
  });
}

function loadRuns () {
	console.log('LoadRuns');
	showConsole(undefined);
	// call the API to get the last runs
	// draw a View to manage the list of runs
	// and the on click will call showConsole

}

/**
 * showConsole - Draw a Run view creating a visual tree
 * 
 * @param {Object} output - contains the data from the run
 */
function showConsole (output) {
	// Add Calendar script to head
	// remove previous script node
	const scripts = document.head.querySelectorAll('script');
	for (const script of scripts) {
		if (script.getAttribute('name') === 'logger_script') {
			script.remove();
		}
	}
	let script = document.createElement('script');
	script.setAttribute('name', 'logger_script');
	script.type = 'text/javascript';
	script.onload = function(some) {
		console.log(some);
		console.log('render Logger');
		const boardId = $('.container').attr('board_id');
		console.log('loading', boardId);
		DOMManager.render(
			LoggerManager,
			document.getElementsByClassName('console_cont')[0],
			{
				'boardId': boardId
			}
		);
	}
	script.src = `/static/scripts/Logger.js?${uuid()}`;
	document.head.appendChild(script);
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
$(window).on('load', function () {
	$('.save').on('click', autosave);
	$('.toggle_console').on('click', function () {
		loadRuns();
	});
	const consoleLogger = document.getElementsByClassName('console')[0];
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
});
