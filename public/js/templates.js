(function(){
  window.templates = window.templates || {};
  function attrs(obj, escaped){
  var buf = []
    , terse = obj.terse;

  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;

  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {
        buf.push(key + "='" + JSON.stringify(val) + "'");
      } else if ('class' == key) {
        if (escaped && escaped[key]){
          if (val = escape(joinClasses(val))) {
            buf.push(key + '="' + val + '"');
          }
        } else {
          if (val = joinClasses(val)) {
            buf.push(key + '="' + val + '"');
          }
        }
      } else if (escaped && escaped[key]) {
        buf.push(key + '="' + escape(val) + '"');
      } else {
        buf.push(key + '="' + val + '"');
      }
    }
  }

  return buf.join(' ');
}
function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function nulls(val) { return val != null && val !== '' }
function joinClasses(val) { return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val; }
var jade = {
  attrs: attrs,
  escape: escape 
};templates['alert'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),classes = locals_.classes,title = locals_.title,message = locals_.message,button = locals_.button,buttonClass = locals_.buttonClass;buf.push("<div" + (jade.attrs({ "class": [('' + (classes) + ''),('alert'),('fade'),('in')] }, {})) + "><p><strong>" + (null == (jade.interp = title) ? "" : jade.interp) + "</strong>" + (null == (jade.interp = ' ' + message) ? "" : jade.interp) + "</p>");
if ( button)
{
buf.push("<p><button" + (jade.attrs({ 'type':('button'), "class": [('' + (buttonClass) + ''),('btn'),('alert-button')] }, {"type":true})) + ">" + (jade.escape(null == (jade.interp = button) ? "" : jade.interp)) + "</button></p>");
}
buf.push("</div>");;return buf.join("");
};
templates['ballotSheet'] = function anonymous(locals) {
var buf = [];
buf.push("<div ng-show=\"lockJudgesInfo\" class=\"alert alert-info\"><button type=\"button\" ng-click=\"lockJudgesInfo=false\" class=\"close\">&times;</button><strong>Warning!</strong> Once you submit this ballot sheet, the judges for this match are going to be locked in and can't be modified or reordered anymore.</div><div ng-show=\"noJudgesWarning\" class=\"alert\"><button type=\"button\" ng-click=\"noJudgesWarning=false\" class=\"close\">&times;</button><strong>Warning!</strong> There are no judges assigned to this match. You can still enter scores for the teams, but since they aren't bound to any judge, they won't matter for the judges tab. Furthermore, you cannot assign judges after submitting this ballot sheet.</div><div ng-show=\"outOfRangeError\" class=\"alert alert-error\"><button type=\"button\" ng-click=\"outOfRangeError=false\" class=\"close\">&times;</button><strong>Error!</strong> The scores are not within the valid World Schools range.</div><div ng-show=\"drawsError\" class=\"alert alert-error\"><button type=\"button\" ng-click=\"drawsError=false\" class=\"close\">&times;</button><strong>Error!</strong> Draws are not valid in the World Schools format.</div><table editable-table=\"editable-table\" show-gear=\"false\" model=\"roles\" id=\"roles-table\"><thead><tr><th data-auto-index='5'>Side</th><th data-auto-index='4'>1st Speaker</th><th data-auto-index='3'>2nd Speaker</th><th data-auto-index='2'>3rd Speaker</th><th data-auto-index='1'>Reply Speaker</th></tr></thead><tbody editable-tbody=\"editable-tbody\"><script type=\"text/html\"><td class=\"nowrap\"><input type=\"checkbox\" ng-model=\"presence[$index]\" class=\"presence-check\"/><span class=\"{{sidesClass[$index]}} strong\">{{sides[$index]}}</span></td>");
for (var i = 0; i < 4; i++) {
{
buf.push("<td class=\"nowrap\"><span ng-show=\"!presence[$index]\" class=\"muted-true\">not present</span><span ng-show=\"presence[$index]\"><multi-cell" + (jade.attrs({ 'bind':('o.roles[' + (i) + ']'), 'input-width':('120'), 'choices':('speakers[$index]'), 'choice-name':('o.name') }, {"bind":true,"input-width":true,"choices":true,"choice-name":true})) + "></multi-cell><i" + (jade.attrs({ 'ng-show':('' + ((i==3) ? "o.roles[3] == o.roles[2]" : "validPlayer(o.roles["+i+"], o.roles) >= 2") + ''), "class": [('fa'),('fa-exclamation'),('icon-dobitoc')] }, {"ng-show":true})) + "></i></span></td>");
}
}
buf.push("</script></tbody></table><div ng-show=\"presence[0] &amp;&amp; presence[1]\"><table editable-table=\"editable-table\" show-gear=\"false\" model=\"votes\" id=\"votes-table\"><thead><tr><th data-auto-index='5'>#</th><th data-auto-index='1'>Judge</th><th data-auto-index='3' class=\"prop\">P1</th><th data-auto-index='3' class=\"prop\">P2</th><th data-auto-index='3' class=\"prop\">P3</th><th data-auto-index='3' class=\"prop\">PR</th><th data-auto-index='4' class=\"prop\">Prop</th><th data-auto-index='2'>vs.</th><th data-auto-index='4' class=\"opp\">Opp</th><th data-auto-index='3' class=\"opp\">O1</th><th data-auto-index='3' class=\"opp\">O2</th><th data-auto-index='3' class=\"opp\">O3</th><th data-auto-index='3' class=\"opp\">OR</th></tr></thead><tbody editable-tbody=\"editable-tbody\"><script type=\"text/html\"><td>{{$index + 1}}</td><td> <span>{{o.judge.name}}</span><span ng-show=\"o.judge == null\" class=\"muted-true\">Not assigned</span></td>");
function sideCells(side) {
{
for (var i = 0; i < 4; i++) {
{
buf.push("<td" + (jade.attrs({ "class": [('valid-{{valid' + (side) + '' + (i) + '}}'),('nowrap')] }, {})) + "><text-edit-cell" + (jade.attrs({ 'bind':('o.scores[' + (side) + '][' + (i) + ']'), 'enabled':('!o.total'), 'valid':('valid' + (side) + '' + (i) + ''), 'input-width':('17'), 'pattern':('[0-9.]*'), 'setter':('parseFloat(o)'), 'getter':('truncFloat(o, 2)'), 'soft-validator':('validateMinMax(o, ' + (i==3 ? 30 : 60) + ', ' + (i==3 ? 40 : 80) + ')') }, {"bind":true,"enabled":true,"valid":true,"input-width":true,"pattern":true,"setter":true,"getter":true,"soft-validator":true})) + "></text-edit-cell><i" + (jade.attrs({ 'ng-show':('valid' + (side) + '' + (i) + ' && (o.scores[' + (side) + '][' + (i) + '] <= ' + (i==3 ? 30.5 : 61) + ' || o.scores[' + (side) + '][' + (i) + '] >= ' + (i==3 ? 39.5 : 79) + ')'), "class": [('fa'),('fa-exclamation'),('icon-dobitoc')] }, {"ng-show":true})) + "></i></td>");
}
} }
}
function sideTotal(side) {
{
buf.push("<td>{{truncFloat(o.scores[" + (jade.escape((jade.interp = side) == null ? '' : jade.interp)) + "][0] + o.scores[" + (jade.escape((jade.interp = side) == null ? '' : jade.interp)) + "][1] + o.scores[" + (jade.escape((jade.interp = side) == null ? '' : jade.interp)) + "][2] + o.scores[" + (jade.escape((jade.interp = side) == null ? '' : jade.interp)) + "][3], 2)}}</td>");
}
}
sideCells(0)
sideTotal(0)
buf.push("<td class=\"valid-{{o.aux.decisionValid}}\"><span ng-show=\"o.aux.decisionValid\" class=\"nowrap\"><multi-cell bind=\"o.prop\" enabled=\"!o.total &amp;&amp; (o.aux.validSplits[o.aux.winner].length &gt; 1)\" input-width=\"41\" choices=\"o.aux.validSplits[o.aux.winner]\" choice-name=\"o\"></multi-cell><span> </span><i class=\"{{winner(o)}} vote-trophy fa fa-trophy\"></i><span> </span><multi-cell bind=\"o.opp\" enabled=\"!o.total &amp;&amp; (o.aux.validSplits[1-o.aux.winner].length &gt; 1)\" input-width=\"41\" choices=\"o.aux.validSplits[1-o.aux.winner]\" choice-name=\"o\"></multi-cell></span><span ng-show=\"!o.aux.decisionValid &amp;&amp; !o.total\">Draw</span><span ng-show=\"!o.aux.decisionValid &amp;&amp; o.total\">Invalid</span></td>");
sideTotal(1)
sideCells(1)
buf.push("</script></tbody></table></div><style type=\"text/css\">#roles-table th:nth-child(1) {\n  width: 50px;\n}\n#roles-table th:nth-child(2),\n#roles-table th:nth-child(3),\n#roles-table th:nth-child(4),\n#roles-table th:nth-child(5) {\n  width: 127px;\n}\n#votes-table th:nth-child(1) {\n  width: 20px;\n}\n#votes-table th:nth-child(2) {\n  width: 100px;\n}\n#votes-table th:nth-child(3),\n#votes-table th:nth-child(4),\n#votes-table th:nth-child(5),\n#votes-table th:nth-child(6),\n#votes-table th:nth-child(10),\n#votes-table th:nth-child(11),\n#votes-table th:nth-child(12),\n#votes-table th:nth-child(13) {\n  width: 25px;\n}\n#votes-table th:nth-child(7),\n#votes-table th:nth-child(9) {\n  width: 30px;\n}\n#votes-table th:nth-child(8) {\n  width: 40px;\n}\n#votes-table td.valid-false {\n  background-color: #b94a48;\n  color: #fff;\n}\n#votes-table td.valid-false .textedit-cell.invalid .textedit-label {\n  color: #fff;\n}\ninput[type=\"checkbox\"].presence-check {\n  margin: 0px 5px 0px 0px;\n}\n.icon-dobitoc {\n  color: #b94a48;\n  margin-left: 3px;\n}\n</style>");;return buf.join("");
};
templates['editableTable'] = function anonymous(locals) {
var buf = [];
buf.push("<table editable-head-transclude=\"editable-head-transclude\" class=\"{{tableId}} {{tableClass}} editable-table\"></table>");;return buf.join("");
};
templates['editableTbody'] = function anonymous(locals) {
var buf = [];
buf.push("<tr ng-repeat=\"o in getScope().model\" ng-init=\"hover = false; initRepeatScope(this)\" ng-mouseenter=\"mouseEnter()\" ng-mouseleave=\"mouseLeave()\" ng-click=\"rowClicked($index)\" editable-script-transclude=\"editable-script-transclude\"></tr><tr ng-show=\"addLabel\" class=\"dont-print dont-export\"><td colspan=\"100\"><a tabindex=\"0\" href=\"\" ng-click=\"addItem()\"><i class=\"fa fa-fw fa-plus\"></i> {{addLabel}}</a></td></tr>");;return buf.join("");
};
templates['editableTcontext'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),id = locals_.id,n = locals_.n;buf.push("<div" + (jade.attrs({ "class": [('context-menu-' + (id) + ''),('context-menu')] }, {})) + "><ul role=\"menu\" class=\"dropdown-menu\">");
for (var i = 0; i < n; i++) {
{
buf.push("<li" + (jade.attrs({ 'data-index':('' + (i) + ''), "class": [('hide-row')] }, {"data-index":true})) + "><a tabindex=\"-1\"><i class=\"fa fa-check-square-o\"></i><span>&nbsp;</span><span class=\"item-label\">Row " + (jade.escape((jade.interp = i) == null ? '' : jade.interp)) + "</span></a></li>");
}
}
buf.push("<li class=\"divider\"></li><li class=\"export-csv-comma\"><a tabindex=\"-1\">Export to CSV (,)</a></li><li class=\"export-csv-semicolon\"><a tabindex=\"-1\">Export to CSV (;)</a></li></ul></div>");;return buf.join("");
};
templates['editableTd'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),id = locals_.id,tableId = locals_.tableId,width = locals_.width;buf.push("<td" + (jade.attrs({ 'id':('' + (id) + ''), "class": [('controls'),('dont-export')] }, {"id":true})) + "><i class=\"close fa fa-fw fa-times-circle\"></i><style>table." + (jade.escape((jade.interp = tableId) == null ? '' : jade.interp)) + " td.squeezedElement,\ntable." + (jade.escape((jade.interp = tableId) == null ? '' : jade.interp)) + " th.squeezedElement\n{\n  width: " + (jade.escape((jade.interp = width - 24 - 8 - 8 - 1) == null ? '' : jade.interp)) + "px !important;\n}</style></td>");;return buf.join("");
};
templates['editableTh'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),id = locals_.id,tableId = locals_.tableId,width = locals_.width;buf.push("<th" + (jade.attrs({ 'id':("" + (id) + ""), "class": [('controls'),('dont-export')] }, {"id":true})) + "><i class=\"close fa fa-fw fa-cog\"></i><style>table." + (jade.escape((jade.interp = tableId) == null ? '' : jade.interp)) + " td.squeezedElement,\ntable." + (jade.escape((jade.interp = tableId) == null ? '' : jade.interp)) + " th.squeezedElement\n{\n  width: " + (jade.escape((jade.interp = width - 24 - 8 - 8 - 1) == null ? '' : jade.interp)) + "px !important;\n}</style></th>");;return buf.join("");
};
templates['errorAlert'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),error = locals_.error;buf.push("<div class=\"alert alert-error\"><button type=\"button\" data-dismiss=\"alert\" class=\"close\">&times;</button><strong>Error! </strong><span class=\"error-text\">" + (jade.escape((jade.interp = error) == null ? '' : jade.interp)) + "</span></div>");;return buf.join("");
};
templates['hlistCell'] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"hlist-empty hlist inline\"><div ng-repeat=\"hlo in model\" class=\"moveable-{{_reorders && (edit || reordersAlways) && (model.length > 1 || hasGroup)}} inline-block item valign-middle\"><div ng-show=\"!removeItemHidden(hlo, $index)\" class=\"enabled-{{edit}} item-controls valign-middle\"><i ng-click=\"remove($index)\" class=\"fa fa-times-circle highlight-button\"></i></div><div hlist-cell-transclude=\"hlist-cell-transclude\" class=\"inline-block valign-middle hlist-content\"></div><span ng-show=\"!$last\">{{separator}}&nbsp;</span></div><div class=\"inline valign-middle\"><a ng-click=\"add()\" ng-show=\"canAddItem\" href=\"\" tabindex=\"0\" class=\"pre-space-{{!!model.length}} dont-print unstyled-link valign-middle\"><i class=\"fa fa-plus-circle highlight-button\"></i></a><i ng-click=\"edit = !edit\" ng-show=\"model.length &amp;&amp; (!editHidden || edit)\" class=\"edit-{{edit}} fa fa-pencil-square highlight-button dont-print edit-button pre-space valign-middle\"></i></div><div class=\"hlist-empty-{{model.length == 0}} placeholder\"></div></div>");;return buf.join("");
};
templates['judgeRules'] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"judge-rules\"><vlist-cell bind=\"model.criteria\"><div judge-rules-helper=\"judge-rules-helper\" class=\"rounded-bullets judge-rule\"><span class=\"blue-rule\"><multi-cell bind=\"judgeIndex\" choices=\"judgeIndexes\" choice-name=\"judgeNames[o]\" nil-placeholder=\"!!!deleted!!!\" hide-nil=\"hide-nil\" on-begin-edit=\"buildJudgeList()\"></multi-cell></span>&nbsp;<span class=\"verb-{{vlo.verb}}\"><multi-cell bind=\"vlo.verb\" choices=\"verbs\" choice-name=\"verbNames[o]\"></multi-cell></span>&nbsp;<multi-cell bind=\"teamIndex\" choices=\"teamIndexes\" choice-name=\"teamNames[o]\" nil-placeholder=\"!!!deleted!!!\" hide-nil=\"hide-nil\" on-begin-edit=\"buildTeamList()\"></multi-cell><fa ng-click=\"removeRule($index)\" class=\"fa fa-times remove-rule\"></fa></div></vlist-cell><a href=\"\" ng-click=\"addRule()\" class=\"add-rule\"><i class=\"fa fa-fw fa-plus\"></i> Add rule</a></div>");;return buf.join("");
};
templates['modal'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),o = locals_.o;buf.push("<div" + (jade.attrs({ 'id':(o.id), "class": [(o.cssClass),('modal'),('hide')] }, {"id":true})) + "><div class=\"modal-header\">");
if ( o.closeable)
{
buf.push("<button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close modal-cancel\">&times;</button>");
}
buf.push("<h3 class=\"modal-title\"></h3></div><div class=\"modal-body\"></div>");
if ( o.buttons.length)
{
buf.push("<div class=\"modal-footer\">");
// iterate o.buttons
;(function(){
  var $$obj = o.buttons;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var button = $$obj[i];

buf.push("<a" + (jade.attrs({ 'data-count':("" + (i) + ""), "class": [("" + ((i == o.cancelButtonIndex)?'modal-cancel ':'') + "" + ((i == o.primaryButtonIndex)?'btn-primary ':'') + ""),('btn'),('modal-button')] }, {"data-count":true})) + ">" + (jade.escape((jade.interp = button) == null ? '' : jade.interp)) + "</a>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var button = $$obj[i];

buf.push("<a" + (jade.attrs({ 'data-count':("" + (i) + ""), "class": [("" + ((i == o.cancelButtonIndex)?'modal-cancel ':'') + "" + ((i == o.primaryButtonIndex)?'btn-primary ':'') + ""),('btn'),('modal-button')] }, {"data-count":true})) + ">" + (jade.escape((jade.interp = button) == null ? '' : jade.interp)) + "</a>");
    }

  }
}).call(this);

