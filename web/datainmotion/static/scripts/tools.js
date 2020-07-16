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
      console.log(error);
    }
  });
}
let tmpOut;

function deep (index, path) {
  /*
  * Create the view for the task JSON log object
  * add listeners to the nodes so the respective content is loaded
  * to the view
  * needs some refatoring
  * also check the listeners behavior, make sure that they hidde and show
  * in the right order and flow
  */
  if (index === undefined) {
    const cont = $('.data_extractor');
    cont.empty();
    console.log(tmpOut.length);
    // Check if the tmpOut object is defined
    // this loop render the first layer
	// a node for each key in the JSON log
	// RENDER -> if the LOG is an array
    if (Array.isArray(tmpOut) && typeof tmpOut !== typeof 'string') {
      let index = 0;
      for (const el of tmpOut) {
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
          const va = el[index].toString();
          if (va.includes('https://', 0) || va.includes('http://', 0)) {
            console.log('is an url', va);
            $(link).on('click', function () {
              window.open(va);
            });
          }
        } else {
          $(copy).css('visibility', 'hidden');
          $(link).text(index);
          $(link).on('click', function () {
            if (!$(this).attr('clicked')) {
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
    // RENDER -> if the LOG is a Json object
    } else if (typeof tmpOut === typeof {}) {
      for (const key in tmpOut) {
        const div = $('<div cont="true"></div>');
        $(div).attr('path', key);
        const conte = $('<div node="true"></div>');
        const copy = $('<h3>copy</h3>');
        const opts = $('<h3>select</h3>');
        const optsCont = $('<div></div>');
        $(optsCont).addClass('options_container');
        const link = $('<h2></h2>');
        // console.log(tmpOut[key])
        if (typeof tmpOut[key] !== typeof [] && typeof tmpOut[key] !== typeof {}) {
          $(link).text(key + ': ' + tmpOut[key]);
          const va = tmpOut[key].toString();
          if (va.includes('https://', 0) || va.includes('http://', 0)) {
            console.log('is an url', va);
            $(link).on('click', function () {
              window.open(va);
            });
          }
        } else {
          $(copy).css('visibility', 'hidden');
          $(link).text(key);
          $(link).on('click', function () {
            if (!$(this).attr('clicked')) {
              // console.log('deeper in', $(this).text());
              // const p = $(this).parent().parent().attr('path');
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
    // if the object is a string or integer
    // render the value also
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
    // This sections controls the rest of the log levels
    // and set the listeners to create the recursive views
    const colors = ['#00FFB2',
      '#78d4f8',
      '#7979ff',
      '#af58be',
      '#ff5858',
      '#c20505',
      '#ff5100'
    ];
    // Search the right location for the view
    // by using the path variable
    // found the right container
    // and load the elements correponding to the key in the LOG
    const paths = path.split('/');
    let levels = 0;
    let obj = tmpOut;
    for (const p of paths) {
      if (!isNaN(Number(p))) {
        obj = obj[Number(p)];
      } else {
        obj = obj[p];
      }
      levels++;
    }
    // Create nodes when is list
    if (Array.isArray(obj) && typeof tmpOut !== typeof 'string') {
      let index = 0;
      for (const el of obj) {
        const parent = $('[path="' + path + '"]');
        const div = $('<div cont="true"></div>');
        $(div).attr('path', path + '/' + index.toString());
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
          const va = obj[index].toString();
          if (va.includes('https://', 0) || va.includes('http://', 0)) {
            console.log('is an url', va);
            $(link).on('click', function () {
              window.open(va);
            });
          }
          $(copy).css('visibility', 'visible');
        } else {
          $(copy).css('visibility', 'hidden');
          if ((el !== undefined && el !== null && typeof el === typeof [] && el.length < 1) ||
            (el !== undefined && el !== null && typeof el === typeof {} && Object.keys(el).length < 1)) {
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
    // Create nodes when node is json object
    } else if (typeof obj === typeof {}) {
      for (const key in obj) {
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
          const va = obj[key].toString();
          if (va.includes('https://', 0) || va.includes('http://', 0)) {
            console.log('is an url', va);
            $(link).on('click', function () {
              window.open(va);
            });
          }
          $(copy).css('visibility', 'visible');
        } else {
          $(copy).css('visibility', 'hidden');
          if ((obj[key] !== undefined && obj[key] !== null && typeof obj[key] === typeof [] && obj[key].length < 1) ||
            (obj[key] !== undefined && obj[key] !== null && typeof obj[key] === typeof {} && Object.keys(obj[key]).length < 1)) {
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
              $(this).parent().find('div[cont=true]').empty();
              $(this).parent().find('div[cont=true]').remove();
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
    // Create elements when node is string or number
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
  if (typeof tmpOut === typeof []) {
    for (const key in tmpOut) {
      const nodeCont = $('[name="' + key + '_cont"]');
      if (nodeCont) {
        const player = $(nodeCont).find('.media_player');
        if (player !== undefined && player !== null && $(player).css('display') !== 'none') {
          if (tmpOut !== undefined) {
            $(player).parent().parent().find('.media_cont').css('display', 'none');
            loadMedia(player);
          }
        }
      }
    }
  }
  $('.console_cont h1').on('click', function () {
    hideConsole();
  });
  deep(undefined, undefined);
}
function hideConsole () {
  $('.console_cont').css('display', 'none');
}
function copyToClipboard (value) {
  const inp = document.createElement('input');
  console.log(value);
  const paths = value.split('/');
  let obj = tmpOut;
  for (const p of paths) {
    if (!isNaN(Number(p))) {
      obj = obj[Number(p)];
    } else {
      obj = obj[p];
    }
  }
  inp.value = obj;
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
    showConsole(undefined);
  });
});
