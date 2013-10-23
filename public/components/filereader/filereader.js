!function(e,t){function n(e,t){function n(e){for(var t=[],n=e.clipboardData||{},i=n.items||[],o=0;o<i.length;o++){var a=i[o].getAsFile();if(a){var s=new RegExp("/(.*)").exec(a.type);if(!a.name&&s){var c=s[1];a.name="clipboard"+o+"."+c}t.push(a)}}t.length&&(u(e,t,r),e.preventDefault(),e.stopPropagation())}if(y.enabled){var r=c(c({},y.opts),t);e.addEventListener("paste",n,!1)}}function r(e,t){function n(t){u(t,e.files,i)}function r(e){e.stopPropagation(),e.preventDefault(),u(e,e.dataTransfer.files,i)}if(y.enabled){var i=c(c({},y.opts),t);e.addEventListener("change",n,!1),e.addEventListener("drop",r,!1)}}function i(e,n){function r(){$=!1}function i(){$=!0}function o(e){e.dataTransfer.files&&e.dataTransfer.files.length&&(e.stopPropagation(),e.preventDefault())}function a(e){return function(){$||e.apply(this,arguments)}}function s(t){t.stopPropagation(),t.preventDefault(),v&&d(e,v),u(t,t.dataTransfer.files,m)}function l(t){t.stopPropagation(),t.preventDefault(),v&&f(e,v)}function h(){v&&d(e,v)}function p(t){t.stopPropagation(),t.preventDefault(),v&&f(e,v)}if(y.enabled){var m=c(c({},y.opts),n),v=m.dragClass,$=!1;e.addEventListener("dragenter",a(l),!1),e.addEventListener("dragleave",a(h),!1),e.addEventListener("dragover",a(p),!1),e.addEventListener("drop",a(s),!1),t.body.addEventListener("dragstart",i,!0),t.body.addEventListener("dragend",r,!0),t.body.addEventListener("drop",o,!1)}}function o(e,t){for(var n=0;n<e.length;n++){var r=e[n];r.extra={nameNoExtension:r.name.substring(0,r.name.lastIndexOf(".")),extension:r.name.substring(r.name.lastIndexOf(".")+1),fileID:n,uniqueID:x(),groupID:t,prettySize:h(r.size)}}}function a(e,t,n){for(var r in t)if(e.match(new RegExp(r)))return"readAs"+t[r];return"readAs"+n}function u(e,t,n){function r(){s.ended=new Date,n.on.groupend(s)}function i(){0===--u&&r()}var u=t.length,s={groupID:w(),files:t,started:new Date};if(y.output.push(s),o(t,s.groupID),n.on.groupstart(s),!t.length)return r(),void 0;var c,l=y.sync&&m;l&&(c=b.getWorker(v,function(e){var t=e.data.file,r=e.data.result;t.extra||(t.extra=e.data.extra),t.extra.ended=new Date,n.on["error"===r?"error":"load"]({target:{result:r}},t),i()})),Array.prototype.forEach.call(t,function(t){if(t.extra.started=new Date,n.accept&&!t.type.match(new RegExp(n.accept)))return n.on.skip(t),i(),void 0;if(n.on.beforestart(t)===!1)return n.on.skip(t),i(),void 0;var r=a(t.type,n.readAsMap,n.readAsDefault);if(l&&c)c.postMessage({file:t,extra:t.extra,readAs:r});else{var o=new p;o.originalEvent=e,g.forEach(function(e){o["on"+e]=function(r){("load"==e||"error"==e)&&(t.extra.ended=new Date),n.on[e](r,t),"loadend"==e&&i()}}),o[r](t)}})}function s(){}function c(e,t){for(var n in t)t[n]&&t[n].constructor&&t[n].constructor===Object?(e[n]=e[n]||{},arguments.callee(e[n],t[n])):e[n]=t[n];return e}function l(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)}function f(e,t){l(e,t)||(e.className=e.className?[e.className,t].join(" "):t)}function d(e,t){if(l(e,t)){var n=e.className;e.className=n.replace(new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)","g")," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}}function h(e){var t=["bytes","kb","MB","GB","TB","PB"],n=Math.floor(Math.log(e)/Math.log(1024));return(e/Math.pow(1024,Math.floor(n))).toFixed(2)+" "+t[n]}var p=e.FileReader,m=!1,v="self.addEventListener('message', function(e) { var data=e.data; try { var reader = new FileReaderSync; postMessage({ result: reader[data.readAs](data.file), extra: data.extra, file: data.file})} catch(e){ postMessage({ result:'error', extra:data.extra, file:data.file}); } }, false);",g=["loadstart","progress","load","abort","error","loadend"],y=e.FileReaderJS={enabled:!1,setupInput:r,setupDrop:i,setupClipboard:n,sync:!1,output:[],opts:{dragClass:"drag",accept:!1,readAsDefault:"BinaryString",readAsMap:{"image/*":"DataURL","text/*":"Text"},on:{loadstart:s,progress:s,load:s,abort:s,error:s,loadend:s,skip:s,groupstart:s,groupend:s,beforestart:s}}};if("undefined"!=typeof jQuery&&(jQuery.fn.fileReaderJS=function(e){return this.each(function(){$(this).is("input")?r(this,e):i(this,e)})},jQuery.fn.fileClipboard=function(e){return this.each(function(){n(this,e)})}),p){var b=function(){function t(t){if(e.Worker&&i&&r){var n=new i;return n.append(t),r.createObjectURL(n.getBlob())}return null}function n(e,n){var r=t(e);if(r){var i=new Worker(r);return i.onmessage=n,i}return null}var r=e.URL||e.webkitURL,i=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder;return{getURL:t,getWorker:n}}(),w=function(e){return function(){return e++}}(0),x=function(e){return function(){return e++}}(0);y.enabled=!0}}(this,document);