buf.push("</div>");
}
if ( o.width )
{
buf.push("<style>@media (min-width: 767px) {\n  #" + (jade.escape((jade.interp = o.id) == null ? '' : jade.interp)) + " {\n    width: " + (jade.escape((jade.interp = o.width) == null ? '' : jade.interp)) + "px;\n    margin-left: " + (jade.escape((jade.interp = -o.width / 2) == null ? '' : jade.interp)) + "px;\n  }\n}</style>");
}
buf.push("<style>@media (min-width: 767px) {\n  .modal.fade {\n    top: 20px;\n  }\n  </style></div>");;return buf.join("");
};
templates['multiCell'] = function anonymous(locals) {
var buf = [];
buf.push("<div ng-click=\"beginEdit()\" class=\"inline\"><span ng-show=\"!editing\" tabindex=\"0\" class=\"muted-{{value == null || value == undefined}} multi-label\">{{getChoiceName(value)}}</span><select ng-show=\"editing\" ng-model=\"value\" ng-options=\"choiceName({o: o}) for o in choices\" class=\"multi-input\"><option value=\"\">{{allowNil}}</option></select><span ng-transclude=\"ng-transclude\"></span></div>");;return buf.join("");
};
templates['navLi'] = function anonymous(locals) {
var buf = [];
buf.push("<li class=\"{{class}}\"><a href=\"{{'#' + href}}\" ng-transclude=\"ng-transclude\"></a></li>");;return buf.join("");
};
templates['openModal'] = function anonymous(locals) {
var buf = [];
buf.push("<table id=\"open-modal-table\" class=\"table table-hover\"><tr id=\"open-modal-add-tr\"><td class=\"omodal-add-td\"><div class=\"omodal-add-div\"><div id=\"omodal-add-page1\" class=\"omodal-add-page\"><div class=\"omodal-add-padding\"><a id=\"omodal-add-a1\"> <i class=\"fa fa-fw fa-plus\"></i> Add tournament</a></div></div><div id=\"omodal-add-page2\" class=\"omodal-add-page\"><table class=\"center-table\"><td><div class=\"omodal-btn-padding\"><button type=\"button\" id=\"omodal-btn-new\" class=\"btn\"><i class=\"fa fa-fw fa-file\"></i> New file</button></div></td><td><div class=\"omodal-btn-padding\"><button type=\"file\" id=\"omodal-btn-upload\" class=\"btn\"><i class=\"fa fa-fw fa-upload\"></i> Upload</button></div></td></table><input type=\"file\" class=\"omodal-file\"/><button class=\"close pull-right omodal-btn-close\"><i class=\"fa fa-fw fa-times\"></i></button></div><div id=\"omodal-add-page3\" class=\"omodal-add-page\"></div></div></td></tr></table><style type=\"text/css\">#open-modal-table td {\n  border-top: 0px;\n  padding: 0px !important;\n}\n.omodal-add-padding {\n  padding: 10px;\n}\n.omodal-btn-padding {\n  padding: 0px 0px 0px 10px;\n  display: inline-block;\n}\n.omodal-btn-close {\n  position: absolute;\n  right: 13px;\n  top: 13px;\n  margin: 0px;\n  line-height: 0;\n  font-size: 110%;\n}\n.center-table.text-table {\n  width: 100%;\n}\n#open-modal .center-table.text-table td {\n  padding-right: 60px !important;\n}\n.omodal-text {\n  margin: 0px !important;\n  width: 100%;\n}\n.omodal-control-group {\n  display: inline-block;\n  margin: 0px;\n  width: 100%;\n  padding-left: 5px;\n  height: auto;\n}\n.omodal-file-btn {\n  display: none;\n  margin: 0px 3px;\n  font-size: 110%;\n}\n.omodal-btn-edit {\n  font-size: 100%;\n  position: relative;\n  top: 1px;\n}\n.omodal-btn-remove {\n  font-size: 110%;\n}\ntd:hover .omodal-file-btn {\n  display: inline-block;\n}\n.omodal-edit-td {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.omodal-add-td {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.omodal-edit-div {\n  width: 200%;\n  height: 42px;\n}\n.omodal-add-div {\n  width: 300%;\n  height: 42px;\n}\n.omodal-edit-page {\n  width: 50%;\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  position: relative;\n}\n.omodal-add-page {\n  width: 33.33%;\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  position: relative;\n}\n.omodal-file {\n  visibility: hidden;\n  position: absolute;\n  top: -50;\n  left: -50;\n}\ntable.center-table {\n  height: 100%;\n}\ntable.center-table td {\n  vertical-align: middle;\n}\n#omodal-local {\n  height: 100%;\n}\n</style>");;return buf.join("");
};
templates['openModalAddItem'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),icon = locals_.icon,name = locals_.name;buf.push("<tr><td class=\"omodal-edit-td\"><div class=\"omodal-edit-div\"><div class=\"omodal-edit-page\"><div class=\"omodal-add-padding\"><a href=\"#\" class=\"omodal-a\">" + (null == (jade.interp = icon + " ") ? "" : jade.interp) + "<span class=\"omodal-label\">" + (jade.escape(null == (jade.interp = name) ? "" : jade.interp)) + "</span></a><button class=\"close pull-right omodal-file-btn omodal-btn-delete\"><i class=\"fa fa-times\"></i></button><button class=\"close pull-right omodal-file-btn omodal-btn-edit\"><i class=\"fa fa-pencil-square-o\"></i></button></div></div><div class=\"omodal-edit-page\"><table class=\"center-table text-table\"><td><div class=\"control-group omodal-control-group\"><input type=\"text\" placeholder=\"File name\" class=\"omodal-text\"/></div></td></table><button class=\"close pull-right omodal-btn-close\"><i class=\"fa fa-times\"></i></button></div></div></td></tr>");;return buf.join("");
};
templates['openModalAddLocal'] = function anonymous(locals) {
var buf = [];
buf.push("<div id=\"omodal-local\"><table class=\"center-table text-table\"><td><div class=\"control-group omodal-control-group\"><input type=\"text\" placeholder=\"File name\" class=\"omodal-text\"/></div></td></table><button class=\"close pull-right omodal-btn-close\"><i class=\"fa fa-times\"></i></button></div>");;return buf.join("");
};
templates['pairModal'] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"alert alert-block\"><strong>Warning!</strong> Once you create a pairing, you can only undo it by deleting the round. You also can't remove teams that have been paired or judges that filled in at least a ballot sheet from the tournament.</div><div class=\"settings-group\"><div class=\"row-fluid\"><div class=\"span6\"><div class=\"pair-select\"><div class=\"small-margin inline\">Algorithm:</div><select ng-model=\"pairOpts.algorithm\" ng-options=\"algoName[algo] for algo in pairAlgorithms\"></select></div><label ng-show=\"pairOpts.algorithm == 1\" class=\"checkbox\">Manual sides <input type=\"checkbox\" ng-model=\"pairOpts.manualSides\"/></label><label ng-show=\"pairOpts.algorithm == 0 &amp;&amp; prevRounds.length &amp;&amp; (pairingTeams.length % 2)\" class=\"checkbox\">Randomize bye<input type=\"checkbox\" ng-model=\"pairOpts.randomBye\"/></label><label ng-show=\"pairOpts.algorithm != 0\" class=\"checkbox\">Randomize room order<input type=\"checkbox\" ng-model=\"pairOpts.shuffleRooms\"/></label><label ng-show=\"pairOpts.algorithm != 1\" class=\"checkbox\">No teams meeting twice<input type=\"checkbox\" ng-model=\"pairOpts.minimizeReMeet\"/></label><div ng-show=\"pairOpts.algorithm == 3\"><span>Min. matches per bracket: </span><text-edit-cell bind=\"pairOpts.matchesPerBracket\" input-width=\"50\" pattern=\"[0-9]*\" setter=\"parseInt(o)\"><i class=\"fa fa-fw fa-edit bottom-line\"></i></text-edit-cell></div></div><div class=\"span6\"><div ng-show=\"pairOpts.algorithm != 1 || !pairOpts.manualSides\" class=\"pair-select\"><div class=\"small-margin inline\">Sides:</div><select ng-model=\"pairOpts.sides\" ng-options=\"sidesName(side) for side in sides\"></select></div><label ng-show=\"(pairOpts.algorithm != 1 || !pairOpts.manualSides) &amp;&amp; pairOpts.sides\" title=\"Checking this means that side constraints should take priority over pairing algorithm constraints.\" class=\"checkbox\">Enforce side constraint<input type=\"checkbox\" ng-model=\"pairOpts.hardSides\"/></label><label ng-show=\"pairOpts.algorithm == 0\" class=\"checkbox\">Prevent club matches<input type=\"checkbox\" ng-model=\"pairOpts.noClubMatches\"/></label><div ng-show=\"pairOpts.algorithm == 3\" class=\"radio-container\"><div>Even brackets by pulling</div><label> <input type=\"radio\" ng-model=\"pairOpts.evenBrackets\" ng-value=\"0\"/><span>down leftover teams</span></label><label><input type=\"radio\" ng-model=\"pairOpts.evenBrackets\" ng-value=\"1\"/><span>up teams with weakest past opponents</span></label></div></div></div><div class=\"error-placeholder\"></div><div ng-show=\"pairOpts.algorithm == 1\" class=\"manual-pairings\"><div class=\"row-fluid\">     <div class=\"span8\"><div ng-show=\"!manualPairing.length\" class=\"alert alert-info nopairs\"><strong>No pairs defined! </strong><span>To create the manual pairing, pick teams from </span><span><span class=\"hidden-phone\">the right.</span><span class=\"visible-phone\">below.</span></span><i class=\"fa fa-arrow-right hidden-phone\"></i><i class=\"fa fa-arrow-down visible-phone\"></i></div><div ng-repeat=\"pair in manualPairing\" class=\"pairing rounded-bullets\"><span ng-show=\"pairOpts.manualSides\" class=\"prop\">{{pair.prop.name}}</span><span ng-show=\"!pairOpts.manualSides\" class=\"prop-opp\">{{pair.prop.name}}</span><span>&nbsp;vs.&nbsp;</span><span ng-show=\"!pair.opp\">Bye</span><span ng-show=\"pair.opp &amp;&amp; pairOpts.manualSides\" class=\"opp\">{{pair.opp.name}}</span><span ng-show=\"pair.opp &amp;&amp; !pairOpts.manualSides\" class=\"prop-opp\">{{pair.opp.name}}</span><i ng-click=\"reverseSidesInManualPairing(pair)\" ng-show=\"pairOpts.manualSides &amp;&amp; pair.opp\" class=\"fa fa-exchange\"></i><i ng-click=\"removePairFromManualPairing(pair, $index)\" class=\"fa fa-times\"></i></div></div><div class=\"span4\"><div ng-repeat=\"o in pairingTeams\" ng-click=\"addTeamToManualPairing(o, $index)\" class=\"rounded-bullets red pushable\">{{o.name}}</div></div></div></div></div>");;return buf.join("");
};
templates['saveAs'] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),value = locals_.value;buf.push("<p>Please enter the new file name</p><div class=\"control-group saveas-control-group\"><input" + (jade.attrs({ 'type':('text'), 'placeholder':('File name'), 'value':('' + (value) + ''), "class": [('saveas-text')] }, {"type":true,"placeholder":true,"value":true})) + "/></div><style type=\"text/css\">.saveas-text {\n  width: 350px;\n}\n</style>");;return buf.join("");
};
templates['sortArrow'] = function anonymous(locals) {
var buf = [];
buf.push("<div ng-click=\"toggleSort()\" class=\"sortarrow inline\"><span ng-transclude=\"ng-transclude\" class=\"sortarrow-content\"></span><span ng-show=\"!hideArrows\" class=\"arrow fa-stack dont-print\"><i class=\"muted-{{ascending}} fa fa-sort-asc fa-stack-1x\"></i><i class=\"muted-{{!ascending}} fa fa-sort-desc fa-stack-1x\"></i></span></div>");;return buf.join("");
};
templates['sorterCriteria'] = function anonymous(locals) {
var buf = [];
buf.push("<vlist-cell bind=\"model.criteria\" manual-move=\"manualMove(from,to)\"><div class=\"rounded-bullets\">{{vlo.name}}</div></vlist-cell>");;return buf.join("");
};
templates['textEditCell'] = function anonymous(locals) {
var buf = [];
buf.push("<div ng-click=\"beginEdit_()\" class=\"{{labelClass}} inline textedit-cell\"><div ng-show=\"!editing\" tabindex=\"0\" class=\"inline textedit-label\">{{valueParsed}}</div><div ng-show=\"editing\" class=\"{{inputClass}} control-group\"><input type=\"text\" ng-model=\"valueParsed\" class=\"textedit-input\"/></div><div class=\"inline textedit-extra\">{{extra}}</div><span ng-transclude=\"ng-transclude\"></span></div>");;return buf.join("");
};
templates['vlistCell'] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"vlist\"><div ng-repeat=\"vlo in model\" class=\"moveable-{{model.length > 1}} item\"><div vlist-cell-transclude=\"vlist-cell-transclude\" class=\"vlist-content\"></div></div></div>");;return buf.join("");
};
})();