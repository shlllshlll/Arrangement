"use strict";function isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}function _construct(t,e,r){return(_construct=isNativeReflectConstruct()?Reflect.construct:function(t,e,r){var n=[null];n.push.apply(n,e);var a=new(Function.bind.apply(t,n));return r&&_setPrototypeOf(a,r.prototype),a}).apply(null,arguments)}function _setPrototypeOf(t,e){return(_setPrototypeOf=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function _toConsumableArray(t){return _arrayWithoutHoles(t)||_iterableToArray(t)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function _iterableToArray(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}function _arrayWithoutHoles(t){if(Array.isArray(t)){for(var e=0,r=new Array(t.length);e<t.length;e++)r[e]=t[e];return r}}define(["common","jquery","bootstrap.navtab","module.datatable","module.utils","module.datachecker","datepicker","datepicker.zh-CN"],function(t,e,r,n,a,o){var l={},i={init:function(){if(!l.userTable){l.userTable=new n("#userTable");var r=[{title:"姓名"},{title:"备注"},{title:"规则"},{name:"control",searchable:!1,title:"操作",orderable:!1,defaultContent:'<input type="button" value="❌" style="border-style: none;background: inherit;">',createdCell:function(t,r,n,o,i){e(t).on("click","input",{rowIndex:o,rowData:n},function(t){var e=t.data.rowIndex,r=t.data.rowData;a.showModal("delRowModal","警告","是否确定删除"+r[0]+"的数据",function(){l.userTable.table.row(e).remove().draw()},"okDelRowBtn")})}}];a.getJson({url:t.tlinedata},function(t){"String"==typeof t&&(t=JSON.parse(t)),l.userTable.createTable(t,{table:{searching:!1,ordering:!1,autoWidth:!0,paging:!1,columns:r}})})}e("#usrTableAddBtn").click(function(){a.showModal("addModal","排班规则设置","",function(){var t=e("#usrAddName").val(),r=e("#usrAddComment").val(),n={0:new Set,1:new Set};for(var a in e("#usrAddForm .ruleRow").each(function(){var t=e(this).find("select").val();e(this).find("input").val().split(" ").forEach(function(e){n[t].add(e)})}),n)n[a]=Array.from(n[a]);n=JSON.stringify(n);var o=l.userTable.table.columns().header().length-1,i=new Array(o).fill("");i[0]=t,i[1]=r,i[2]=n,l.userTable.table.row.add(i).draw()},"okAddBtn");e("#addModal .modal-body").append('<form id="usrAddForm"><div class="form-group row">\n                        <label class="col-form-label col-sm-3">姓名</label>\n                        <input type="text" class="form-control col-sm-7" id="usrAddName">\n                    </div>\n                    <div class="form-group row">\n                        <label class="col-form-label col-sm-3">备注</label>\n                        <input type="text" class="form-control col-sm-7" id="usrAddComment">\n                    </div>\n                    <div class="form-group row">\n                        <label class="col-form-label col-sm-3">规则</label>\n                    </div>\n                    <div class="form-group row d-flex justify-content-center" id="usrAddIcon">\n                        <i class="nc-icon nc-simple-add" style="font-size:25px;cursor:pointer;"></i></div>\n                    </form>'),e("#usrAddIcon").click(function(){e("#usrAddForm .row:nth-last-child(2)").after('<div class="form-group row align-items-center ruleRow">\n                    <i class="nc-icon nc-simple-delete col-sm-1" style="font-size:20px;cursor:pointer;padding-right:20px;"></i>\n                    <select class="form-control col-sm-3 custom-select">\n                        <option value=\'1\'>值</option>\n                        <option value=\'0\'>不值</option>\n                    </select>\n                    <input type="text" class="form-control col-sm-8">\n                </div>'),e("#usrAddForm .ruleRow i").click(function(){e(this).parent().remove()})})}),e("#usrTableDelBtn").click(function(){a.showModal("delModal","警告","是否确定删除数据",function(){l.userTable.updateData([]),a.postJson({url:t.tlinedata,data:JSON.stringify([])},function(){return t.showNotification("数据清楚成功","success")},function(){return t.showNotification("数据清楚失败","error")})},"okDelBtn")}),e("#usrTableSaveBtn").click(function(){i.postUserTable()})},postUserTable:function(){a.postJson({url:t.tlinedata,data:JSON.stringify(l.userTable.table.data().toArray())},function(){return t.showNotification("数据保存成功","success")},function(){return t.showNotification("数据保存失败","error")})}},c={init:function(){if(!l.preTable){l.preTable=new n("#preAranTable");var r=[{title:"姓名"},{title:"日期"},{name:"control",searchable:!1,title:"操作",orderable:!1,defaultContent:'<input type="button" value="❌" style="border-style: none;background: inherit;">',createdCell:function(t,r,n,o,i){e(t).on("click","input",{rowIndex:o,rowData:n},function(t){var e=t.data.rowIndex,r=t.data.rowData;a.showModal("delRowModal","警告","是否确定删除"+r[0]+"的数据",function(){l.preTable.table.row(e).remove().draw()},"okDelRowBtn")})}}];a.getJson({url:t.tlinePre},function(t){"String"==typeof t&&(t=JSON.parse(t)),l.preTable.createTable(t,{table:{searching:!1,ordering:!1,autoWidth:!0,paging:!1,columns:r}})})}e("#preTableAddBtn").click(function(){a.showModal("addModal","添加排班日期","",function(){var t=e("#usrAddName").val(),r=[];e("#usrAddForm .ruleRow").each(function(){var t=e(this).find("input").val();r.push(t)}),r=JSON.stringify(r);var n=l.preTable.table.columns().header().length-1,a=new Array(n).fill("");a[0]=t,a[1]=r,l.preTable.table.row.add(a).draw()},"okAddBtn");var t='<div class="form-group row align-items-center ruleRow">\n                    <i class="nc-icon nc-simple-delete col-sm-1" style="font-size:20px;cursor:pointer;padding-right:20px;"></i>\n                    <div class="col-sm-1"></div>\n                    <input id="addDatePicker" class="form-control col-sm-8">\n                </div>';e("#addModal .modal-body").append('<form id="usrAddForm"><div class="form-group row">\n                        <label class="col-form-label col-sm-3">姓名</label>\n                        <input type="text" class="form-control col-sm-7" id="usrAddName">\n                    </div>\n                    <div class="form-group row">\n                        <label class="col-form-label col-sm-3">值班日期</label>\n                    </div>\n                    <div class="form-group row d-flex justify-content-center" id="usrAddIcon">\n                        <i class="nc-icon nc-simple-add" style="font-size:25px;cursor:pointer;"></i></div>\n                    </form>'),e("#usrAddForm .row:nth-last-child(2)").after(t),e("#usrAddIcon").click(function(){e("#usrAddForm .row:nth-last-child(2)").after(t),e("#usrAddForm .ruleRow i").click(function(){e(this).parent().remove()})})}),e("#preTableDelBtn").click(function(){a.showModal("delModal","警告","是否确定删除数据",function(){l.preTable.updateData([]),a.postJson({url:t.tlinePre,data:JSON.stringify([])},function(){return t.showNotification("数据清楚成功","success")},function(){return t.showNotification("数据清楚失败","error")})},"okDelBtn")}),e("#preTableSaveBtn").click(function(){c.postTable()})},postTable:function(){a.postJson({url:t.tlinePre,data:JSON.stringify(l.preTable.table.data().toArray())},function(){return t.showNotification("数据保存成功","success")},function(){return t.showNotification("数据保存失败","error")})}},s=function(t,e){var r={"M+":t.getMonth()+1,"d+":t.getDate(),"h+":t.getHours(),"m+":t.getMinutes(),"s+":t.getSeconds(),"q+":Math.floor((t.getMonth()+3)/3),S:t.getMilliseconds()};for(var n in/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(t.getFullYear()+"").substr(4-RegExp.$1.length))),r)new RegExp("("+n+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?r[n]:("00"+r[n]).substr((""+r[n]).length)));return e},u=function(t,e){for(var r=[],n=t,a=function(t){var e=new Date(this.valueOf());return e.setDate(e.getDate()+1),e};n<=e;)r.push(n),n=a.call(n,1);return r},d={showTable:function(){if(!l.resultTable){l.resultTable=new n("#resultTable");l.resultTable.createTable([],{table:{autoWidth:!0,dom:"<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>><'row'<'col-md-12'tr>><'row'<'col-md-5'i><'col-md-7'p>>",buttons:[{extend:"excelHtml5",filename:"三线排班表",title:null}],columns:[{title:"日期"},{title:"姓名"},{title:"值班次数"}]}})}var t=l.startDate.split("/").map(function(t){return parseInt(t)});t.push(1);var e=l.endDate.split("/").map(function(t){return parseInt(t)});e.push(0),t[1]--,t=_construct(Date,_toConsumableArray(t)),e=_construct(Date,_toConsumableArray(e));var r=u(t,e),a={};l.userTable.table.data().toArray().forEach(function(t){a[t[0]]={rule:JSON.parse(t[2]),date:[]}});var o=l.preTable.table.data().toArray();o.forEach(function(t){var e,r=[],n=JSON.parse(t[1]),o=!0,l=!1,i=void 0;try{for(var c,s=n[Symbol.iterator]();!(o=(c=s.next()).done);o=!0){var u=c.value.split(".").map(function(t){return parseInt(t)});u[0]=2e3+u[0]%100,u[1]--;var d=_construct(Date,_toConsumableArray(u));r.push(d)}}catch(t){l=!0,i=t}finally{try{o||null==s.return||s.return()}finally{if(l)throw i}}(e=a[t[0]].date).push.apply(e,r)});var i=Object.keys(a),c=Math.ceil(r.length/i.length),d=[],f=[];o.forEach(function(t){var e=JSON.parse(t[1]),r=!0,n=!1,a=void 0;try{for(var o,l=e[Symbol.iterator]();!(r=(o=l.next()).done);r=!0){var i=o.value;(i=i.split("."))[0]=2e3+i[0]%100,i[1]--,i=_construct(Date,_toConsumableArray(i)).valueOf(),d.push(i),f.push(t[0])}}catch(t){n=!0,a=t}finally{try{r||null==l.return||l.return()}finally{if(n)throw a}}});var p=[],h=!0,m=!1,b=void 0;try{for(var v,y=r[Symbol.iterator]();!(h=(v=y.next()).done);h=!0){var g=v.value,w=d.indexOf(g.valueOf());if(-1===w)for(var T=JSON.parse(JSON.stringify(i)),A=0;A<T.length;A++){var x=T[A];if(k(g,a[x].rule)&&D(g,a[x].date,c)){p.push([s(g,"yy-MM-dd"),x]),a[x].date.push(g),i.push(i.splice(A,1)[0]);break}A+1===T.length&&(p.push([s(g,"yy-MM-dd"),T[0]]),a[T[0]].date.push(g),i.push(i.splice(0,1)[0]))}else p.push([s(g,"yy-MM-dd"),f[w]])}}catch(t){m=!0,b=t}finally{try{h||null==y.return||y.return()}finally{if(m)throw b}}var M=[];function D(t,e,r){var n=!0,a=!1,o=void 0;try{for(var l,i=e[Symbol.iterator]();!(n=(l=i.next()).done);n=!0){var c=l.value;if(Math.abs(Math.round((t-c)/864e5))<10)return!1}}catch(t){a=!0,o=t}finally{try{n||null==i.return||i.return()}finally{if(a)throw o}}return!(e.length>=r)}function k(t,e){function r(t,e){return 1===e.split("-").length?function(t,e){if(1===e.length&&parseInt(e)<=7){var r=t.getDay();return(r=r||7)===parseInt(e)}var n=e.split(".");3===(n=n.map(function(t){return parseInt(t)})).length&&(n[0]%=100);for(var a=[t.getDate(),t.getMonth()+1,t.getFullYear()%100],o=!0,l=n.pop();l;)a.splice(0,1)[0]!==l&&(o=!1),l=n.pop();return!!o}(t,e):function(t,e){var r=e.split("-");if(1===r[0].length){var n=t.getDay();n=n||7;var a=parseInt(r[0]),o=parseInt(r[1]);return n>=a&&n<=o}var l=r[0].split("."),i=r[1].split(".");if(1===l.length&&1===i.length){var c=t.getDate(),s=parseInt(l[0]),u=parseInt(i[0]);return c>=s&&c<=u}if(2===l.length&&2===i.length){var d=t.getDate(),f=100*(t.getMonth()+1)+d,p=parseInt(r[0].replace(/\./g,"")),h=parseInt(r[1].replace(/\./g,""));return f>=p&&f<=h}if(3===l.length&&3===i.length){var m=t.getDate(),b=t.getMonth()+1,v=t.getFullYear()%100*1e4+100*b+m,y=parseInt(r[0].replace(/\./g,"")),g=parseInt(r[1].replace(/\./g,""));return v>=y&&v<=g}}(t,e)}var n=e[0];if(n.length){var a=!0,o=!1,l=void 0;try{for(var i,c=n[Symbol.iterator]();!(a=(i=c.next()).done);a=!0){if(r(t,i.value))return!1}}catch(t){o=!0,l=t}finally{try{a||null==c.return||c.return()}finally{if(o)throw l}}}var s=e[1];if(s.length){var u=!0,d=!1,f=void 0;try{for(var p,h=s[Symbol.iterator]();!(u=(p=h.next()).done);u=!0){if(r(t,p.value))return!0}}catch(t){d=!0,f=t}finally{try{u||null==h.return||h.return()}finally{if(d)throw f}}return!1}return!0}p.forEach(function(t){return M.push(t[1])}),p=p.map(function(t){var e,r;return t.push((e=M,r=t[1],e.reduce(function(t,e){return e===r?t+1:t},0))),t}),l.resultTable.updateData(p)}},f={1:[{dom:"#startMonth",checker:function(t){return t?null:"日期不能为空"}},{dom:"#endMonth",checker:function(t){if(!t)return"日期不能为空";var r=parseInt(e("#startMonth").val().replace("/",""));return parseInt(t.replace("/",""))<r?"请确保结束日期晚于开始日期":null}}],2:[],3:[],4:[]};function p(t,r){1===r?(e("#title h3").text("排班周期选择"),e("#title p").text("请选择三线排班的周期")):2===r?(e("#title h3").text("人员信息维护"),e("#title p").text("请输出本次排班中的人员信息")):3===r?(e("#title h3").text("已排班信息"),e("#title p").text("请输入已经排好的节假日信息")):4===r&&(e("#title h3").text("排班结果"),e("#title p").text("这里输出了排班的结果"),d.showTable()),1===t&&2===r&&(l.startDate=e("#startMonth").val(),l.endDate=e("#endMonth").val()),2===t?i.postUserTable():3===t&&c.postTable()}function h(){e("#resultTable_wrapper button").click()}function m(t){return(new o).formDataChecker(f[t])}e('[data-toggle="datepicker"]').datepicker({format:"yyyy/mm",language:"zh-CN"}),i.init(),c.init(),new r("#mytab","#nextBtn","#backBtn","#finishBtn",p,h,m)});