function loadPositions(){const n=$(".container").attr("board_id");$.ajax({url:`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${n}`,dataType:"json",contentType:"application/json",success:function(n){for(const t in n.nodes)$('[node_id="'+t+'"]').css("top",n.nodes[t].y),$('[node_id="'+t+'"]').css("left",n.nodes[t].x);board=n,drawConnections()}})}function goBack(){window.open("/user/boards","_self")}let saving=!1;function getBoardView(){const n=$(".container").attr("board_id");$(".container").css("width",$("html").css("width")),$(".board_name").on("click",function(){$(this).css("display","none"),$("[name=board_name]").css("display","block"),$("[name=board_name]").css("background-color","white"),$("[name=board_name]").val($(this).text().replace(/^\s+|\s+$/g,""))}),$("[name=board_name]").focusout(function(n){!1===saving&&($(this).css("display","none"),$(".board_name").css("display","block"),$(".board_name").text($(this).val()),saving=!0,saveBoardName($(this).val()))}),$("[name=board_name]").on("keydown",function(n){"Enter"===n.key&&!1===saving&&($(this).css("display","none"),$(".board_name").css("display","block"),$(".board_name").text($(this).val()),saving=!0,saveBoardName($(this).val()))});let t="";-1!==window.location.href.indexOf("lite")&&(t="?lite=true");const o=new Date(Date.now()),e=[o.getFullYear(),o.getMonth()+1,o.getDate(),o.getHours(),o.getMinutes(),o.getSeconds(),o.getMilliseconds()];fetch(`${global.prot}://${global.domain}${global.apiPort}/api/v1/boards/${n}/nodes${t}?sync_date="${e.join(" ")}"`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:localStorage.getItem("token")}}).then(function(n){if(200===n.status)return n.json();localStorage.openboard=$(".container").attr("board_id"),window.location.replace("/login")}).then(function(n){drawNodes(n)})}function drawNodes(n){let t="";-1!==window.location.href.indexOf("lite")&&(t="?lite=true"),fetch(`${global.prot}://${global.domain}/boards/nodes${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}).then(function(n){return n.json()}).then(function(n){if(""!==t)setLiteView(n),setNodeSettings(),setOpsListeners(),setConnectionsListeners(),$("#canvas_connections").attr("width",$('[grid="columns"]').css("width")),$("#canvas_connections").attr("height",$(".container").css("height")),$("#canvas_connections").css("width",$('[grid="columns"]').css("witdh")),$("#canvas_connections").css("height",$(".container").css("height")),drawConnections();else{unbindContainer(),$(".container").empty(),$(".container").append($(n.nodes)),popup(),setGrabbers(),loadPositions(),setNodeSettings(),setOpsListeners(),setConnectionsListeners(),setMediaPlayerListeners();const t=window.outerWidth+400,o=window.outerHeight+400;$("#canvas_connections").attr("width",t),$("#canvas_connections").attr("height",o+1e3),$("#canvas_connections").css("width",t),$("#canvas_connections").css("height",o+1e3),$("#canvas_grid").attr("width",t),$("#canvas_grid").attr("height",o+1e3),$("#canvas_grid").css("width",t),$("#canvas_grid").css("height",o+1e3),$(".container").css("width",t),$(".container").css("height",o),$("body").css("height",o),$("body").css("width",t);const e="linear-gradient(to right, var(--board_color), var(--board_color_end))";$("body").css("background-image",e),drawGrid(),$("[action=user]").on("click",function(){goBack()});const s=$("[cont_node_id]");s.length}})}