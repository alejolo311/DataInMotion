function setLiteView(n){connections=n[1],nodes=n[0];const e=$('<ul grid="columns"></ul>');let o=[],t="";for(nod of Object.keys(connections))"service"===connections[nod].type&&(t=nod,o.push(innodesDeep(connections,nod)));const s=Math.max.apply(Math,o);for(innode of(o=[],connections[t].innodes)){for(inn of connections[innode].innodes)o.push(outnodesDeep(connections,inn));o.push(outnodesDeep(connections,innode))}const i=Math.max.apply(Math,o);$(e).css("grid-template-columns",`repeat(${s+i+2}, 180px)`),drawServiceFlows(e,connections,s,i,t)}function drawServiceFlows(n,e,o,t,s){for(conn in e)conn.type;const i=flowHeight(e,s);let d=o+t+2;$(n).empty();for(let e=0;e<d;e++){const e=$('<li class="col"><ul grid="rows"></ul></li>'),o=$(e).find('[grid="rows"]');for(let n=0;n<i;n++)$(o).append($("<li></li>"));$(n).append($(e))}$(".container").empty(),$(".container").append($(n));const r=document.querySelectorAll('[grid="columns"] .col'),l=getCell(r,o,0);let c=o;l.innerHTML=e[s].template,drawInnodes(r,e,s,{x:c,y:0,h:i})}function getCell(n,e,o){let t=n[e].querySelectorAll('[grid="rows"] li')[o],s=1;for(;""!==t.innerHTML;)t=n[e].querySelectorAll('[grid="rows"] li')[o+s],s+=1;return t}function drawInnodes(n,e,o,t){if(e[o].innodes.length>0)for(let s=0;s<e[o].innodes.length;s++){getCell(n,t.x-1,s+t.y).innerHTML=e[e[o].innodes[s]].template,drawInnodes(n,e,e[o].innodes[s],{x:t.x-1,y:t.y,h:t.h}),drawOutnodes(n,e,e[o].innodes[s],{x:t.x,y:t.y,h:t.h})}}function drawOutnodes(n,e,o,t){if(e[o].outnodes.length>0)for(let s=0;s<e[o].outnodes.length;s++){getCell(n,t.x,s+t.y).innerHTML=e[e[o].outnodes[s]].template,drawInnodes(n,e,e[o].outnodes[s],{x:t.x,y:t.y,h:t.h}),drawOutnodes(n,e,e[o].outnodes[s],{x:t.x+1,y:t.y,h:t.h})}}function flowHeight(n,e){function o(n,e){if(n[e].outnodes.length>0){const t=[];for(outnode of n[e].outnodes)t.push(o(n,outnode));return Math.max.apply(Math,t)+n[e].outnodes.length}return 0}const t=function n(e,o){if(e[o].innodes.length>0){const t=[];for(innode of e[o].innodes)t.push(n(e,innode));return Math.max.apply(Math,t)+e[o].innodes.length}return 0}(n,e),s=[];for(const t of n[e].innodes)s.push(o(n,t));const i=Math.max.apply(Math,s);return Math.max.apply(Math,[t,i])}function innodesDeep(n,e){if(n[e].innodes.length>0){const o=[];for(innode of n[e].innodes)o.push(innodesDeep(n,innode));return Math.max(o)+1}return 0}function outnodesDeep(n,e){if(n[e].outnodes.length>0){const o=[];for(outnode of n[e].outnodes)o.push(outnodesDeep(n,outnode));let t=Math.max.apply(Math,o);return isNaN(t)&&(t=0),t+1}return 0}