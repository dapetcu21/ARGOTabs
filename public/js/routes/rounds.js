(function(){define(["team","judge","round","util","alertcontroller"],function(a,b,c,d,e){return[function(a){return a.app.controller("RoomController",["$scope",function(a){var b;return b=a.round.ballots[a.$index],a.currentRoom=[b.room],a.$watch("round.ballots[$index].room",function(b){return a.currentRoom[0]=b})}])},function(a,f){return f.when("/rounds/:roundIndex",{templateUrl:"partials/rounds.html",controller:["$scope","$routeParams","$compile",function(a,f,g){var h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A;i=f.roundIndex-1,l=a.round=a.tournament.rounds[i],a.ranks=b.ranks,a.rankStrings=b.rankStrings,a.ballotsPerMatchOptions=[1,3,5,7,9],a.infinity=1e4,a.maxPanelChoices=[a.infinity,0,1,2,3,4,5,6,7,8,9],a.infinityName=function(a,b,c){return a===b?c:a},a.priorityChoices=[0,1],a.priorityChoiceNames=["Assign good judges to good teams","Assign good judges to weak teams"],a.orderChoices=[0,1],a.orderChoiceNames=["Assign judges to good teams first","Assign judges to weak teams first"],a.rankStrings=b.rankStrings,a.naturalRoomSort=function(a,b){return b.room==null?-1:a.room==null?1:d.naturalSort(a.room.name,b.room.name)},d.installScopeUtils(a),d.extendScope(a),A=a.truncFloat,a.truncFloatN=function(a,b){return typeof a=="number"?A(a,b):a},x=l.judges,p=function(b){return a.$watch(function(){var a;return a=b.rounds[l.id],a!=null?a.participates:null},function(a,c){var e;if(a==null)return;if(a===c)return;a?l.freeJudges.push(b):(e=b.rounds[l.id],e!=null&&e.ballot&&!e.ballot.locked?(e.shadow?d.arrayRemove(e.ballot.shadows,b):d.arrayRemove(e.ballot.judges,b),e.ballot=null):d.arrayRemove(l.freeJudges,b))})};for(r=0,u=x.length;r<u;r++)j=x[r],p(j);y=l.rooms,q=function(b){return a.$watch(function(){var a;return a=b.rounds[l.id],a!=null?a.participates:null},function(a,c){var e;if(a==null)return;if(a===c)return;a?l.freeRooms.push(b):(e=b.rounds[l.id],e!=null&&e.ballot?(e.ballot.room=null,e.ballot=null):d.arrayRemove(l.freeRooms,b))})};for(s=0,v=y.length;s<v;s++)k=y[s],q(k);a.addAllTeams=function(){var b,c,d,e,f;e=a.tournament.teams,f=[];for(c=0,d=e.length;c<d;c++)b=e[c],f.push(b.rounds[l.id].participates=!0);return f},a.removeAllTeams=function(){var b,c,d,e,f;e=a.tournament.teams,f=[];for(c=0,d=e.length;c<d;c++)b=e[c],f.push(b.rounds[l.id].participates=!1);return f},a.addAllJudges=function(){var b,c,d,e,f;e=a.tournament.judges,f=[];for(c=0,d=e.length;c<d;c++){j=e[c],b=j.rounds[l.id];if(b.ballot!=null&&b.ballot.locked)continue;f.push(b.participates=!0)}return f},a.removeAllJudges=function(){var b,c,d,e,f;e=a.tournament.judges,f=[];for(c=0,d=e.length;c<d;c++){j=e[c],b=j.rounds[l.id];if(b.ballot!=null&&b.ballot.locked)continue;f.push(b.participates=!1)}return f},a.removeShadows=function(){var c,d,e,f,g;f=a.tournament.judges,g=[];for(d=0,e=f.length;d<e;d++){j=f[d];if(j.rank===b.shadowRank){c=j.rounds[l.id];if(c.ballot!=null&&c.ballot.locked)continue;g.push(c.participates=!1)}else g.push(void 0)}return g},a.addAllRooms=function(){var b,c,d,e;d=a.tournament.rooms,e=[];for(b=0,c=d.length;b<c;b++)k=d[b],e.push(k.rounds[l.id].participates=!0);return e},a.removeAllRooms=function(){var b,c,d,e;d=a.tournament.rooms,e=[];for(b=0,c=d.length;b<c;b++)k=d[b],e.push(k.rounds[l.id].participates=!1);return e},a.sortByRank=function(){return l.sortByRank(l.teams)},a.shuffle=function(){return l.shuffle()},a.shuffleRooms=function(){return l.shuffleRooms()},a.sortBallots=function(){return l.sortBallots()},a.judgeUd=function(a,b){return{ballot:a,shadow:b}},a.elementToString=function(a){var b,c,d,e,f,g,h,i,j,k,m,n,o;if(a.hasClass("judges-cell")){e=parseInt(a.data("index"));if(isNaN(e))return null;c=l.ballots[e];if(c.teams[0]==null||c.teams[1]==null)return"";h="",d=!0,b=function(a,b){d?d=!1:h+=", ",h+=a.name;if(b)return h+=" (Shd)"},n=c.judges;for(i=0,k=n.length;i<k;i++)f=n[i],b(f,!1);o=c.shadows;for(j=0,m=o.length;j<m;j++)f=o[j],b(f,!0);return h}return a.hasClass("win-cell")?(e=parseInt(a.data("index")),isNaN(e)?null:(c=l.ballots[e],g=c.stats.scores[0],g==="default win"?"default "+c.stats.classes[0]+" win":g==="unfilled"?"":c.stats.scores[1]?c.stats.scores[0]+" - "+c.stats.scores[1]+" ("+c.stats.winClass+")":c.stats.scores[0])):null},a.judgeGroupTest=function(a,b){var c;return c=b.ud.ballot,c==null?!0:a===b?!0:c.locked||!c.teams[0]||!c.teams[1]?!1:b.ud.shadow||c.judges.length<l.ballotsPerMatchSolved()},a.judgeGroupReplaceTest=function(a,b){var c;return c=b.ud.ballot,c==null?!0:a===b?!0:c.locked||!c.teams[0]||!c.teams[1]?!1:!0},a.isCompatible=function(b,c){return l.judgeRules.isCompatible(c,b,a.tournament.judgeRules)},m=function(){return a.showConflicts=l.caMode&&l.showConflicts,a.showRanks=l.caMode&&l.showRanks,a.showShadowConflicts=l.caMode&&l.showShadowConflicts},a.$watch("round.caMode",m),a.$watch("round.showConflicts",m),a.$watch("round.showShadowConflicts",m),a.$watch("round.showRanks",m),a.judgeMove=function(a,b,c,d){var e,f;return a===c&&d>b&&d--,e=a.model.splice(b,1)[0],c.model.splice(d,0,e),f=e.rounds[l.id],f.ballot=c.ud.ballot,f.shadow=c.ud.shadow},a.judgeReplace=function(a,b,c,d){var e,f,g;return e=a.model[b],f=c.model[d],a.model[b]=f,c.model[d]=e,g=e.rounds[l.id],g.ballot=c.ud.ballot,g.shadow=c.ud.shadow,g=f.rounds[l.id],g.ballot=a.ud.ballot,g.shadow=a.ud.shadow},a.roomMove=function(a,b,c,d){var e;if(c.ud)return;return k=a.model[b],a.ud?(a.model[0]=null,a.ud.room=null,e=k.rounds[l.id],e!=null&&(e.ballot=null)):(b<d&&d--,l.freeRooms.splice(b,1)),l.freeRooms.splice(d,0,k)},a.roomReplace=function(a,b,c,d){var e,f,g,h;g=a.model[b],h=c.model[d],a.model[b]=h,c.model[d]=g,a.ud!=null?a.ud.room=h:h==null&&a.model.splice(b,1),c.ud!=null?c.ud.room=g:g==null&&c.model.splice(d,1),e=g!=null?g.rounds[l.id]:null,f=h!=null?h.rounds[l.id]:null,e!=null&&(e.ballot=c.ud);if(f!=null)return f.ballot=a.ud},a.judgeDragStart=function(b){var c,d,e,f,g,h;a.compatList=d=[],g=l.ballots,h=[];for(e=0,f=g.length;e<f;e++)c=g[e],h.push(d.push(a.isCompatible(c,b)));return h},a.judgeDragEnd=function(){return a.compatList=null},n=function(b){var c,e,f,g,h,i,j,k,m,n,o,p,q,r,s,t;a.scoreDecimals==null&&(a.scoreDecimals=0),i=a.scoreDecimals,g=function(a){var b,c;return b=d.decimalsOf(a[0],2),c=d.decimalsOf(a[1],2),c>b?c:b},k=!0,j=!0,b&&(e=g(b),e===i?(k=!1,j=!1):e>i&&(a.scoreDecimals=i=e,j=!1));if(j){f=0,r=l.ballots;for(n=0,p=r.length;n<p;n++){c=r[n],h=c.stats.rawScores;if(h==null)continue;e=g(h),e>f&&(f=e)}i===f?k=!1:a.scoreDecimals=i=f}if(k){s=l.ballots,t=[];for(o=0,q=s.length;o<q;o++){c=s[o],m=c.stats;if(m.rawScores==null)continue;t.push(m.scores=[m.rawScores[0].toFixed(i),m.rawScores[1].toFixed(i)])}return t}},o=function(b,c){var d,e,f,g,h,i,j,k,l,m,o,p,q,r;c==null&&(c=!0),g=b.teams[0]!=null&&b.presence[0],h=b.teams[1]!=null&&b.presence[1];if(!g&&!h)b.stats={scores:["not played",""],winClass:"hidden-true",classes:["","hidden-true"]};else if(!g||!h)b.stats={scores:["default win",""],winClass:"hidden-true",classes:[g?"prop":"opp","hidden-true"]};else if(b.locked){i=[0,0],l=[0,0];for(j=m=0;m<=1;j=++m){d=0,r=b.votes;for(o=0,p=r.length;o<p;o++){k=r[o];for(f=q=0;q<4;f=++q)i[j]+=k.scores[j][f]*k.ballots;l[j]+=j?k.opp:k.prop,d+=k.ballots}i[j]/=d}e=a.scoreDecimals,b.stats={scores:[i[0].toFixed(e),i[1].toFixed(e)],rawScores:i,winClass:l[0]>l[1]?"prop":"opp",classes:["",""]},c&&n(i)}else b.stats={scores:["unfilled",""],winClass:"hidden-true",classes:["muted-true",""]}},z=l.ballots;for(t=0,w=z.length;t<w;t++)h=z[t],o(h,!1);return n(),a.assignJudges=function(){return l.assignJudges()},a.assignRooms=function(){return l.assignRooms()},a.pair=function(){var b,f,j,k,m,n;a.pairOpts={algorithm:0,sides:0,manualSides:!0,shuffleRooms:!0,noClubMatches:!0,hardSides:!0,minimizeReMeet:!0,matchesPerBracket:l.tournament.matchesPerBracket,evenBrackets:l.tournament.evenBrackets},f=a.prevRounds=l.previousRounds(),a.pairAlgorithms=f.length?c.allAlgos:c.initialAlgos,a.algoName=c.algoName,a.pairingTeams=l.pairingTeams(),a.manualPairing=[],k=a.sides=[0,1];for(m=0,n=f.length;m<n;m++)j=f[m],b=j.getName(),k.push({roundId:j.id,name:"Same as "+b,flip:!1}),k.push({roundId:j.id,name:"Opposite from "+b,flip:!0});return a.sidesName=function(a){return a===0?"Random":a===1?"Balanced":a.name},new e({buttons:["Cancel","Ok"],cancelButtonIndex:0,title:"Round "+(i+1)+" pairing",htmlMessage:g(templates.pairModal())(a),onClick:function(b,c){var e;if(c===1){e=a.pairOpts;if(e.algorithm===1){if(a.pairingTeams.length){b.find(".error-placeholder").html(templates.errorAlert({error:"You must pair all the teams before continuing"}));return}e.manualPairing=a.manualPairing}return b.modal("hide"),d.safeApply(a,function(){var a,b,c,d;l.pair(e),c=l.ballots,d=[];for(b=0,a=c.length;b<a;b++)h=c[b],d.push(o(h));return d})}}})},a.addTeamToManualPairing=function(b,c){var d,e;if(a.incompletePairing){e=a.incompletePairing,a.incompletePairing=null;if(!e.prop)e.prop=b;else if(!e.opp)e.opp=b;else return}else e=a.incompletePairing={prop:b},a.manualPairing.push(e),d=$(".manual-pairings .span8"),d.animate({scrollTop:d[0].scrollHeight},500);return a.pairingTeams.splice(c,1)},a.removePairFromManualPairing=function(b,c){b.prop?b.opp?a.pairingTeams.splice(0,0,b.prop,b.opp):a.pairingTeams.splice(0,0,b.prop):a.pairingTeams.splice(0,0,b.opp),a.manualPairing.splice(c,1);if(b===a.incompletePairing)return a.incompletePairing=null},a.reverseSidesInManualPairing=function(a){var b;return b=a.prop,a.prop=a.opp,a.opp=b},a.editBallot=function(b){var c,f,h,i,j,k,m,n,p,q,r,s,t,u;m=a.$parent.$new(),d.installScopeUtils(m),a.disableDigest(),c=l.ballots[b];if(c.teams[0]==null||c.teams[1]==null)return;j=l.ballotsPerMatchSolved(),m.votes=c.getVotesForBallots(j),m.speakers=[c.teams[0].players,c.teams[1].players],i=m.votes.length,m.winner=function(a){return a.prop>a.opp?"prop":"opp"},m.roles=c.getSpeakerRoles(),m.presence=[c.presence[0],c.presence[1]],m.sides=["Prop","Opp"],m.sidesClass=["prop","opp"],m.validPlayer=function(a,b){var c,d,e;c=0;for(d=e=0;e<=2;d=++e)b[d]===a&&c++;return c},n=function(a){return[_.range((a/2>>0)+1,a+1),_.range((a/2>>0)+(a&1))]},j=0,q=function(a){var b,d;return d=m.votes[a],b=d.ballots,j+=b,!d.judge&&!c.locked&&(m.noJudgesWarning=!0),d.aux={decisionValid:!0,validSplits:n(b),winner:0},m.$watch(function(){return d.prop},function(a){return d.opp=d.ballots-d.prop}),m.$watch(function(){return d.opp},function(a){return d.prop=d.ballots-d.opp}),m.$watch(function(){return k(d)},function(a){var b,c;return d.aux.decisionValid=!0,d.prop>d.opp?(c=d.prop,b=d.opp):(c=d.opp,b=d.prop),a===0?(d.prop=c,d.opp=b,d.aux.winner=0):a===1?(d.prop=b,d.opp=c,d.aux.winner=1):d.aux.decisionValid=!1})};for(f=s=0;0<=i?s<i:s>i;f=0<=i?++s:--s)q(f);m.lockJudgesInfo=!c.locked&&!m.noJudgesWarning;if(i>1){m.votes.push(p={judge:{name:"Total"},scores:[[70,70,70,35],[70,70,70,35]],total:!0,aux:{decisionValid:!0,validSplits:n(j),winner:0}});for(f=t=0;t<2;f=++t){r=function(a,b){return m.$watch(function(){var c,d,e,f,g;c=0,g=m.votes;for(f=0,e=g.length;f<e;f++)d=g[f],d.total||(c+=d.scores[a][b]*d.ballots);return c/j},function(c){return p.scores[a][b]=c})};for(h=u=0;u<4;h=++u)r(f,h)}m.$watch(function(){var a,b,c,d,e;a=0,e=m.votes;for(d=0,c=e.length;d<c;d++)b=e[d],b.total||(a+=b.prop);return a},function(a){return p.prop=a}),m.$watch(function(){var a,b,c,d,e;a=0,e=m.votes;for(d=0,c=e.length;d<c;d++)b=e[d],b.total||(a+=b.opp);return a},function(a){return p.opp=a}),m.$watch(function(){var a,b;for(a=b=0;0<=i?b<i:b>i;a=0<=i?++b:--b)if(!m.votes[a].aux.decisionValid)return!1;return!0},function(a){return m.votes[i].aux.decisionValid=a})}return k=function(a){var b,c,d,e;return c=a.scores[0],b=a.scores[1],e=c[0]+c[1]+c[2]+c[3],d=b[0]+b[1]+b[2]+b[3],e>d?0:e<d?1:2},new e({buttons:["Cancel","Ok"],cancelButtonIndex:0,width:760,title:'<span class="prop">'+c.teams[0].name+'</span><span> vs. </span><span class="opp">'+c.teams[1].name+"</span>",htmlMessage:g(templates.ballotSheet())(m),animated:!1,onClick:function(b,d){var e,g,i,j,k,l,n,p,q,r,s,t;m.$apply(function(){return m.drawsError=!1,m.outOfRangeError=!1}),j=!1,g=m.presence[0]&&m.presence[1];if(d===1){s=m.votes;for(n=0,k=s.length;n<k;n++){i=s[n];if(i.total)continue;for(f=p=0;p<=1;f=++p){for(h=q=0;q<=2;h=++q){e=i.scores[f][h];if(e<60||e>80){j=!0;if(g){m.$apply(function(){return m.outOfRangeError=!0});return}}}e=i.scores[f][3];if(e<30||e>40){j=!0;if(g){m.$apply(function(){return m.outOfRangeError=!0});return}}}if(!i.aux.decisionValid){j=!0;if(g){m.$apply(function(){return m.drawsError=!0});return}}}j||(c.votes=_.filter(m.votes,function(a){return!a.total})),c.roles=[m.roles[0].roles,m.roles[1].roles],c.presence=[m.presence[0],m.presence[1]],m.$destroy(),m=null,a.enableDigest(),t=c.votes;for(r=0,l=t.length;r<l;r++)i=t[r],delete i.aux;return c.locked=!0,a.$apply(function(){return o(c)}),b.modal("hide")}},onDismissed:function(a){if(m!=null)return m.$destroy()}})}}]})}]})}).call(this)