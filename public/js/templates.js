!function(){function t(t,n){var i=[],o=t.terse;delete t.terse;var a=Object.keys(t),s=a.length;if(s){i.push("");for(var u=0;s>u;++u){var l=a[u],c=t[l];"boolean"==typeof c||null==c?c&&(o?i.push(l):i.push(l+'="'+l+'"')):0==l.indexOf("data")&&"string"!=typeof c?i.push(l+"='"+JSON.stringify(c)+"'"):"class"==l?n&&n[l]?(c=e(r(c)))&&i.push(l+'="'+c+'"'):(c=r(c))&&i.push(l+'="'+c+'"'):n&&n[l]?i.push(l+'="'+e(c)+'"'):i.push(l+'="'+c+'"')}}return i.join(" ")}function e(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function n(t){return null!=t&&""!==t}function r(t){return Array.isArray(t)?t.map(r).filter(n).join(" "):t}window.templates=window.templates||{};var i={attrs:t,escape:e};templates.alert=function(t){var e=[],n=t||{},r=n.classes,o=n.title,a=n.message,s=n.button,u=n.buttonClass;return e.push("<div"+i.attrs({"class":[""+r,"alert","fade","in"]},{})+"><p><strong>"+(null==(i.interp=o)?"":i.interp)+"</strong>"+(null==(i.interp=" "+a)?"":i.interp)+"</p>"),s&&e.push("<p><button"+i.attrs({type:"button","class":[""+u,"btn","alert-button"]},{type:!0})+">"+i.escape(null==(i.interp=s)?"":i.interp)+"</button></p>"),e.push("</div>"),e.join("")},templates.ballotSheet=function(){function t(t){for(var e=0;4>e;e++)n.push("<td"+i.attrs({"class":["valid-{{valid"+t+e+"}}","nowrap"]},{})+"><text-edit-cell"+i.attrs({bind:"o.scores["+t+"]["+e+"]",enabled:"!o.total",valid:"valid"+t+e,"input-width":"17",pattern:"[0-9.]*",setter:"parseFloat(o)",getter:"truncFloat(o, 2)","soft-validator":"validateMinMax(o, "+(3==e?30:60)+", "+(3==e?40:80)+")"},{bind:!0,enabled:!0,valid:!0,"input-width":!0,pattern:!0,setter:!0,getter:!0,"soft-validator":!0})+"></text-edit-cell><i"+i.attrs({"ng-show":"valid"+t+e+" && (o.scores["+t+"]["+e+"] <= "+(3==e?30.5:61)+" || o.scores["+t+"]["+e+"] >= "+(3==e?39.5:79)+")","class":["icon-exclamation","icon-dobitoc"]},{"ng-show":!0})+"></i></td>")}function e(t){n.push("<td>{{truncFloat(o.scores["+i.escape(null==(i.interp=t)?"":i.interp)+"][0] + o.scores["+i.escape(null==(i.interp=t)?"":i.interp)+"][1] + o.scores["+i.escape(null==(i.interp=t)?"":i.interp)+"][2] + o.scores["+i.escape(null==(i.interp=t)?"":i.interp)+"][3], 2)}}</td>")}var n=[];n.push('<div ng-show="lockJudgesInfo" class="alert alert-info"><button type="button" ng-click="lockJudgesInfo=false" class="close">&times;</button><strong>Warning!</strong> Once you submit this ballot sheet, the judges for this match are going to be locked in and can\'t be modified or reordered anymore.</div><div ng-show="noJudgesWarning" class="alert"><button type="button" ng-click="noJudgesWarning=false" class="close">&times;</button><strong>Warning!</strong> There are no judges assigned to this match. You can still enter scores for the teams, but since they aren\'t bound to any judge, they won\'t matter for the judges tab. Furthermore, you cannot assign judges after submitting this ballot sheet.</div><div ng-show="outOfRangeError" class="alert alert-error"><button type="button" ng-click="outOfRangeError=false" class="close">&times;</button><strong>Error!</strong> The scores are not within the valid World Schools range.</div><div ng-show="drawsError" class="alert alert-error"><button type="button" ng-click="drawsError=false" class="close">&times;</button><strong>Error!</strong> Draws are not valid in the World Schools format.</div><table editable-table="editable-table" show-gear="false" model="roles" id="roles-table"><thead><tr><th data-auto-index=\'5\'>Side</th><th data-auto-index=\'4\'>1st Speaker</th><th data-auto-index=\'3\'>2nd Speaker</th><th data-auto-index=\'2\'>3rd Speaker</th><th data-auto-index=\'1\'>Reply Speaker</th></tr></thead><tbody editable-tbody="editable-tbody"><script type="text/html"><td class="nowrap"><input type="checkbox" ng-model="presence[$index]" class="presence-check"/><span class="{{sidesClass[$index]}} strong">{{sides[$index]}}</span></td>');for(var r=0;4>r;r++)n.push('<td class="nowrap"><span ng-show="!presence[$index]" class="muted-true">not present</span><span ng-show="presence[$index]"><multi-cell'+i.attrs({bind:"o.roles["+r+"]","input-width":"120",choices:"speakers[$index]","choice-name":"o.name"},{bind:!0,"input-width":!0,choices:!0,"choice-name":!0})+"></multi-cell><i"+i.attrs({"ng-show":""+(3==r?"o.roles[3] == o.roles[2]":"validPlayer(o.roles["+r+"], o.roles) >= 2"),"class":["icon-exclamation","icon-dobitoc"]},{"ng-show":!0})+"></i></span></td>");return n.push('</script></tbody></table><div ng-show="presence[0] &amp;&amp; presence[1]"><table editable-table="editable-table" show-gear="false" model="votes" id="votes-table"><thead><tr><th data-auto-index=\'5\'>#</th><th data-auto-index=\'1\'>Judge</th><th data-auto-index=\'3\' class="prop">P1</th><th data-auto-index=\'3\' class="prop">P2</th><th data-auto-index=\'3\' class="prop">P3</th><th data-auto-index=\'3\' class="prop">PR</th><th data-auto-index=\'4\' class="prop">Prop</th><th data-auto-index=\'2\'>vs.</th><th data-auto-index=\'4\' class="opp">Opp</th><th data-auto-index=\'3\' class="opp">O1</th><th data-auto-index=\'3\' class="opp">O2</th><th data-auto-index=\'3\' class="opp">O3</th><th data-auto-index=\'3\' class="opp">OR</th></tr></thead><tbody editable-tbody="editable-tbody"><script type="text/html"><td>{{$index + 1}}</td><td> <span>{{o.judge.name}}</span><span ng-show="o.judge == null" class="muted-true">Not assigned</span></td>'),t(0),e(0),n.push('<td class="valid-{{o.aux.decisionValid}}"><span ng-show="o.aux.decisionValid" class="nowrap"><multi-cell bind="o.prop" enabled="!o.total &amp;&amp; (o.aux.validSplits[o.aux.winner].length &gt; 1)" input-width="41" choices="o.aux.validSplits[o.aux.winner]" choice-name="o"></multi-cell><span> </span><i class="{{winner(o)}} vote-trophy icon-trophy"></i><span> </span><multi-cell bind="o.opp" enabled="!o.total &amp;&amp; (o.aux.validSplits[1-o.aux.winner].length &gt; 1)" input-width="41" choices="o.aux.validSplits[1-o.aux.winner]" choice-name="o"></multi-cell></span><span ng-show="!o.aux.decisionValid &amp;&amp; !o.total">Draw</span><span ng-show="!o.aux.decisionValid &amp;&amp; o.total">Invalid</span></td>'),e(1),t(1),n.push('</script></tbody></table></div><style type="text/css">#roles-table th:nth-child(1) {\n  width: 50px;\n}\n#roles-table th:nth-child(2),\n#roles-table th:nth-child(3),\n#roles-table th:nth-child(4),\n#roles-table th:nth-child(5) {\n  width: 127px;\n}\n#votes-table th:nth-child(1) {\n  width: 20px;\n}\n#votes-table th:nth-child(2) {\n  width: 100px;\n}\n#votes-table th:nth-child(3),\n#votes-table th:nth-child(4),\n#votes-table th:nth-child(5),\n#votes-table th:nth-child(6),\n#votes-table th:nth-child(10),\n#votes-table th:nth-child(11),\n#votes-table th:nth-child(12),\n#votes-table th:nth-child(13) {\n  width: 20px;\n}\n#votes-table th:nth-child(7),\n#votes-table th:nth-child(9) {\n  width: 30px;\n}\n#votes-table th:nth-child(8) {\n  width: 40px;\n}\n#votes-table td.valid-false {\n  background-color: #b94a48;\n  color: #fff;\n}\n#votes-table td.valid-false .textedit-cell.invalid .textedit-label {\n  color: #fff;\n}\ninput[type="checkbox"].presence-check {\n  margin: 0px 5px 0px 0px;\n}\n.icon-dobitoc {\n  color: #b94a48;\n  margin-left: 3px;\n}\n</style>'),n.join("")},templates.editableTable=function(){var t=[];return t.push('<table editable-head-transclude="editable-head-transclude" class="{{tableId}} {{tableClass}} editable-table"></table>'),t.join("")},templates.editableTbody=function(){var t=[];return t.push('<tr ng-repeat="o in getScope().model" ng-init="hover = false; initRepeatScope(this)" ng-mouseenter="mouseEnter()" ng-mouseleave="mouseLeave()" ng-click="rowClicked($index)" editable-script-transclude="editable-script-transclude"></tr><tr ng-show="addLabel" class="dont-print dont-export"><td colspan="100"><a tabindex="0" href="" ng-click="addItem()"><i class="icon-plus"></i> {{addLabel}}</a></td></tr>'),t.join("")},templates.editableTcontext=function(t){var e=[],n=t||{},r=n.id,o=n.n;e.push("<div"+i.attrs({"class":["context-menu-"+r,"context-menu"]},{})+'><ul role="menu" class="dropdown-menu">');for(var a=0;o>a;a++)e.push("<li"+i.attrs({"data-index":""+a,"class":["hide-row"]},{"data-index":!0})+'><a tabindex="-1"><i class="icon-check"></i><span>&nbsp;</span><span class="item-label">Row '+i.escape(null==(i.interp=a)?"":i.interp)+"</span></a></li>");return e.push('<li class="divider"></li><li class="export-csv"><a tabindex="-1">Export to CSV</a></li></ul></div>'),e.join("")},templates.editableTd=function(t){var e=[],n=t||{},r=n.id,o=n.tableId,a=n.width;return e.push("<td"+i.attrs({id:""+r,"class":["controls","dont-print","dont-export"]},{id:!0})+'><i class="close icon-remove"></i><style>table.'+i.escape(null==(i.interp=o)?"":i.interp)+" td.squeezedElement,\ntable."+i.escape(null==(i.interp=o)?"":i.interp)+" th.squeezedElement\n{\n  width: "+i.escape(null==(i.interp=a-15-8-8-1)?"":i.interp)+"px !important;\n}</style></td>"),e.join("")},templates.editableTh=function(t){var e=[],n=t||{},r=n.id,o=n.tableId,a=n.width;return e.push("<th"+i.attrs({id:""+r,"class":["controls","dont-print","dont-export"]},{id:!0})+'><i class="close icon-cog"></i><style>table.'+i.escape(null==(i.interp=o)?"":i.interp)+" td.squeezedElement,\ntable."+i.escape(null==(i.interp=o)?"":i.interp)+" th.squeezedElement\n{\n  width: "+i.escape(null==(i.interp=a-15-8-8-1)?"":i.interp)+"px !important;\n}</style></th>"),e.join("")},templates.errorAlert=function(t){var e=[],n=t||{},r=n.error;return e.push('<div class="alert alert-error"><button type="button" data-dismiss="alert" class="close">&times;</button><strong>Error! </strong><span class="error-text">'+i.escape(null==(i.interp=r)?"":i.interp)+"</span></div>"),e.join("")},templates.hlistCell=function(){var t=[];return t.push('<div class="hlist inline"><div ng-repeat="hlo in model" class="moveable-{{reorders && edit && model.length > 1}} inline item valign-middle"><div class="enabled-{{edit}} item-controls valign-middle"><i ng-click="remove($index)" class="icon-remove-sign highlight-button"></i></div><div ng-transclude="ng-transclude" class="inline valign-middle"></div><span ng-show="!$last">{{separator}}&nbsp;</span></div><div class="inline valign-middle"><a ng-click="add()" href="" tabindex="0" class="pre-space-{{!!model.length}} dont-print unstyled-link valign-middle"><i class="icon-plus-sign highlight-button"></i></a><i ng-click="edit = !edit" ng-show="model.length &amp;&amp; (!editHidden || edit)" class="edit-{{edit}} icon-edit-sign highlight-button dont-print edit-button pre-space valign-middle"></i></div></div>'),t.join("")},templates.modal=function(t){var e=[],n=t||{},r=n.o;return e.push("<div"+i.attrs({id:r.id,"class":[r.cssClass,"modal","hide"]},{id:!0})+'><div class="modal-header">'),r.closeable&&e.push('<button type="button" data-dismiss="modal" aria-hidden="true" class="close modal-cancel">&times;</button>'),e.push('<h3 class="modal-title"></h3></div><div class="modal-body"></div>'),r.buttons.length&&(e.push('<div class="modal-footer">'),function(){var t=r.buttons;if("number"==typeof t.length)for(var n=0,o=t.length;o>n;n++){var a=t[n];e.push("<a"+i.attrs({"data-count":""+n,"class":[""+(n==r.cancelButtonIndex?"modal-cancel ":"")+(n==r.primaryButtonIndex?"btn-primary ":""),"btn","modal-button"]},{"data-count":!0})+">"+i.escape(null==(i.interp=a)?"":i.interp)+"</a>")}else{var o=0;for(var n in t){o++;var a=t[n];e.push("<a"+i.attrs({"data-count":""+n,"class":[""+(n==r.cancelButtonIndex?"modal-cancel ":"")+(n==r.primaryButtonIndex?"btn-primary ":""),"btn","modal-button"]},{"data-count":!0})+">"+i.escape(null==(i.interp=a)?"":i.interp)+"</a>")}}}.call(this),e.push("</div>")),r.width&&e.push("<style>@media (min-width: 767px) {\n  #"+i.escape(null==(i.interp=r.id)?"":i.interp)+" {\n    width: "+i.escape(null==(i.interp=r.width)?"":i.interp)+"px;\n    margin-left: "+i.escape(null==(i.interp=-r.width/2)?"":i.interp)+"px;\n  }\n}</style>"),e.push("<style>@media (min-width: 767px) {\n  .modal.fade {\n    top: 20px;\n  }\n  </style></div>"),e.join("")},templates.multiCell=function(){var t=[];return t.push('<div ng-transclude="ng-transclude" ng-click="beginEdit()" class="inline"><span ng-show="!editing" tabindex="0" class="muted-{{value == null || value == undefined}} multi-label">{{getChoiceName(value)}}</span><select ng-show="editing" ng-model="value" ng-options="choiceName({o: o}) for o in choices" class="multi-input"><option value="">{{allowNil}}</option></select></div>'),t.join("")},templates.navLi=function(){var t=[];return t.push('<li class="{{class}}"><a href="{{\'#\' + href}}" ng-transclude="ng-transclude"></a></li>'),t.join("")},templates.openModal=function(){var t=[];return t.push('<table id="open-modal-table" class="table table-hover"><tr id="open-modal-add-tr"><td class="omodal-add-td"><div class="omodal-add-div"><div id="omodal-add-page1" class="omodal-add-page"><div class="omodal-add-padding"><a id="omodal-add-a1"> <i class="icon-plus"></i> Add tournament</a></div></div><div id="omodal-add-page2" class="omodal-add-page"><table class="center-table"><td><div class="omodal-btn-padding"><button type="button" id="omodal-btn-new" class="btn"><i class="icon-file"></i> New file</button></div></td><td><div class="omodal-btn-padding"><button type="file" id="omodal-btn-upload" class="btn"><i class="icon-upload-alt"></i> Upload</button></div></td></table><input type="file" class="omodal-file"/><button class="close pull-right omodal-btn-close"><i class="icon-remove"></i></button></div><div id="omodal-add-page3" class="omodal-add-page"></div></div></td></tr></table><style type="text/css">#open-modal-table td {\n  border-top: 0px;\n  padding: 0px !important;\n}\n.omodal-add-padding {\n  padding: 10px;\n}\n.omodal-btn-padding {\n  padding: 0px 0px 0px 10px;\n  display: inline-block;\n}\n.omodal-btn-close {\n  position: absolute;\n  right: 13px;\n  top: 13px;\n  margin: 0px;\n  line-height: 0;\n  font-size: 110%;\n}\n.center-table.text-table {\n  width: 100%;\n}\n#open-modal .center-table.text-table td {\n  padding-right: 60px !important;\n}\n.omodal-text {\n  margin: 0px !important;\n  width: 100%;\n}\n.omodal-control-group {\n  display: inline-block;\n  margin: 0px;\n  width: 100%;\n  padding-left: 5px;\n  height: auto;\n}\n.omodal-file-btn {\n  display: none;\n  margin: 0px 3px;\n  font-size: 110%;\n}\n.omodal-btn-edit {\n  font-size: 100%;\n  position: relative;\n  top: 1px;\n}\n.omodal-btn-remove {\n  font-size: 110%;\n}\ntd:hover .omodal-file-btn {\n  display: inline-block;\n}\n.omodal-edit-td {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.omodal-add-td {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.omodal-edit-div {\n  width: 200%;\n  height: 42px;\n}\n.omodal-add-div {\n  width: 300%;\n  height: 42px;\n}\n.omodal-edit-page {\n  width: 50%;\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  position: relative;\n}\n.omodal-add-page {\n  width: 33.33%;\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  position: relative;\n}\n.omodal-file {\n  visibility: hidden;\n  position: absolute;\n  top: -50;\n  left: -50;\n}\ntable.center-table {\n  height: 100%;\n}\ntable.center-table td {\n  vertical-align: middle;\n}\n#omodal-local {\n  height: 100%;\n}\n</style>'),t.join("")},templates.openModalAddItem=function(t){var e=[],n=t||{},r=n.backend,o=n.name;if("LocalBackend"==r.name)var a="<i class='icon-file'/>";return e.push('<tr><td class="omodal-edit-td"><div class="omodal-edit-div"><div class="omodal-edit-page"><div class="omodal-add-padding"><a href="#" class="omodal-a">'+(null==(i.interp=a+" ")?"":i.interp)+'<span class="omodal-label">'+i.escape(null==(i.interp=o)?"":i.interp)+'</span></a><button class="close pull-right omodal-file-btn omodal-btn-delete"><i class="icon-remove"></i></button><button class="close pull-right omodal-file-btn omodal-btn-edit"><i class="icon-edit"></i></button></div></div><div class="omodal-edit-page"><table class="center-table text-table"><td><div class="control-group omodal-control-group"><input type="text" placeholder="File name" class="omodal-text"/></div></td></table><button class="close pull-right omodal-btn-close"><i class="icon-remove"></i></button></div></div></td></tr>'),e.join("")},templates.openModalAddLocal=function(){var t=[];return t.push('<div id="omodal-local"><table class="center-table text-table"><td><div class="control-group omodal-control-group"><input type="text" placeholder="File name" class="omodal-text"/></div></td></table><button class="close pull-right omodal-btn-close"><i class="icon-remove"></i></button></div>'),t.join("")},templates.pairModal=function(){var t=[];return t.push('<div class="alert alert-block"><strong>Warning!</strong> Once you create a pairing, you can only undo it by deleting the round. You also can\'t remove teams that have been paired or judges that filled in at least a ballot sheet from the tournament.</div><div class="settings-group"><div><div class="small-margin inline">Algorithm:&nbsp;</div><select ng-model="pairOpts.algorithm" ng-options="algoName[algo] for algo in pairAlgorithms"></select></div><label ng-show="pairOpts.algorithm != 0" class="checkbox">Randomize room order<input type="checkbox" ng-model="pairOpts.shuffleRooms"/></label><label ng-show="pairOpts.algorithm == 1" class="checkbox">Randomize sides<input type="checkbox" ng-model="pairOpts.shuffleSides"/></label><label ng-show="(pairOpts.algorithm != 1 || pairOpts.shuffleSides) &amp;&amp; prevRounds.length" class="checkbox">Balance sides<input type="checkbox" ng-model="pairOpts.balanceSides"/></label><div ng-show="pairOpts.algorithm == 2"><span>Number of brackets: </span><text-edit-cell bind="pairOpts.brackets" editing="editing" input-width="50" pattern="[0-9]*" setter="parseInt(o)"></text-edit-cell></div><div class="error-placeholder"></div><div ng-show="pairOpts.algorithm == 1" class="manual-pairings"><div class="row-fluid">     <div class="span8"><div ng-show="!manualPairing.length" class="alert alert-info nopairs"><strong>No pairs defined! </strong><span>To create the manual pairing, pick teams from </span><span><span class="hidden-phone">the right.</span><span class="visible-phone">below.</span></span><i class="icon-arrow-right hidden-phone"></i><i class="icon-arrow-down visible-phone"></i></div><div ng-repeat="pair in manualPairing" class="pairing rounded-bullets"><span ng-show="pair.prop &amp;&amp; !pairOpts.shuffleSides" class="prop">{{pair.prop.name}}</span><span ng-show="pair.prop &amp;&amp; pairOpts.shuffleSides" class="prop-opp">{{pair.prop.name}}</span><span ng-show="!pair.prop">Bail</span><span>&nbsp;vs.&nbsp;</span><span ng-show="!pair.opp">Bail</span><span ng-show="pair.opp &amp;&amp; !pairOpts.shuffleSides" class="opp">{{pair.opp.name}}</span><span ng-show="pair.opp &amp;&amp; pairOpts.shuffleSides" class="prop-opp">{{pair.opp.name}}</span><i ng-click="reverseSidesInManualPairing(pair)" ng-show="!pairOpts.shuffleSides" class="icon-exchange"></i><i ng-click="removePairFromManualPairing(pair, $index)" class="icon-remove-sign"></i></div></div><div class="span4"><div ng-repeat="o in pairingTeams" ng-click="addTeamToManualPairing(o, $index)" class="rounded-bullets red pushable">{{o.name}}</div></div></div></div></div>'),t.join("")},templates.saveAs=function(t){var e=[],n=t||{},r=n.value;return e.push('<p>Please enter the new file name</p><div class="control-group saveas-control-group"><input'+i.attrs({type:"text",placeholder:"File name",value:""+r,"class":["saveas-text"]},{type:!0,placeholder:!0,value:!0})+'/></div><style type="text/css">.saveas-text {\n  width: 350px;\n}\n</style>'),e.join("")},templates.sortArrow=function(){var t=[];return t.push('<div ng-click="toggleSort()" class="sortarrow inline"><span ng-transclude="ng-transclude" class="sortarrow-content"></span><span ng-show="!hideArrows">&nbsp;</span><i ng-show="!hideArrows &amp;&amp; ascending" ng-click="toggleSort()" class="arrow icon-sort-up dont-print"></i><i ng-show="!hideArrows &amp;&amp; !ascending" ng-click="toggleSort()" class="arrow icon-sort-down dont-print"></i></div>'),t.join("")},templates.sorterCriteria=function(){var t=[];return t.push('<div ng-repeat="o in model.criteria"><div class="rounded-bullets">{{o.name}}</div></div>'),t.join("")},templates.textEditCell=function(){var t=[];return t.push('<div ng-transclude="ng-transclude" ng-click="beginEdit_()" class="{{labelClass}} inline textedit-cell"><div ng-show="!editing" tabindex="0" class="inline textedit-label">{{valueParsed}}</div><div ng-show="editing" class="{{inputClass}} control-group"><input type="text" ng-model="valueParsed" class="textedit-input"/></div><div class="inline textedit-extra">{{extra}}</div></div>'),t.join("")}}();