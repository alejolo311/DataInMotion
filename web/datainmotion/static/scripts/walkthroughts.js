function oneNodeWalkthrought(id) {
	// console.log(id);
	// $('[cont_node_id=' + id + ']').css('z-index', '21');
	// $('[cont_node_id=' + id + ']').mousemove(function () {
	// 	$(this).css('z-index', '21');
	// });
	// $('[cont_node_id=' + id + ']').mouseleave(function () {
	// 	$(this).css('z-index', '21');
	// });
	// $('[cont_node_id=' + id + ']').find('.grabber').css('display', 'block');
	// $('.walkthrought').css('display', 'none');
}
// 	const width = document.getElementsByTagName('body')[0].scrollWidth;
// 	const height = document.getElementsByTagName('body')[0].scrollHeight;
// 	$('.walkthrought').css('width', width);
// 	$('.walkthrought').css('height', height);
// 	const nodeX = $('[cont_node_id=' + id + ']').position().top;
// 	const nodeY = $('[cont_node_id=' + id + ']').position().top;
// 	const topbar = $('.top_bar').height() + 54;
// 	// Innodes position
// 	const innodesX = $('[cont_node_id=' + id + ']').find('.add_in').offset().left - 34;
// 	const innodesY = $('[cont_node_id=' + id + ']').find('.add_in').offset().top - topbar;
// 	const inWindow = $('<div class="innodes_walk"><div class="box_bottom_arrow"></div></div>');
// 	$(inWindow).append($('<h1>Innodes</h1>'));
// 	$(inWindow).css('top', innodesY);
// 	$(inWindow).css('left', innodesX);
// 	$('.walk_window').append($(inWindow));
// 	console.log(nodeX, nodeY);
// 	console.log(innodesX, innodesY);
// 	// --------------------------------
// 	// Connections
// 	const conX = $('[cont_node_id=' + id + ']').find('[con_id]').offset().left;
// 	const conY = $('[cont_node_id=' + id + ']').find('[con_id]').offset().top - 20;
// 	const conWindow = $('<div class="innodes_walk"><div class="box_top_arrow"></div></div>');
// 	$(conWindow).append($('<h1>Connections</h1>'));
// 	$(conWindow).css('top', conY);
// 	$(conWindow).css('left', conX);
// 	$(conWindow).find('.box_top_arrow').css('left', 'calc(31%)');
// 	$('.walk_window').append($(conWindow));
// 	// Outnodes
// 	// issue: change innodes_walk class
// 	const outX = $('[cont_node_id=' + id + ']').find('.outnodes').offset().left + 100;
// 	const outY = $('[cont_node_id=' + id + ']').find('.outnodes').offset().top - 60;
// 	const outWindow = $('<div class="innodes_walk"><div class="box_left_arrow"></div></div>');
// 	$(outWindow).append($('<h1>Outnodes</h1>'));
// 	$(outWindow).css('top', outY);
// 	$(outWindow).css('left', outX);
// 	// $(outWindow).find('.box_left_arrow').css('left', 'calc(31%)');
// 	$('.walk_window').append($(outWindow));

// }