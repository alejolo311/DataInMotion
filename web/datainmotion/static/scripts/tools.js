function autosave (evn) {
	// // console.log(board);
	// // console.log($('.container').attr('board_id'));
	const boardId = $('.container').attr('board_id');
	$.ajax({
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		url: `http://${global.apiDirection}:8080/api/v1/boards/${boardId}`,
		data: JSON.stringify(board),
		success: function (resp) {
			// // console.log(resp);
		},
		error: function (error) {
			// // console.log(error);
		}
	});

}
let tmpOut;

function deep(index, path) {
	// console.log('=============================');
	// console.log(index, path);
	// console.log('=============================');
	if (index === undefined) {
		const cont = $('.data_extractor');
		cont.empty();
		console.log(tmpOut.length);
		if (Array.isArray(tmpOut) && typeof tmpOut !== typeof 'string') {
			let index = 0;
			for (el of tmpOut) {
				const div = $('<div cont="true"></div>');
				const conte = $('<div node="true"></div>');
				const copy = $('<h3>copy</h3>');
				const opts = $('<h3>select</h3>');
				const optsCont = $('<div></div>');
				$(optsCont).addClass('options_container');
				const link = $('<h2></h2>');
				div.attr('path', index.toString());
				console.log(el);
				if (typeof el !== typeof [] && typeof el !== typeof {}) {
					$(link).text(index + ': ' + el[index]);
					let va = el[index].toString();
					if (va.includes('https://', 0) || va.includes('http://', 0)) {
						console.log('is an url', va);
						$(link).on('click', function () {
							window.open(va);
						});
					}
				}else {
					$(copy).css('visibility', 'hidden');
					$(link).text(index);
					$(link).on('click', function () {
						if (!$(this).attr('clicked')) {
							// console.log('deeper in', $(this).text());
							const p = $(this).parent().parent().attr('path');
							$(this).attr('clicked', true);
							deep($(this).text(), $(this).text());
						} else {
							$(this).removeAttr('clicked');
							$(this).parent().parent().find('div[cont=true]').remove();
						}
					});
				}
				$(link).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(link).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(opts).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
				});
				$(optsCont).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(optsCont).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(copy).click(function () {
					// COPY TO CLIPBOARD
					console.log($(this).parent().parent().parent().attr('path'));
					copyToClipboard($(this).parent().parent().parent().attr('path'));
				});
				$(conte).append(link);
				$(optsCont).append(opts);
				$(optsCont).append(copy);
				$(conte).append(optsCont);
				$(div).append(conte);
				cont.append($(div));
				index++;
			}
		} else if (typeof tmpOut === typeof {}) {
			for (key in tmpOut) {
				const div = $('<div cont="true"></div>');
				$(div).attr('path', key);
				const conte = $('<div node="true"></div>');
				const copy = $('<h3>copy</h3>');
				const opts = $('<h3>select</h3>');
				const optsCont = $('<div></div>');
				$(optsCont).addClass('options_container');
				const link = $('<h2></h2>');
				// console.log(tmpOut[key])
				if (typeof tmpOut[key] !== typeof [] && typeof tmpOut[key] !== typeof {})
				{
					$(link).text(key + ': ' + tmpOut[key]);
					let va = tmpOut[key].toString();
					if (va.includes('https://', 0) || va.includes('http://', 0)) {
						console.log('is an url', va);
						$(link).on('click', function () {
							window.open(va);
						});
					}
				}else {
					$(copy).css('visibility', 'hidden');
					$(link).text(key);
					$(link).on('click', function () {
						if (!$(this).attr('clicked')) {
							// console.log('deeper in', $(this).text());
							const p = $(this).parent().parent().attr('path');
							$(this).attr('clicked', true);
							deep($(this).text(), $(this).text());
						} else {
							$(this).removeAttr('clicked');
							$(this).parent().parent().find('div[cont=true]').remove();
						}
					});
				}
				$(link).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(link).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(opts).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
				});
				$(optsCont).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(optsCont).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(copy).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
					copyToClipboard($(this).parent().parent().parent().attr('path'));
				});
				$(conte).append(link);
				$(optsCont).append(opts);
				$(optsCont).append(copy);
				$(conte).append(optsCont);
				$(div).append(conte);
				cont.append($(div));
				// console.log()
			}
		} else {
			const parent = $('[path="' + path + '"]');
			const div = $(parent).find('div')[0];
			// console.log(div);
			if (div !== undefined) {
				$(div).remove();
			} else {
				const div = $('<div></div>');
				const link = $('<h2></h2>');
				$(link).css('margin-left', '30px');
				$(link).css('background-color', 'grey');
				$(link).text(tmpOut);
				$(div).append(link);
				$(parent).append($(div));
				// console.log(obj);
			}
		}
	} else {
		const colors = ['#00FFB2',
			'#78d4f8',
			'#7979ff',
			'#af58be',
			'#ff5858',
			'#c20505',
			'#ff5100',
		]
		const paths = path.split('/');
		let levels = 0;
		let obj = tmpOut;
		// console.log(paths);
		for (p of paths) {
			// console.log(Number(p));
			if (!isNaN(Number(p))) {
				// console.log('is index');
				obj = obj[Number(p)];
			} else {
				// console.log('is key');
				obj = obj[p];
			}
			levels++;
		}
		// console.log('node info');
		// console.log(path, obj, levels);
		// Create nodes when is list
		if (Array.isArray(obj) && typeof tmpOut !== typeof 'string') {
			let index = 0;
			for (el of obj) {
				const parent = $('[path="' + path + '"]');
				const div = $('<div cont="true"></div>');
				$(div).attr('path', path + '/' +index.toString());
				const cont = $('<div node="true"></div>');
				const opts = $('<h3>select</h3>');
				const copy = $('<h3>copy</h3>');
				const optsCont = $('<div></div>');
				$(optsCont).addClass('options_container');
				const link = $('<h2></h2>');
				$(div).css('margin-left', '30px');
				$(link).css('background-color', colors[levels]);
				// console.log(typeof el, el, index);
				if (typeof el !== typeof [] && typeof el !== typeof {}) {
					$(link).css('background-color', 'white');
					$(link).css('border', '1px solid black');
					$(link).css('color', 'black');
					$(link).text(index.toString() + ': ' + obj[index].toString());
					let va = obj[index].toString();
					if (va.includes('https://', 0) || va.includes('http://', 0)) {
						console.log('is an url', va);
						$(link).on('click', function () {
							window.open(va);
						});
					}
					$(copy).css('visibility', 'visible');
				} else {
					$(copy).css('visibility', 'hidden');
					if (el !== undefined && el !== null && typeof el === typeof [] && el.length < 1 ||
						el !== undefined && el !== null && typeof el === typeof {} && Object.keys(el).length < 1) {
							$(link).css('background-color', 'white');
							$(link).css('border', '1px solid black');
							$(link).css('color', 'black');
							$(copy).css('visibility', 'visible');
					} else if (el === null || el === undefined) {
						continue;
					}
					$(link).text(index);
					$(link).on('click', function () {
						if (!$(this).attr('clicked')) {
							// console.log('deeper in', $(this).text());
							const p = $(this).parent().parent().attr('path');
							$(this).attr('clicked', true);
							deep($(this).text(), p);
						} else {
							$(this).removeAttr('clicked');
							$(this).parent().parent().find('div[cont=true]').remove();
						}
					});
				}
				$(link).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(link).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(opts).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
				});
				$(optsCont).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(optsCont).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(copy).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
					copyToClipboard($(this).parent().parent().parent().attr('path'));
				});
				$(cont).append(link);
				$(optsCont).append(opts);
				$(optsCont).append(copy);
				$(cont).append(optsCont);
				$(div).append(cont);
				$(parent).append($(div));
				index++;
			}
		} else if (typeof obj === typeof {}) {
			// console.log(obj);
			for (key in obj) {
				const parent = $('[path="' + path + '"]');
				const div = $('<div cont="true"></div>');
				const cont = $('<div node="true"></div>');
				const copy = $('<h3>copy</h3>');
				const opts = $('<h3>select</h3>');
				const optsCont = $('<div></div>');
				$(optsCont).addClass('options_container');
				$(div).attr('path', path + '/' + key);
				const link = $('<h2></h2>');
				$(div).css('margin-left', '30px');
				$(link).css('background-color', colors[levels]);
				// console.log(key, obj[key]);
				if (typeof obj[key] !== typeof [] && typeof obj[key] !== typeof {}) {
					$(link).css('background-color', 'white');
					$(link).css('border', '1px solid black');
					$(link).css('color', 'black');
					$(link).text(key + ': ' + obj[key].toString());
					let va = obj[key].toString();
					if (va.includes('https://', 0) || va.includes('http://', 0)) {
						console.log('is an url', va);
						$(link).on('click', function () {
							window.open(va);
						});
					}
					$(copy).css('visibility', 'visible');
				} else {
					$(copy).css('visibility', 'hidden');
					if (obj[key] !== undefined && obj[key] !== null && typeof obj[key] === typeof [] && obj[key].length < 1 ||
						obj[key] !== undefined && obj[key] !== null && typeof obj[key] === typeof {} && Object.keys(obj[key]).length < 1) {
						$(link).css('background-color', 'white');
						$(link).css('border', '1px solid black');
						$(link).css('color', 'black');
						$(copy).css('visibility', 'visible');
					} else if (obj[key] === null || obj[key] === undefined) {
						continue;
					}
					$(link).text(key);
					$(link).on('click', function () {
						if (!$(this).attr('clicked')) {
							// console.log('deeper in', $(this).text());
							const p = $(this).parent().parent().attr('path');
							$(this).attr('clicked', true);
							deep($(this).text(), p);
						} else {
							$(this).removeAttr('clicked');
							$(this).parent().parent().find('div[cont=true]').empty();
							$(this).parent().parent().find('div[cont=true]').remove();
						}
						
					});
				}
				$(link).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(link).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(opts).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
				});
				$(optsCont).mouseleave(function () {
					$(this).parent().find('h3').css('display', 'none');
				});
				$(optsCont).mousemove(function () {
					$(this).parent().find('h3').css('display', 'block');
				});
				$(copy).click(function () {
					console.log($(this).parent().parent().parent().attr('path'));
					copyToClipboard($(this).parent().parent().parent().attr('path'));
				});

				$(cont).append(link);
				$(optsCont).append(opts);
				$(optsCont).append(copy);
				$(cont).append(optsCont);
				$(div).append(cont);
				$(parent).append($(div));
			}
		} else {
			const parent = $('[path="' + path + '"]');
			const div = $(parent).find('div')[0];
			// console.log(div);
			if (div !== undefined) {
				$(div).remove();
			} else {
				const div = $('<div></div>');
				const link = $('<h2></h2>');
				$(link).css('margin-left', '30px');
				$(link).css('background-color', 'grey');
				$(link).text(obj);
				$(div).append(link);
				$(parent).append($(div));
				// console.log(obj);
			}
		}
	}
}


function showConsole (output) {
	if (output === undefined) {
		output = tmpOut;
	}
	tmpOut = output;
	$('.console_cont').css('display', 'block');
	// $('.console_cont pre').html(JSON.stringify(output, undefined, 2));
	// console.log(tmpOut);
	$('.console_cont h1').on('click', function () {
		hideConsole();
	});
	deep(undefined, undefined);
}
function hideConsole () {
	$('.console_cont').css('display', 'none');
};
function copyToClipboard(value) {
	const inp = document.createElement('input');
	console.log(value);
	const paths = value.split('/');
	let levels = 0;
	let obj = tmpOut;
	for (p of paths) {
		if (!isNaN(Number(p))) {
			obj = obj[Number(p)];
		} else {
			obj = obj[p];
		}
		levels++;
	}
	inp.value = obj;
	document.body.appendChild(inp);
	inp.select();
	inp.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(inp);
	console.log('The node value was copied to clipboard');
};
$(window).on('load', function () {
	$('.save').on('click', autosave);
	$('.toggle_console').on('click', function () {
		showConsole(undefined);
	});
});