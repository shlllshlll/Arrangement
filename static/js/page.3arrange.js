"use strict";

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
 * @Author: SHLLL
 * @Date: 2018-11-22 10:50:03
 * @License: MIT License
 * @Email: shlll7347@gmail.com
 * @Modified by: SHLLL
 * @Last Modified time: 2018-11-22 11:25:43
 */
define(['common', 'jquery', 'module.datatable', 'module.utils', 'datepicker', 'datepicker.zh-CN'], function (common, $, DatatableModule, Utils) {
  'use strict';

  var varHolder = {};
  var DataCheck = {
    /**
     * 检查页面数据输入是否正确函数
     * @param {Array/Object} checkers 数据检查器
     */
    formDataChecker: function formDataChecker(checkers) {
      var failure = false; // checkers可以是数组也可以是对象

      if (!(checkers instanceof Array)) {
        checkers = [checkers];
      } // 检查checkers是否为空


      if (checkers.length === 0) {
        return failure;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = checkers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var checker = _step.value;
          var input = $(checker.dom);
          var check = checker.checker;
          var data = input.val();
          var msg = check(data);

          if (msg) {
            (function () {
              var clearBorder = function clearBorder() {
                $(this).removeClass('form-control-error');
                $(this).unbind('click', clearBorder);
                msgDom.remove();
              };

              var msgDom = $('<p style="color: red;font-size: 0.9rem;">' + msg + '</p>');
              input.click(clearBorder);
              input.addClass('form-control-error');
              input.after(msgDom);
              failure = true;
            })();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return failure;
    }
  };
  var NavTab = {
    init: function init() {
      var clickHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var finishHook = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
      var changeHook = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
      // 处理导航标签相关的事情
      var tabCount = parseInt($('#mytab li:last-child a').attr('aria-controls').replace(/[^0-9]/ig, ""));
      $('#nextBtn').click(function () {
        var curTab = $('.nav-link.active').attr('aria-controls');
        curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
        var nxtTab = curTab >= tabCount ? curTab : curTab + 1;
        var err = clickHook(curTab, nxtTab);

        if (!err) {
          $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
        }
      });
      $('#backBtn').click(function () {
        var curTab = $('.nav-link.active').attr('aria-controls');
        curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
        var nxtTab = curTab > 1 ? curTab - 1 : curTab;
        var err = clickHook(curTab, nxtTab);

        if (!err) {
          $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
        }
      });
      $('#finishBtn').click(function () {
        finishHook();
      });
      $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var tarTab = $(e.target).attr('aria-controls');
        tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));

        if (tarTab === 1) {
          $('#backBtn').addClass('disabled');
        } else {
          $('#backBtn').removeClass('disabled');
        }

        if (tarTab === tabCount) {
          $('#nextBtn').css('display', 'none');
          $('#finishBtn').css('display', '');
        } else {
          $('#nextBtn').css('display', '');
          $('#finishBtn').css('display', 'none');
        }
      }); // 处理Tab标签页切换事件

      $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var tarTab = $(e.target).attr('aria-controls');
        tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
        var lstTab = $(e.relatedTarget).attr('aria-controls');
        lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));
        changeHook(lstTab, tarTab);

        if (tarTab === 1) {
          $('#title h3').text('排班周期选择');
          $('#title p').text('请选择三线排班的周期');
        } else if (tarTab === 2) {} else if (tarTab === 3) {}
      });
    }
  };
  var UserTable = {
    init: function init() {
      if (!varHolder.userTable) {
        varHolder.userTable = new DatatableModule('#userTable');
        var colTitle = [{
          title: '姓名'
        }, {
          title: '备注'
        }, {
          title: '规则'
        }, {
          name: "control",
          searchable: false,
          title: "操作",
          orderable: false,
          defaultContent: "<input type=\"button\" value=\"\u274C\" style=\"border-style: none;background: inherit;\">",
          createdCell: function createdCell(cell, cellData, rowData, rowIndex, colIndex) {
            $(cell).on("click", "input", {
              rowIndex: rowIndex,
              rowData: rowData
            }, function (event) {
              var rowNum = event.data.rowIndex;
              var rowData = event.data.rowData;
              Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据', function () {
                varHolder.userTable.table.row(rowNum).remove().draw();
              }, 'okDelRowBtn');
            });
          }
        }];
        Utils.getJson({
          url: common.tlinedata
        }, function (data) {
          if (typeof data == 'String') {
            data = JSON.parse(data);
          }

          varHolder.userTable.createTable(data, {
            table: {
              searching: false,
              // 禁止搜索
              ordering: false,
              // 禁止排序
              autoWidth: true,
              paging: false,
              columns: colTitle
            }
          });
        });
      }

      $('#usrTableAddBtn').click(function () {
        Utils.showModal('addModal', '排班规则设置', '', function () {
          var name = $('#usrAddName').val();
          var comment = $('#usrAddComment').val();
          var rule = {
            0: new Set(),
            1: new Set()
          };
          $('#usrAddForm .ruleRow').each(function () {
            var subRule = $(this).find('select').val();
            var date = $(this).find('input').val().split(' ');
            date.forEach(function (ele) {
              rule[subRule].add(ele);
            });
          }); // 遍历数组将Set类型转换为Array

          for (var i in rule) {
            rule[i] = Array.from(rule[i]);
          }

          rule = JSON.stringify(rule);
          var tabLength = varHolder.userTable.table.columns().header().length - 1;
          var data = new Array(tabLength).fill('');
          data[0] = name;
          data[1] = comment;
          data[2] = rule;
          varHolder.userTable.table.row.add(data).draw();
        }, 'okAddBtn');
        var initHtml = "<form id=\"usrAddForm\"><div class=\"form-group row\">\n                        <label class=\"col-form-label col-sm-3\">\u59D3\u540D</label>\n                        <input type=\"text\" class=\"form-control col-sm-7\" id=\"usrAddName\">\n                    </div>\n                    <div class=\"form-group row\">\n                        <label class=\"col-form-label col-sm-3\">\u5907\u6CE8</label>\n                        <input type=\"text\" class=\"form-control col-sm-7\" id=\"usrAddComment\">\n                    </div>\n                    <div class=\"form-group row\">\n                        <label class=\"col-form-label col-sm-3\">\u89C4\u5219</label>\n                    </div>\n                    <div class=\"form-group row d-flex justify-content-center\" id=\"usrAddIcon\">\n                        <i class=\"nc-icon nc-simple-add\" style=\"font-size:25px;cursor:pointer;\"></i></div>\n                    </form>";
        var ruleHtml = "<div class=\"form-group row align-items-center ruleRow\">\n                    <i class=\"nc-icon nc-simple-delete col-sm-1\" style=\"font-size:20px;cursor:pointer;padding-right:20px;\"></i>\n                    <select class=\"form-control col-sm-3 custom-select\">\n                        <option value='1'>\u503C</option>\n                        <option value='0'>\u4E0D\u503C</option>\n                    </select>\n                    <input type=\"text\" class=\"form-control col-sm-8\">\n                </div>";
        $('#addModal .modal-body').append(initHtml); // 处理添加规则点击事件

        $('#usrAddIcon').click(function () {
          $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml);
          $('#usrAddForm .ruleRow i').click(function () {
            $(this).parent().remove();
          });
        });
      });
      $('#usrTableDelBtn').click(function () {
        Utils.showModal('delModal', '警告', '是否确定删除数据', function () {
          varHolder.userTable.updateData([]);
          Utils.postJson({
            url: common.tlinedata,
            data: JSON.stringify([])
          }, function () {
            return common.showNotification('数据清楚成功', 'success');
          }, function () {
            return common.showNotification('数据清楚失败', 'error');
          });
        }, 'okDelBtn');
      });
      $('#usrTableSaveBtn').click(function () {
        UserTable.postUserTable();
      });
    },
    postUserTable: function postUserTable() {
      Utils.postJson({
        url: common.tlinedata,
        data: JSON.stringify(varHolder.userTable.table.data().toArray())
      }, function () {
        return common.showNotification('数据保存成功', 'success');
      }, function () {
        return common.showNotification('数据保存失败', 'error');
      });
    }
  };
  var PreAranTable = {
    init: function init() {
      if (!varHolder.preTable) {
        varHolder.preTable = new DatatableModule('#preAranTable');
        var colTitle = [{
          title: '姓名'
        }, {
          title: '日期'
        }, {
          name: "control",
          searchable: false,
          title: "操作",
          orderable: false,
          defaultContent: "<input type=\"button\" value=\"\u274C\" style=\"border-style: none;background: inherit;\">",
          createdCell: function createdCell(cell, cellData, rowData, rowIndex, colIndex) {
            $(cell).on("click", "input", {
              rowIndex: rowIndex,
              rowData: rowData
            }, function (event) {
              var rowNum = event.data.rowIndex;
              var rowData = event.data.rowData;
              Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据', function () {
                varHolder.preTable.table.row(rowNum).remove().draw();
              }, 'okDelRowBtn');
            });
          }
        }];
        Utils.getJson({
          url: common.tlinePre
        }, function (data) {
          if (typeof data == 'String') {
            data = JSON.parse(data);
          }

          varHolder.preTable.createTable(data, {
            table: {
              searching: false,
              // 禁止搜索
              ordering: false,
              // 禁止排序
              autoWidth: true,
              paging: false,
              columns: colTitle
            }
          });
        });
      }

      $('#preTableAddBtn').click(function () {
        Utils.showModal('addModal', '添加排班日期', '', function () {
          var name = $('#usrAddName').val();
          var date = [];
          $('#usrAddForm .ruleRow').each(function () {
            var curDate = $(this).find('input').val();
            date.push(curDate);
          });
          date = JSON.stringify(date);
          var tabLength = varHolder.preTable.table.columns().header().length - 1;
          var data = new Array(tabLength).fill('');
          data[0] = name;
          data[1] = date;
          varHolder.preTable.table.row.add(data).draw();
        }, 'okAddBtn');
        var initHtml = "<form id=\"usrAddForm\"><div class=\"form-group row\">\n                        <label class=\"col-form-label col-sm-3\">\u59D3\u540D</label>\n                        <input type=\"text\" class=\"form-control col-sm-7\" id=\"usrAddName\">\n                    </div>\n                    <div class=\"form-group row\">\n                        <label class=\"col-form-label col-sm-3\">\u503C\u73ED\u65E5\u671F</label>\n                    </div>\n                    <div class=\"form-group row d-flex justify-content-center\" id=\"usrAddIcon\">\n                        <i class=\"nc-icon nc-simple-add\" style=\"font-size:25px;cursor:pointer;\"></i></div>\n                    </form>";
        var ruleHtml = "<div class=\"form-group row align-items-center ruleRow\">\n                    <i class=\"nc-icon nc-simple-delete col-sm-1\" style=\"font-size:20px;cursor:pointer;padding-right:20px;\"></i>\n                    <div class=\"col-sm-1\"></div>\n                    <input id=\"addDatePicker\" class=\"form-control col-sm-8\">\n                </div>";
        $('#addModal .modal-body').append(initHtml);
        $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml); // 处理添加规则点击事件

        $('#usrAddIcon').click(function () {
          $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml);
          $('#usrAddForm .ruleRow i').click(function () {
            $(this).parent().remove();
          });
        });
      });
      $('#preTableDelBtn').click(function () {
        Utils.showModal('delModal', '警告', '是否确定删除数据', function () {
          varHolder.preTable.updateData([]);
          Utils.postJson({
            url: common.tlinePre,
            data: JSON.stringify([])
          }, function () {
            return common.showNotification('数据清楚成功', 'success');
          }, function () {
            return common.showNotification('数据清楚失败', 'error');
          });
        }, 'okDelBtn');
      });
      $('#preTableSaveBtn').click(function () {
        PreAranTable.postTable();
      });
    },
    postTable: function postTable() {
      Utils.postJson({
        url: common.tlinePre,
        data: JSON.stringify(varHolder.preTable.table.data().toArray())
      }, function () {
        return common.showNotification('数据保存成功', 'success');
      }, function () {
        return common.showNotification('数据保存失败', 'error');
      });
    }
  };
  var DateUtils = {
    format: function format(date, fmt) {
      //author: meizz
      var o = {
        "M+": date.getMonth() + 1,
        //月份
        "d+": date.getDate(),
        //日
        "h+": date.getHours(),
        //小时
        "m+": date.getMinutes(),
        //分
        "s+": date.getSeconds(),
        //秒
        "q+": Math.floor((date.getMonth() + 3) / 3),
        //季度
        "S": date.getMilliseconds() //毫秒

      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }

      return fmt;
    },
    // 获取一个月有多少天
    getDaysInMonth: function getDaysInMonth(year, month) {
      var date = new Date(year, month, 0);
      return date.getDate();
    },
    // 获取起始日期和结束日期中的所有日期
    getDatesInRange: function getDatesInRange(startDate, endDate) {
      var dates = [];
      var currentDate = startDate;

      var addDays = function addDays(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + 1);
        return date;
      };

      while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
      }

      return dates;
    }
  };
  var ResultTable = {
    showTable: function showTable() {
      if (!varHolder.resultTable) {
        varHolder.resultTable = new DatatableModule('#resultTable');
        var colTitle = [{
          title: '日期'
        }, {
          title: '姓名'
        }, {
          title: '值班次数'
        }];
        varHolder.resultTable.createTable([], {
          table: {
            autoWidth: true,
            dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
            buttons: [{
              extend: 'excelHtml5',
              filename: '三线排班表',
              title: null
            }],
            columns: colTitle
          }
        });
      } // 首先读取设置的起始日期和结束日期


      var startDate = varHolder.startDate.split('/').map(function (item) {
        return parseInt(item);
      });
      startDate.push(1);
      var endDate = varHolder.endDate.split('/').map(function (item) {
        return parseInt(item);
      });
      endDate.push(0); // 由于Date中的month的坑，需要处理month

      startDate[1]--; // 转换为Date对象

      startDate = _construct(Date, _toConsumableArray(startDate));
      endDate = _construct(Date, _toConsumableArray(endDate)); // 获取起始日期与结束日期之间的所有日期Date对象

      var datesArr = DateUtils.getDatesInRange(startDate, endDate); // 根据Tab1和Tab2两个表格的信息生成一个人员信息的对象

      var peopleData = {}; // 获取Usertable的所有人员信息

      var tableData = varHolder.userTable.table.data().toArray();
      tableData.forEach(function (ele) {
        peopleData[ele[0]] = {
          rule: JSON.parse(ele[2]),
          date: []
        };
      }); // 获取pretable的所有信息

      var preData = varHolder.preTable.table.data().toArray(); // 将pretable中所有的日期信息转化为Date对象并存入到peopleData中

      preData.forEach(function (ele) {
        var _peopleData$ele$0$dat;

        var datesObjArr = [];
        var dates = JSON.parse(ele[1]);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = dates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var date = _step2.value;
            var dateArr = date.split('.').map(function (item) {
              return parseInt(item);
            });
            dateArr[0] = 2000 + dateArr[0] % 100;
            dateArr[1]--;

            var dateObj = _construct(Date, _toConsumableArray(dateArr));

            datesObjArr.push(dateObj);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        (_peopleData$ele$0$dat = peopleData[ele[0]].date).push.apply(_peopleData$ele$0$dat, datesObjArr);
      }); // 将所有的人名提取出来构造一个队列

      var names = Object.keys(peopleData); // 计算每人平均排班天数

      var avgDays = Math.ceil(datesArr.length / names.length); // 处理得到所有预排班的信息

      var preArrangeDates = [];
      var preArrangeNames = [];
      preData.forEach(function (ele) {
        var dates = JSON.parse(ele[1]);
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = dates[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var date = _step3.value;
            date = date.split('.');
            date[0] = 2000 + date[0] % 100;
            date[1]--;
            date = _construct(Date, _toConsumableArray(date)).valueOf();
            preArrangeDates.push(date);
            preArrangeNames.push(ele[0]);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }); // 新建一个用于存储结果的容器

      var resultData = []; // 遍历所有日期

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = datesArr[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var date = _step4.value;
          // 如果该日期已经预排班则记录后直接进行下一次循环
          var idx = preArrangeDates.indexOf(date.valueOf());

          if (idx !== -1) {
            resultData.push([DateUtils.format(date, 'yy-MM-dd'), preArrangeNames[idx]]);
            continue;
          }

          var namesCopy = JSON.parse(JSON.stringify(names)); // 遍历人员名单找出符合要求的人员

          for (var i = 0; i < namesCopy.length; i++) {
            var name = namesCopy[i];
            var rule = peopleData[name].rule;
            var avaStat = isDateAvaiable(date, rule) && isDateMeetRule(date, peopleData[name].date, avgDays); // 如果规则检查表示可以排班则直接排班

            if (avaStat) {
              // 将结果输出
              resultData.push([DateUtils.format(date, 'yy-MM-dd'), name]); // 更新人员历史记录

              peopleData[name].date.push(date); // 将指定位置的人员放到队尾

              names.push(names.splice(i, 1)[0]); // 跳出内层循环

              break;
            } // 如果循环到最后一个仍未找到则直接取第一个人作为解决方案


            if (i + 1 === namesCopy.length) {
              // 将结果输出
              resultData.push([DateUtils.format(date, 'yy-MM-dd'), namesCopy[0]]); // 更新人员历史记录

              peopleData[namesCopy[0]].date.push(date); // 将指定位置的人员放到队尾

              names.push(names.splice(0, 1)[0]);
            }
          }
        } // 计算数组中某元素数据的次数

      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var countOccurences = function countOccurences(arr, value) {
        return arr.reduce(function (a, v) {
          return v === value ? a + 1 : a;
        }, 0);
      };

      var namesArray = [];
      resultData.forEach(function (ele) {
        return namesArray.push(ele[1]);
      });
      resultData = resultData.map(function (ele) {
        ele.push(countOccurences(namesArray, ele[1]));
        return ele;
      }); // 更新resultTable即可

      varHolder.resultTable.updateData(resultData);
      /**
       * 判断目标日期是否满足规则函数
       * @param {Date} date 目标Date日期对象
       * @param {Array} history 历史日期对象数组
       * @param {Number} avgDays 平均每人值班数量
       */

      function isDateMeetRule(date, history, avgDays) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = history[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var hisDate = _step5.value;
            // 保证两次值班时间大于10天
            var times = Math.abs(Math.round((date - hisDate) / (24 * 60 * 60 * 1000))); // 如果值班间隔小于10天表示不满足条件

            if (times < 10) {
              return false;
            }
          } // 如果此人已值班数量大于平均值班数则不满足条件

        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (history.length >= avgDays) {
          return false;
        }

        return true;
      }
      /**
       * 判断指定日期是否可以排班
       * @param {Date} date 传入的Date实例对象
       * @param {Object} rule 对应人员的排班规则
       */


      function isDateAvaiable(date, rule) {
        function dateInSigRule(date, rule) {
          // 只有一位考虑是星期规则
          if (rule.length === 1 && parseInt(rule) <= 7) {
            // 获取日期的星期
            var day = date.getDay(); // 将星期日从0转化为7

            day = day ? day : 7;
            var ruleDay = parseInt(rule);

            if (day === ruleDay) {
              return true;
            } else {
              return false;
            }
          } else {
            // 否则考虑是日期规则
            var ruleDate = rule.split('.');
            ruleDate = ruleDate.map(function (item) {
              return parseInt(item);
            });

            if (ruleDate.length === 3) {
              ruleDate[0] %= 100;
            }

            var dateArr = [date.getDate(), date.getMonth() + 1, date.getFullYear() % 100];
            var equalFlag = true;
            var subRuleDate = ruleDate.pop();

            while (subRuleDate) {
              var subdate = dateArr.splice(0, 1)[0];

              if (subdate !== subRuleDate) {
                equalFlag = false;
              }

              subRuleDate = ruleDate.pop();
            }

            if (equalFlag) {
              return true;
            } else {
              return false;
            }
          }
        }

        function dateInRuleRange(date, rule) {
          var rulesArr = rule.split('-'); // 只有一位考虑是星期规则

          if (rulesArr[0].length === 1) {
            // 获取日期的星期
            var day = date.getDay(); // 将星期日从0转化为7

            day = day ? day : 7;
            var ruleStartDay = parseInt(rulesArr[0]);
            var ruleEndDay = parseInt(rulesArr[1]);

            if (day >= ruleStartDay && day <= ruleEndDay) {
              return true;
            } else {
              return false;
            }
          } else {
            // 否则考虑是日期规则
            // 如果规则是
            var startRuleArr = rulesArr[0].split('.');
            var endRuleArr = rulesArr[1].split('.'); // 如果规则只包含日期信息

            if (startRuleArr.length === 1 && endRuleArr.length === 1) {
              var dateDay = date.getDate();
              var startRuleDay = parseInt(startRuleArr[0]);
              var endRuleDay = parseInt(endRuleArr[0]);

              if (dateDay >= startRuleDay && dateDay <= endRuleDay) {
                return true;
              } else {
                return false;
              }
            } else if (startRuleArr.length === 2 && endRuleArr.length === 2) {
              var _dateDay = date.getDate();

              var dateMonth = date.getMonth() + 1;
              var dateDate = dateMonth * 100 + _dateDay;
              var startRuleDate = parseInt(rulesArr[0].replace(/\./g, ''));
              var endRuleDate = parseInt(rulesArr[1].replace(/\./g, ''));

              if (dateDate >= startRuleDate && dateDate <= endRuleDate) {
                return true;
              } else {
                return false;
              }
            } else if (startRuleArr.length === 3 && endRuleArr.length === 3) {
              var _dateDay2 = date.getDate();

              var _dateMonth = date.getMonth() + 1;

              var dateYear = date.getFullYear() % 100;

              var _dateDate = dateYear * 10000 + _dateMonth * 100 + _dateDay2;

              var _startRuleDate = parseInt(rulesArr[0].replace(/\./g, ''));

              var _endRuleDate = parseInt(rulesArr[1].replace(/\./g, ''));

              if (_dateDate >= _startRuleDate && _dateDate <= _endRuleDate) {
                return true;
              } else {
                return false;
              }
            }
          }
        }

        function dateInRule(date, rule) {
          // 按照'-'分割rule
          var subRules = rule.split('-'); // 如果规则只有一位表明是指定值

          if (subRules.length === 1) {
            return dateInSigRule(date, rule);
          } else {
            // 否则就是一个范围
            return dateInRuleRange(date, rule);
          }
        } // 首先处理不可排班规则


        var ruleUnava = rule['0']; // 如果规则存在

        if (ruleUnava.length) {
          // 遍历每隔子规则
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = ruleUnava[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var subRule = _step6.value;
              var result = dateInRule(date, subRule); // 如果目标日期在不可排班日期中则直接返回false表示不可排班

              if (result) {
                return false;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        } // 接下来遍历可排班规则


        var ruleAva = rule['1'];

        if (ruleAva.length) {
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = ruleAva[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var _subRule = _step7.value;

              var _result = dateInRule(date, _subRule); // 如果目标日期指定的规则范围中则直接返回可以排班


              if (_result) {
                return true;
              }
            } // 如果遍历完成没有符合排班条件的直接返回不可排班

          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          return false;
        } // 其他情况则表示可以排班


        return true;
      }
    }
  };
  var tabCheckers = {
    '1': [{
      dom: '#startMonth',
      checker: function checker(d) {
        return d ? null : '日期不能为空';
      }
    }, {
      dom: '#endMonth',
      checker: function checker(val) {
        if (!val) {
          return '日期不能为空';
        }

        var startDate = parseInt($('#startMonth').val().replace('/', ''));
        var endDate = parseInt(val.replace('/', ''));

        if (endDate < startDate) {
          return '请确保结束日期小于开始日期';
        }

        return null;
      }
    }],
    '2': [],
    '3': [],
    '4': []
  };

  (function pageInit() {
    // 初始化所有的日期选择器
    // $('[data-toggle="datepicker"]').val('');
    $('[data-toggle="datepicker"]').datepicker({
      format: 'yyyy/mm',
      language: 'zh-CN'
    }); // 初始化UserTable

    UserTable.init();
    PreAranTable.init();
    NavTab.init(function (t) {
      return DataCheck.formDataChecker(tabCheckers[t]);
    }, function () {
      $('#resultTable_wrapper button').click();
    }, function (lst, tar) {
      if (tar === 1) {
        $('#title h3').text('排班周期选择');
        $('#title p').text('请选择三线排班的周期');
      } else if (tar === 2) {
        $('#title h3').text('人员信息维护');
        $('#title p').text('请输出本次排班中的人员信息');
      } else if (tar === 3) {
        $('#title h3').text('已排班信息');
        $('#title p').text('请输入已经排好的节假日信息');
      } else if (tar === 4) {
        $('#title h3').text('排班结果');
        $('#title p').text('这里输出了排班的结果');
        ResultTable.showTable();
      } // 处理从标签1切换到标签2事件


      if (lst === 1 && tar === 2) {
        varHolder.startDate = $('#startMonth').val();
        varHolder.endDate = $('#endMonth').val();
      } // 处理从标签页2切换走的事件


      if (lst === 2) {
        // 上传用户数据到服务器
        UserTable.postUserTable();
      } else if (lst === 3) {
        PreAranTable.postTable();
      }
    });
  })();
});