!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],t):t(e.jQuery)}(this,function(e){"use strict";function t(e,t){for(var i=0;i<t.length;i++){var a=t[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}e=e&&e.hasOwnProperty("default")?e.default:e;var i={autoShow:!1,autoHide:!1,autoPick:!1,inline:!1,container:null,trigger:null,language:"",format:"mm/dd/yyyy",date:null,startDate:null,endDate:null,startView:0,weekStart:0,yearFirst:!1,yearSuffix:"",days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],itemTag:"li",mutedClass:"muted",pickedClass:"picked",disabledClass:"disabled",highlightedClass:"highlighted",template:'<div class="datepicker-container"><div class="datepicker-panel" data-view="years picker"><ul><li data-view="years prev">&lsaquo;</li><li data-view="years current"></li><li data-view="years next">&rsaquo;</li></ul><ul data-view="years"></ul></div><div class="datepicker-panel" data-view="months picker"><ul><li data-view="year prev">&lsaquo;</li><li data-view="year current"></li><li data-view="year next">&rsaquo;</li></ul><ul data-view="months"></ul></div><div class="datepicker-panel" data-view="days picker"><ul><li data-view="month prev">&lsaquo;</li><li data-view="month current"></li><li data-view="month next">&rsaquo;</li></ul><ul data-view="week"></ul><ul data-view="days"></ul></div></div>',offset:10,zIndex:1e3,filter:null,show:null,hide:null,pick:null},a="undefined"!=typeof window?window:{},s="datepicker",n="click.".concat(s),r="focus.".concat(s),h="hide.".concat(s),o="keyup.".concat(s),l="pick.".concat(s),d="resize.".concat(s),c="scroll.".concat(s),u="show.".concat(s),p="".concat(s,"-hide"),f={},g=0,y=1,v=2,m=Object.prototype.toString;function w(e){return"string"==typeof e}var k=Number.isNaN||a.isNaN;function D(e){return"number"==typeof e&&!k(e)}function b(e){return void 0===e}function C(e){return"date"===(t=e,m.call(t).slice(8,-1).toLowerCase());var t}function $(e,t){for(var i=arguments.length,a=new Array(i>2?i-2:0),s=2;s<i;s++)a[s-2]=arguments[s];return function(){for(var i=arguments.length,s=new Array(i),n=0;n<i;n++)s[n]=arguments[n];return e.apply(t,a.concat(s))}}function x(e){return'[data-view="'.concat(e,'"]')}function F(e){return e%4==0&&e%100!=0||e%400==0}function M(e,t){return[31,F(e)?29:28,31,30,31,30,31,31,30,31,30,31][t]}function V(e,t,i){return Math.min(i,M(e,t))}var Y=/(y|m|d)+/g;var I=/\d+/g,T={show:function(){this.built||this.build(),this.shown||this.trigger(u).isDefaultPrevented()||(this.shown=!0,this.$picker.removeClass(p).on(n,e.proxy(this.click,this)),this.showView(this.options.startView),this.inline||(this.$scrollParent.on(c,e.proxy(this.place,this)),e(window).on(d,this.onResize=$(this.place,this)),e(document).on(n,this.onGlobalClick=$(this.globalClick,this)),e(document).on(o,this.onGlobalKeyup=$(this.globalKeyup,this)),this.place()))},hide:function(){this.shown&&(this.trigger(h).isDefaultPrevented()||(this.shown=!1,this.$picker.addClass(p).off(n,this.click),this.inline||(this.$scrollParent.off(c,this.place),e(window).off(d,this.onResize),e(document).off(n,this.onGlobalClick),e(document).off(o,this.onGlobalKeyup))))},toggle:function(){this.shown?this.hide():this.show()},update:function(){var e=this.getValue();e!==this.oldValue&&(this.setDate(e,!0),this.oldValue=e)},pick:function(e){var t=this.$element,i=this.date;this.trigger(l,{view:e||"",date:i}).isDefaultPrevented()||(i=this.formatDate(this.date),this.setValue(i),this.isInput&&(t.trigger("input"),t.trigger("change")))},reset:function(){this.setDate(this.initialDate,!0),this.setValue(this.initialValue),this.shown&&this.showView(this.options.startView)},getMonthName:function(t,i){var a=this.options,s=a.monthsShort,n=a.months;return e.isNumeric(t)?t=Number(t):b(i)&&(i=t),!0===i&&(n=s),n[D(t)?t:this.date.getMonth()]},getDayName:function(t,i,a){var s=this.options,n=s.days;return e.isNumeric(t)?t=Number(t):(b(a)&&(a=i),b(i)&&(i=t)),a?n=s.daysMin:i&&(n=s.daysShort),n[D(t)?t:this.date.getDay()]},getDate:function(e){var t=this.date;return e?this.formatDate(t):new Date(t)},setDate:function(t,i){var a=this.options.filter;if(C(t)||w(t)){if(t=this.parseDate(t),e.isFunction(a)&&!1===a.call(this.$element,t,"day"))return;this.date=t,this.viewDate=new Date(t),i||this.pick(),this.built&&this.render()}},setStartDate:function(e){C(e)||w(e)?this.startDate=this.parseDate(e):this.startDate=null,this.built&&this.render()},setEndDate:function(e){C(e)||w(e)?this.endDate=this.parseDate(e):this.endDate=null,this.built&&this.render()},parseDate:function(t){var i=this.format,a=[];if(C(t))return new Date(t.getFullYear(),t.getMonth(),t.getDate());w(t)&&(a=t.match(I)||[]),t=new Date;var s=i.parts.length,n=t.getFullYear(),r=t.getDate(),h=t.getMonth();return a.length===s&&e.each(a,function(e,t){var a=parseInt(t,10);switch(i.parts[e]){case"dd":case"d":r=a;break;case"mm":case"m":h=a-1;break;case"yy":n=2e3+a;break;case"yyyy":n=a}}),new Date(n,h,r)},formatDate:function(t){var i=this.format,a="";if(C(t)){var s=t.getFullYear(),n={d:t.getDate(),m:t.getMonth()+1,yy:s.toString().substring(2),yyyy:s};n.dd=(n.d<10?"0":"")+n.d,n.mm=(n.m<10?"0":"")+n.m,a=i.source,e.each(i.parts,function(e,t){a=a.replace(t,n[t])})}return a},destroy:function(){this.unbind(),this.unbuild(),this.$element.removeData(s)}},S={click:function(t){var i=e(t.target),a=this.options,s=this.viewDate,n=this.format;if(t.stopPropagation(),t.preventDefault(),!i.hasClass("disabled")){var r=i.data("view"),h=s.getFullYear(),o=s.getMonth(),l=s.getDate();switch(r){case"years prev":case"years next":h="years prev"===r?h-10:h+10,this.viewDate=new Date(h,o,V(h,o,l)),this.renderYears();break;case"year prev":case"year next":h="year prev"===r?h-1:h+1,this.viewDate=new Date(h,o,V(h,o,l)),this.renderMonths();break;case"year current":n.hasYear&&this.showView(v);break;case"year picked":n.hasMonth?this.showView(y):(i.addClass(a.pickedClass).siblings().removeClass(a.pickedClass),this.hideView()),this.pick("year");break;case"year":h=parseInt(i.text(),10),this.date=new Date(h,o,V(h,o,l)),n.hasMonth?(this.viewDate=new Date(this.date),this.showView(y)):(i.addClass(a.pickedClass).siblings().removeClass(a.pickedClass),this.renderYears(),this.hideView()),this.pick("year");break;case"month prev":case"month next":(o="month prev"===r?o-1:o+1)<0?(h-=1,o+=12):o>11&&(h+=1,o-=12),this.viewDate=new Date(h,o,V(h,o,l)),this.renderDays();break;case"month current":n.hasMonth&&this.showView(y);break;case"month picked":n.hasDay?this.showView(g):(i.addClass(a.pickedClass).siblings().removeClass(a.pickedClass),this.hideView()),this.pick("month");break;case"month":o=e.inArray(i.text(),a.monthsShort),this.date=new Date(h,o,V(h,o,l)),n.hasDay?(this.viewDate=new Date(h,o,V(h,o,l)),this.showView(g)):(i.addClass(a.pickedClass).siblings().removeClass(a.pickedClass),this.renderMonths(),this.hideView()),this.pick("month");break;case"day prev":case"day next":case"day":"day prev"===r?o-=1:"day next"===r&&(o+=1),l=parseInt(i.text(),10),this.date=new Date(h,o,l),this.viewDate=new Date(h,o,l),this.renderDays(),"day"===r&&this.hideView(),this.pick("day");break;case"day picked":this.hideView(),this.pick("day")}}},globalClick:function(e){for(var t=e.target,i=this.element,a=this.$trigger[0],s=!0;t!==document;){if(t===a||t===i){s=!1;break}t=t.parentNode}s&&this.hide()},keyup:function(){this.update()},globalKeyup:function(e){var t=e.target,i=e.key,a=e.keyCode;this.isInput&&t!==this.element&&this.shown&&("Tab"===i||9===a)&&this.hide()}},P={render:function(){this.renderYears(),this.renderMonths(),this.renderDays()},renderWeek:function(){var t=this,i=[],a=this.options,s=a.weekStart,n=a.daysMin;s=parseInt(s,10)%7,n=n.slice(s).concat(n.slice(0,s)),e.each(n,function(e,a){i.push(t.createItem({text:a}))}),this.$week.html(i.join(""))},renderYears:function(){var e,t=this.options,i=this.startDate,a=this.endDate,s=t.disabledClass,n=t.filter,r=t.yearSuffix,h=this.viewDate.getFullYear(),o=(new Date).getFullYear(),l=this.date.getFullYear(),d=[],c=!1,u=!1;for(e=-5;e<=6;e+=1){var p=new Date(h+e,1,1),f=!1;i&&(f=p.getFullYear()<i.getFullYear(),-5===e&&(c=f)),!f&&a&&(f=p.getFullYear()>a.getFullYear(),6===e&&(u=f)),!f&&n&&(f=!1===n.call(this.$element,p,"year"));var g=h+e===l,y=g?"year picked":"year";d.push(this.createItem({picked:g,disabled:f,text:h+e,view:f?"year disabled":y,highlighted:p.getFullYear()===o}))}this.$yearsPrev.toggleClass(s,c),this.$yearsNext.toggleClass(s,u),this.$yearsCurrent.toggleClass(s,!0).html("".concat(h+-5+r," - ").concat(h+6).concat(r)),this.$years.html(d.join(""))},renderMonths:function(){var t,i=this.options,a=this.startDate,s=this.endDate,n=this.viewDate,r=i.disabledClass||"",h=i.monthsShort,o=e.isFunction(i.filter)&&i.filter,l=n.getFullYear(),d=new Date,c=d.getFullYear(),u=d.getMonth(),p=this.date.getFullYear(),f=this.date.getMonth(),g=[],y=!1,v=!1;for(t=0;t<=11;t+=1){var m=new Date(l,t,1),w=!1;a&&(w=(y=m.getFullYear()===a.getFullYear())&&m.getMonth()<a.getMonth()),!w&&s&&(w=(v=m.getFullYear()===s.getFullYear())&&m.getMonth()>s.getMonth()),!w&&o&&(w=!1===o.call(this.$element,m,"month"));var k=l===p&&t===f,D=k?"month picked":"month";g.push(this.createItem({disabled:w,picked:k,highlighted:l===c&&m.getMonth()===u,index:t,text:h[t],view:w?"month disabled":D}))}this.$yearPrev.toggleClass(r,y),this.$yearNext.toggleClass(r,v),this.$yearCurrent.toggleClass(r,y&&v).html(l+i.yearSuffix||""),this.$months.html(g.join(""))},renderDays:function(){var e,t,i,a=this.$element,s=this.options,n=this.startDate,r=this.endDate,h=this.viewDate,o=this.date,l=s.disabledClass,d=s.filter,c=s.months,u=s.weekStart,p=s.yearSuffix,f=h.getFullYear(),g=h.getMonth(),y=new Date,v=y.getFullYear(),m=y.getMonth(),w=y.getDate(),k=o.getFullYear(),D=o.getMonth(),b=o.getDate(),C=[],$=f,x=g,F=!1;0===g?($-=1,x=11):x-=1,e=M($,x);var V=new Date(f,g,1);for((i=V.getDay()-parseInt(u,10)%7)<=0&&(i+=7),n&&(F=V.getTime()<=n.getTime()),t=e-(i-1);t<=e;t+=1){var Y=new Date($,x,t),I=!1;n&&(I=Y.getTime()<n.getTime()),!I&&d&&(I=!1===d.call(a,Y,"day")),C.push(this.createItem({disabled:I,highlighted:$===v&&x===m&&Y.getDate()===w,muted:!0,picked:$===k&&x===D&&t===b,text:t,view:"day prev"}))}var T=[],S=f,P=g,N=!1;11===g?(S+=1,P=0):P+=1,e=M(f,g),i=42-(C.length+e);var j=new Date(f,g,e);for(r&&(N=j.getTime()>=r.getTime()),t=1;t<=i;t+=1){var q=new Date(S,P,t),A=S===k&&P===D&&t===b,O=!1;r&&(O=q.getTime()>r.getTime()),!O&&d&&(O=!1===d.call(a,q,"day")),T.push(this.createItem({disabled:O,picked:A,highlighted:S===v&&P===m&&q.getDate()===w,muted:!0,text:t,view:"day next"}))}var W=[];for(t=1;t<=e;t+=1){var z=new Date(f,g,t),J=!1;n&&(J=z.getTime()<n.getTime()),!J&&r&&(J=z.getTime()>r.getTime()),!J&&d&&(J=!1===d.call(a,z,"day"));var E=f===k&&g===D&&t===b,G=E?"day picked":"day";W.push(this.createItem({disabled:J,picked:E,highlighted:f===v&&g===m&&z.getDate()===w,text:t,view:J?"day disabled":G}))}this.$monthPrev.toggleClass(l,F),this.$monthNext.toggleClass(l,N),this.$monthCurrent.toggleClass(l,F&&N).html(s.yearFirst?"".concat(f+p," ").concat(c[g]):"".concat(c[g]," ").concat(f).concat(p)),this.$days.html(C.join("")+W.join("")+T.join(""))}},N="".concat(s,"-top-left"),j="".concat(s,"-top-right"),q="".concat(s,"-bottom-left"),A="".concat(s,"-bottom-right"),O=[N,j,q,A].join(" "),W=function(){function a(t){var s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),this.$element=e(t),this.element=t,this.options=e.extend({},i,f[s.language],e.isPlainObject(s)&&s),this.$scrollParent=function(t){var i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=e(t),s=a.css("position"),n="absolute"===s,r=i?/auto|scroll|hidden/:/auto|scroll/,h=a.parents().filter(function(t,i){var a=e(i);return(!n||"static"!==a.css("position"))&&r.test(a.css("overflow")+a.css("overflow-y")+a.css("overflow-x"))}).eq(0);return"fixed"!==s&&h.length?h:e(t.ownerDocument||document)}(t,!0),this.built=!1,this.shown=!1,this.isInput=!1,this.inline=!1,this.initialValue="",this.initialDate=null,this.startDate=null,this.endDate=null,this.init()}var d,c,m;return d=a,m=[{key:"setDefaults",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e.extend(i,f[t.language],e.isPlainObject(t)&&t)}}],(c=[{key:"init",value:function(){var t=this.$element,i=this.options,a=i.startDate,s=i.endDate,n=i.date;this.$trigger=e(i.trigger),this.isInput=t.is("input")||t.is("textarea"),this.inline=i.inline&&(i.container||!this.isInput),this.format=function(t){var i=String(t).toLowerCase(),a=i.match(Y);if(!a||0===a.length)throw new Error("Invalid date format.");return t={source:i,parts:a},e.each(a,function(e,i){switch(i){case"dd":case"d":t.hasDay=!0;break;case"mm":case"m":t.hasMonth=!0;break;case"yyyy":case"yy":t.hasYear=!0}}),t}(i.format);var r=this.getValue();this.initialValue=r,this.oldValue=r,n=this.parseDate(n||r),a&&(a=this.parseDate(a),n.getTime()<a.getTime()&&(n=new Date(a)),this.startDate=a),s&&(s=this.parseDate(s),a&&s.getTime()<a.getTime()&&(s=new Date(a)),n.getTime()>s.getTime()&&(n=new Date(s)),this.endDate=s),this.date=n,this.viewDate=new Date(n),this.initialDate=new Date(this.date),this.bind(),(i.autoShow||this.inline)&&this.show(),i.autoPick&&this.pick()}},{key:"build",value:function(){if(!this.built){this.built=!0;var t=this.$element,i=this.options,a=e(i.template);this.$picker=a,this.$week=a.find(x("week")),this.$yearsPicker=a.find(x("years picker")),this.$yearsPrev=a.find(x("years prev")),this.$yearsNext=a.find(x("years next")),this.$yearsCurrent=a.find(x("years current")),this.$years=a.find(x("years")),this.$monthsPicker=a.find(x("months picker")),this.$yearPrev=a.find(x("year prev")),this.$yearNext=a.find(x("year next")),this.$yearCurrent=a.find(x("year current")),this.$months=a.find(x("months")),this.$daysPicker=a.find(x("days picker")),this.$monthPrev=a.find(x("month prev")),this.$monthNext=a.find(x("month next")),this.$monthCurrent=a.find(x("month current")),this.$days=a.find(x("days")),this.inline?e(i.container||t).append(a.addClass("".concat(s,"-inline"))):(e(document.body).append(a.addClass("".concat(s,"-dropdown"))),a.addClass(p).css({zIndex:parseInt(i.zIndex,10)})),this.renderWeek()}}},{key:"unbuild",value:function(){this.built&&(this.built=!1,this.$picker.remove())}},{key:"bind",value:function(){var t=this.options,i=this.$element;e.isFunction(t.show)&&i.on(u,t.show),e.isFunction(t.hide)&&i.on(h,t.hide),e.isFunction(t.pick)&&i.on(l,t.pick),this.isInput&&i.on(o,e.proxy(this.keyup,this)),this.inline||(t.trigger?this.$trigger.on(n,e.proxy(this.toggle,this)):this.isInput?i.on(r,e.proxy(this.show,this)):i.on(n,e.proxy(this.show,this)))}},{key:"unbind",value:function(){var t=this.$element,i=this.options;e.isFunction(i.show)&&t.off(u,i.show),e.isFunction(i.hide)&&t.off(h,i.hide),e.isFunction(i.pick)&&t.off(l,i.pick),this.isInput&&t.off(o,this.keyup),this.inline||(i.trigger?this.$trigger.off(n,this.toggle):this.isInput?t.off(r,this.show):t.off(n,this.show))}},{key:"showView",value:function(e){var t=this.$yearsPicker,i=this.$monthsPicker,a=this.$daysPicker,s=this.format;if(s.hasYear||s.hasMonth||s.hasDay)switch(Number(e)){case v:i.addClass(p),a.addClass(p),s.hasYear?(this.renderYears(),t.removeClass(p),this.place()):this.showView(g);break;case y:t.addClass(p),a.addClass(p),s.hasMonth?(this.renderMonths(),i.removeClass(p),this.place()):this.showView(v);break;default:t.addClass(p),i.addClass(p),s.hasDay?(this.renderDays(),a.removeClass(p),this.place()):this.showView(y)}}},{key:"hideView",value:function(){!this.inline&&this.options.autoHide&&this.hide()}},{key:"place",value:function(){if(!this.inline){var t=this.$element,i=this.options,a=this.$picker,s=e(document).outerWidth(),n=e(document).outerHeight(),r=t.outerWidth(),h=t.outerHeight(),o=a.width(),l=a.height(),d=t.offset(),c=d.left,u=d.top,p=parseFloat(i.offset),f=N;k(p)&&(p=10),u>l&&u+h+l>n?(u-=l+p,f=q):u+=h+p,c+o>s&&(c+=r-o,f=f.replace("left","right")),a.removeClass(O).addClass(f).css({top:u,left:c})}}},{key:"trigger",value:function(t,i){var a=e.Event(t,i);return this.$element.trigger(a),a}},{key:"createItem",value:function(t){var i=this.options,a=i.itemTag,s={text:"",view:"",muted:!1,picked:!1,disabled:!1,highlighted:!1},n=[];return e.extend(s,t),s.muted&&n.push(i.mutedClass),s.highlighted&&n.push(i.highlightedClass),s.picked&&n.push(i.pickedClass),s.disabled&&n.push(i.disabledClass),"<".concat(a,' class="').concat(n.join(" "),'" data-view="').concat(s.view,'">').concat(s.text,"</").concat(a,">")}},{key:"getValue",value:function(){var e=this.$element;return this.isInput?e.val():e.text()}},{key:"setValue",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=this.$element;this.isInput?t.val(e):this.inline&&!this.options.container||t.text(e)}}])&&t(d.prototype,c),m&&t(d,m),a}();if(e.extend&&e.extend(W.prototype,P,S,T),e.fn){var z=e.fn.datepicker;e.fn.datepicker=function(t){for(var i=arguments.length,a=new Array(i>1?i-1:0),n=1;n<i;n++)a[n-1]=arguments[n];var r;return this.each(function(i,n){var h=e(n),o="destroy"===t,l=h.data(s);if(!l){if(o)return;var d=e.extend({},h.data(),e.isPlainObject(t)&&t);l=new W(n,d),h.data(s,l)}if(w(t)){var c=l[t];e.isFunction(c)&&(r=c.apply(l,a),o&&h.removeData(s))}}),b(r)?this:r},e.fn.datepicker.Constructor=W,e.fn.datepicker.languages=f,e.fn.datepicker.setDefaults=W.setDefaults,e.fn.datepicker.noConflict=function(){return e.fn.datepicker=z,this}}});