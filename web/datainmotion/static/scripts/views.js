// Get the board from the Server
function loadPositions () {
  const boardId = $('.container').attr('board_id');
  $.ajax({
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${boardId}`,
    dataType: 'json',
    contentType: 'application/json',
    success: function (resp) {
      // change 'resp' for 'resp.nodes'
      // console.log(resp);
      for (const key in resp.nodes) {
        // console.log(key);
        $('[node_id="' + key + '"]').css('top', resp.nodes[key].y);
        $('[node_id="' + key + '"]').css('left', resp.nodes[key].x);
      }
      board = resp;
      drawConnections();
    }
  });
}
function goBack () {
  console.log('Go back', board);
  window.open('/user/' + board.user_id + '/boards', '_self');
}
let saving = false;
function getBoardView () {
  const boardId = $('.container').attr('board_id');
  $('.container').css('width', $('html').css('width'));
  // Detect when board name is pressed
  $('.board_name').on('click', function () {
    console.log('chage board name');
    $(this).css('display', 'none');
    $('[name=board_name]').css('display', 'block');
	$('[name=board_name]').css('background-color', 'white');
	// strip the boardname
    $('[name=board_name]').val($(this).text().replace(/^\s+|\s+$/g, ''));
  });
  $('[name=board_name]').focusout(function (evn) {
    // console.log($(this).val());
    if (saving === false) {
      $(this).css('display', 'none');
      $('.board_name').css('display', 'block');
      $('.board_name').text($(this).val());
      saving = true;
      saveBoardName($(this).val());
    }
  });
  $('[name=board_name]').on('keydown', function (evn) {
    console.log(evn.key);
    if (evn.key === 'Enter') {
      if (saving === false) {
        $(this).css('display', 'none');
        $('.board_name').css('display', 'block');
        $('.board_name').text($(this).val());
        saving = true;
        saveBoardName($(this).val());
      }
    }
  });
  $.ajax({
    url: `${global.prot}://${global.domain}${global.apiPort}/api/v1/status`,
    success: function (data) {
      $.ajax({
        url: `${global.prot}://${global.domain}/boards/${boardId}/nodes`,
        success: async function (nodes) {

		  // console.log(nodes);
		  // $('.container').empty();
		  // console.log(nodes);
		  unbindContainer();
		  $('.container').append($(nodes));
		  // await timeSleep(000);
          popup();
          setGrabbers();
          loadPositions();
          setNodeSettings();
          setOpsListeners();
          setConnectionsListeners();
          setMediaPlayerListeners();
          const width = window.outerWidth + 400;
          const height = window.outerHeight + 400;
          console.log(width, height);
          $('#canvas_connections').attr('width', width);
          $('#canvas_connections').attr('height', height);
          $('#canvas_connections').css('width', width);
          $('#canvas_connections').css('height', height);
          $('#canvas_grid').attr('width', width);
          $('#canvas_grid').attr('height', height);
          $('#canvas_grid').css('width', width);
          $('#canvas_grid').css('height', height);
          $('.container').css('width', width);
          $('.container').css('height', height);
          $('body').css('height', height);
          $('body').css('width', width);
          const gradient = 'linear-gradient(to right, var(--board_color), var(--board_color_end))';
          $('body').css('background-image', gradient);
          drawGrid();
          $('[action=user]').on('click', function () {
            goBack();
		  });
		  const nods = $('[cont_node_id]');
		  console.log($(nods).length);
		  if (nods.length === 1) {
			  console.log('Show walkthrought');
			  console.log($($(nods)[0]).position().left, $($(nods)[0]).position().top);
			  oneNodeWalkthrought($($(nods)[0]).attr('cont_node_id'));
		  }
          // console.log(nodes);
        }
      });
    },
    error: function (err) {
      console.log(err);
    }
  });
}
