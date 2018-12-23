"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-25 10:53:50
 */
define(['jquery', 'common', 'module.utils', 'module.datatable', 'FileSaver'], function ($, common, Utils, DatatableModule, FileSaver) {
  'use strict';

  var tableInited = false;
  var table = null,
      table2 = null,
      table3 = null;
  var curMonth = '1810';
  var peopleCurData = [];
  var tableCols = null; // 处理标签页相关的事物

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var tarTab = $(e.target).attr('aria-controls');
    tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
    var lstTab = $(e.relatedTarget).attr('aria-controls');
    lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

    if (tarTab === 1) {
      // if (lstTab === 2) {
      //     BackupClearInterval();
      // }
      $('#title h3').text('输入月份');
      $('#title p').text('请设置分组的月份');
    } else if (tarTab === 2) {
      // 判断是否从标签1切换而来
      if (lstTab === 1) {
        // 获取输入的月份
        curMonth = $('#month').val();
        curMonth = String(curMonth);

        if (!curMonth) {
          curMonth = '1810';
        }

        if (tableInited === false) {
          tableInited = true;
          showTab2(curMonth);
        }
      }

      $('#title h3').text('开始分组');
      $('#title p').text('从第二个待分组人员数据表中选择要分组的人员');
    }
  });

  function hideTableCols(table, colRange) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : table.table.columns().data();

    // 遍历选中的每一列
    for (var idx = colRange[0]; idx <= colRange[1]; idx++) {
      var col_data = data[idx];
      var emptyFlag = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = col_data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item !== '') {
            emptyFlag = false;
            break;
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

      if (emptyFlag) {
        table.table.column(idx).visible(false);
      }
    }
  } // 新建一个自定义的下拉栏


  $('#datatables2').on('init.dt', function () {
    $('#mySelect').append("<select class=\"form-control col-sm-7\" id=\"formSelect\">\n                                    <option value=\"\" selected>\u8BF7\u9009\u62E9\u7C7B\u522B</option>\n                                    <option>\u672C\u9662\u4F4F\u9662\u533B</option>\n                                    <option>\u516B\u5E74\u5236\uFF08\u9AA8\u79D1\uFF09</option>\n                                    <option>\u516B\u5E74\u5236\uFF08\u975E\u9AA8\u79D1\uFF09</option>\n                                    <option>\u7814\u7A76\u751F\uFF08\u9AA8\u79D1\uFF09</option>\n                                    <option>\u7814\u7A76\u751F\uFF08\u975E\u9AA8\u79D1\uFF09</option>\n                                    <option>\u9AA8\u79D1\u4E34\u535A</option>\n                                    <option>\u57FA\u5730\u4F4F\u9662\u533B</option>\n                                    <option>\u8FDB\u4FEE\u533B</option>\n                                    <option>\u5176\u4ED6</option>\n                                </select>").css('width', '100%').change(function () {
      var val = $('#formSelect').val();
      $('#datatables2_filter input').val(val).keyup();
    });
  });

  function showTab2(month) {
    Utils.getJson({
      url: common.dataUrl
    }, function (data) {
      if (typeof data == 'String') {
        data = JSON.parse(data);
      }

      console.log(data); // 这里存储了当月需要分组的每个人的信息

      var peopleCurMonth = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.peopledata[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var person = _step2.value;

          // 找出指定月份需要分组的人员
          if (person.month.indexOf(month) !== -1) {
            peopleCurMonth.push(person);
          }
        } // 构建一个科室名的列标题

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

      var departNames = [];

      for (var key in data.departid) {
        departNames.push(data.departid[key]);
      }

      var departCols = departNames.map(function (item) {
        return {
          title: item
        };
      }); // 首先创建第一个科室分组名单数据表

      tableCols = _toConsumableArray(departCols);
      table = Utils.getInstance(table, DatatableModule, ['#datatables']);
      table.createTable([], {
        table: {
          paging: false,
          ordering: false,
          columns: tableCols,
          dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
          buttons: [{
            extend: 'excelHtml5',
            filename: '科室分组表',
            title: null
          }]
        }
      }); // 接下来创建第二个待分配人员名单数据表

      /**
       * 获取当前月份的上一个月份函数
       * @param  {String} month 当前月份
       * @return {String}       上一个月份
       */

      var getLstMonth = function getLstMonth(date) {
        // 首相将数据转换为int型
        date = parseInt(date); // 然后分离月份和年份

        var month = date % 100;
        var year = Math.floor(date / 100); // 判断是否为1月

        if (month <= 1) {
          month = 12;
          year--;
        } else {
          month--;
        }

        return (year * 100 + month).toString();
      };
      /**
       * 获取月份列表函数
       * @param  {String} curMonth 当前月份
       * @return {Array}           返回月份数组
       */


      var getLastMonths = function getLastMonths(curMonth) {
        var monthsArr = [];

        for (var i = 0; i < 8; i++) {
          // 循环获取上一个月份
          curMonth = getLstMonth(curMonth);
          monthsArr.splice(0, 0, curMonth);
        }

        return monthsArr;
      }; // 首先获取monthscols列表


      var months = getLastMonths(month);
      var monthsCol = months.map(function (item) {
        return {
          title: item
        };
      }); // 准备列标题

      var peopleCols = [{
        title: '姓名'
      }, {
        title: '类别'
      }, {
        title: '备注'
      }].concat(_toConsumableArray(monthsCol)); // 准备表格数据

      peopleCurData = [];

      for (var _i = 0; _i < peopleCurMonth.length; _i++) {
        var _person = peopleCurMonth[_i];
        var temp = Array(peopleCols.length).fill('');
        temp[0] = _person.name;
        temp[1] = _person.type;

        if (_person.remark) {
          temp[2] = _person.remark;
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = _person.history[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var item = _step4.value;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = item.month[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _month = _step5.value;
                var idx = months.indexOf(_month);

                if (idx !== -1) {
                  temp[idx + 3] = item.name;
                }
              }
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
          }
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

        peopleCurData.push(temp);
      }

      table2 = Utils.getInstance(table2, DatatableModule, ['#datatables2']);
      table2.createTable(peopleCurData, {
        table: {
          ordering: false,
          // 禁止排序
          autoWidth: true,
          // 自动宽度
          columns: peopleCols,
          dom: "<'row'<'col-md-4 d-flex justify-content-start align-items-center'l<'#mySelect'>><'col-md-8 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
          buttons: [{
            extend: 'excelHtml5',
            filename: '带分组人员名单',
            title: null
          }]
        }
      });
      hideTableCols(table2, [3, 10]); // 为表格1创建点击事件

      $('#datatables tbody').on('click', 'td', function () {
        // 如果数组为空则直接退出程序
        if (table.table.data().toArray().length === 0) {
          return;
        } // 获取当前点击的单元格的位置


        var cell = table.table.cell(this);
        var index = cell.index();
        var cellData = cell.data();

        var showModalCallback = function showModalCallback() {
          // 删除表格中指定单元格数据
          delTableCell(table, cell); // 获取table3的数据

          var table3Data = table3.table.data().toArray();

          for (var i = 0; i < table3Data.length; i++) {
            // 根据人名对应关系找到
            if (table3Data[i][0] === cellData) {
              // 删除对应位置的数据行
              var temp = table3Data.splice(i, 1)[0];
              table3.updateData(table3Data);
              var table2Data = table2.table.data().toArray();
              temp.pop();
              table2Data.splice(0, 0, temp);
              table2.updateData(table2Data);
              break;
            }
          }
        };

        if (cellData !== '') {
          // 触发模态框
          Utils.showModal('modal', '注意', cellData + '将被移出科室分组名单，重新退回待分组列表中，是否确定', showModalCallback, 'okBtn');
        }
      }); // 为表格2创建点击事件

      $('#datatables2 tbody').on('click', 'tr', function () {
        // 获取当前点击的行的位置
        var row = table2.table.row(this);
        var name = row.data()[0]; // 生成按钮的HTML

        var table2ModalBtnHtml = function (cols) {
          var html = '';
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = cols[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var item = _step3.value;
              html += '<button type="button" class="btn btn-outline-primary">';
              html += item.title;
              html += "</button>";
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

          return html;
        }(departCols);

        Utils.showModalNoBtn('modal', '请选择' + name + '的科室', "<div class=\"row\" id=\"departBtnGroup\">\n                                ".concat(table2ModalBtnHtml, "\n                            </div>"));
        $('#departBtnGroup button').click(function () {
          // 如果数组为空则直接退出程序
          if (table2.table.data().toArray().length === 0) {
            return;
          } // 获取当前行数据


          var rowData = row.data(); // 移除当前点击的行

          row.remove(); // 重新绘制表格

          table2.table.draw(); // 将数据添加到表格3中并重新绘制

          rowData.push($(this).text());
          table3.table.row.add(rowData).draw(); // 将数据添加到表格1中并重新绘制
          // 首先获取当前表格有多少行

          var rows_length = table.table.rows().data().length; // 获取列数据

          var table_col = departNames.indexOf($(this).text());
          var idData = table.table.column(0).data().toArray();
          var colData = table.table.column(table_col).data().toArray(); // 如果该列最后一行为空则直接添加的空的单元格中

          if (colData.length && colData[colData.length - 1] === '') {
            colData.every(function (val, idx) {
              if (val === '') {
                table.table.cell({
                  row: idx,
                  column: table_col
                }).data(name);
                return false;
              } else {
                return true;
              }
            });
          } else {
            // 否则需要新加一行数据
            var tableRowData = Array(tableCols.length).fill('');
            tableRowData[table_col] = name;
            table.table.row.add(tableRowData).draw();
          } // 刷新显示


          table.table.draw(); // 关闭模态框显示

          $('#modal').modal('hide');
        });
      }); // 接下来创建第三个已分配人员名单数据表

      var peopleCols3 = [].concat(_toConsumableArray(peopleCols), [{
        title: month
      }]);
      table3 = Utils.getInstance(table3, DatatableModule, ['#datatables3']);
      table3.createTable([], {
        table: {
          ordering: false,
          // 禁止排序
          autoWidth: true,
          // 自动宽度
          columns: peopleCols3,
          dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
          buttons: [{
            extend: 'excelHtml5',
            filename: '已分组人员名单',
            title: null
          }]
        }
      });
      hideTableCols(table3, [3, 10], table2.table.columns().data()); // 获取备份数据

      BackupGetData();
    }, function () {
      return common.showNotification('获取数据失败，请检查服务器连接！', 'danger');
    });
  }
  /**
   * 删除一个单元格并重新排列表格
   * @param  {Object} table module.datatable对象实例
   * @param  {Object} cell  Datatables cell对象
   * @return {null}       null
   */


  function delTableCell(table, cell) {
    // 重新调整表格数据
    // 获取当前表格的全部数据
    var allData = table.table.data().toArray(); // 从单元格中获取index

    var index = cell.index();
    delArrayCell(allData, index);
    table.updateData(allData);
  }
  /**
   * 删除一个数组中的某个单元格并重新排列
   * @param  {Array} array 源数组
   * @param  {Obejct} index 单元格位置
   * @return {Array}       返回的数组
   */


  function delArrayCell(array, index) {
    // 如果操作的是最后一行数据
    if (index.row === array.length - 1) {
      array[index.row][index.column] = '';
    } else {
      for (var i = index.row + 1; i < array.length; i++) {
        // 向上迁移数据
        array[i - 1][index.column] = array[i][index.column];

        if (array[i][index.column] === '') {
          break;
        }

        array[i][index.column] = '';
      }
    } // 判断最后一行是否为全空


    var lstArray = array[array.length - 1];
    var arrayEmptyFlag = true;

    for (var _i2 = 0; _i2 < lstArray.length; _i2++) {
      if (lstArray[_i2] !== '') {
        arrayEmptyFlag = false;
        break;
      }
    }

    if (arrayEmptyFlag) {
      array.pop();
    }

    return array;
  }
  /**
   * 将备份数据与当前人员数据合并
   * @param  {Object} bkdata  备份的三个表格的数据
   * @param  {Array} curdata 当前系统的人员数据数组
   * @return {Object}         合并后的备份数据
   */


  function mergeBackupData(bkdata, curdata) {
    // 从当前数据中取出人名数据
    var newDataName = [];
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = curdata[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var item = _step6.value;
        newDataName.push(item[0]);
      } // 从恢复的Table2和Table3中提取名字信息

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

    var backupDataName = [];
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = bkdata.table2[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var _item = _step7.value;
        backupDataName.push(_item[0]);
      }
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

    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = bkdata.table3[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var _item2 = _step8.value;
        backupDataName.push(_item2[0]);
      } // 将删除的数据记录在备份数据中同步删除
      // 需要遍历三个备份数据表格，找到被删除的数据进行删除
      // 首先遍历第一个表格

    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    for (var i = 0; i < bkdata.table.length; i++) {
      for (var j = 0; j < bkdata.table[i].length; j++) {
        var cellName = bkdata.table[i][j];

        if (cellName === '') {
          continue;
        } // 如果备份数据在当前系统数据中没有找到就需要删除


        if (newDataName.indexOf(cellName) === -1) {
          delArrayCell(bkdata.table, {
            row: i,
            column: j
          });
        }
      }
    } // 接下来遍历第二个表格


    for (var _i3 = 0; _i3 < bkdata.table2.length; _i3++) {
      var _cellName = bkdata.table2[_i3][0]; // 如果备份数据在当前系统数据中没有找到就需要删除

      if (newDataName.indexOf(_cellName) === -1) {
        bkdata.table2.splice(_i3, 1);
      }
    } // 接下来遍历第三个表格


    for (var _i4 = 0; _i4 < bkdata.table3.length; _i4++) {
      var _cellName2 = bkdata.table3[_i4][0]; // 如果备份数据在当前系统数据中没有找到就需要删除

      if (newDataName.indexOf(_cellName2) === -1) {
        bkdata.table3.splice(_i4, 1);
      }
    } // 针对表格2,3的已有数据使用系统最新数据进行替换
    // 首先遍历表格2


    for (var _i5 = 0; _i5 < bkdata.table2.length; _i5++) {
      var bkName = bkdata.table2[_i5][0];
      var idx = newDataName.indexOf(bkName); // 从当前系统数据中查找对应元素

      if (idx !== -1) {
        bkdata.table2.splice(_i5, 1, curdata[idx]);
      }
    } // 接下来遍历表格三


    for (var _i6 = 0; _i6 < bkdata.table3.length; _i6++) {
      var _bkName = bkdata.table3[_i6][0];

      var _idx = newDataName.indexOf(_bkName); // 从当前系统数据中查找对应元素


      if (_idx !== -1) {
        bkdata.table3[_i6][1] = curdata[_idx][1];
      }
    } // 将新添加的数据合并到备份数据中


    for (var _i7 = 0; _i7 < newDataName.length; _i7++) {
      // 判断当前系统是否有新的数据
      if (backupDataName.indexOf(newDataName[_i7]) === -1) {
        bkdata.table2.splice(0, 0, curdata[_i7]);
      }
    }

    return bkdata;
  } // 处理导航标签相关的事情


  var tabCount = parseInt($('#mytab li:last-child a').attr('aria-controls').replace(/[^0-9]/ig, ""));
  $('#nextBtn').click(function () {
    var curTab = $('.nav-link.active').attr('aria-controls');
    curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
    var nxtTab = curTab >= tabCount ? curTab : curTab + 1;
    $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
  });
  $('#backBtn').click(function () {
    var curTab = $('.nav-link.active').attr('aria-controls');
    curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
    var nxtTab = curTab > 1 ? curTab - 1 : curTab;
    $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
  });
  $('#finishBtn').click(function () {
    var tableData2Array = function tableData2Array(data) {
      var array = [];

      for (var i = 0; i < data.length; i++) {
        array.push(data[i]);
      }

      return array;
    };

    $('#datatables_wrapper button').click(); // 存储当前数据到SessionStorage

    var tableData = JSON.stringify({
      col: tableCols,
      data: tableData2Array(table.table.data())
    });
    sessionStorage.clear();
    sessionStorage.setItem('month', curMonth);
    sessionStorage.setItem('table', tableData); // 利用js点击url跳转页面

    window.location.href = '/ward.html';
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
  }); // 处理数据备份的事情

  var backupInterval = null;

  var BackupSenddata = function BackupSenddata() {
    var jsonData = {
      type: 'depart_bak',
      month: curMonth
    };
    jsonData.table = table.table.data().toArray();
    jsonData.table2 = table2.table.data().toArray();
    jsonData.table3 = table3.table.data().toArray();
    Utils.postJson({
      url: common.backUpUrl,
      data: JSON.stringify(jsonData)
    }, function () {
      return common.showNotification('备份成功！', 'success');
    }, function () {
      return common.showNotification('备份失败，请检查服务器连接！', 'danger');
    });
  };

  var BackupTimerCallBack = function BackupTimerCallBack() {
    BackupSenddata();
  };

  var BackupSetInterval = function BackupSetInterval() {
    if (backupInterval) {
      return;
    }

    backupInterval = setInterval(BackupTimerCallBack, 60000);
    common.showNotification('数据备份已开启，每60s备份一次', 'info');
  };

  var BackupClearInterval = function BackupClearInterval() {
    clearInterval(backupInterval);
    common.showNotification('数据备份已关闭', 'info');
  };

  var BackupGetData = function BackupGetData(callBack) {
    Utils.getJson({
      url: common.backUpUrl
    }, function (data) {
      if (typeof data == 'String') {
        data = JSON.parse(data);
      }

      if (!data.type || data.type !== 'depart_bak' || data.month !== curMonth) {
        common.showNotification('备份数据与当前选项不符', 'warning');
      } else {
        mergeBackupData(data, peopleCurData);
        table.updateData(data.table);
        table2.updateData(data.table2);
        table3.updateData(data.table3);
        common.showNotification('数据恢复成功！', 'success');
      } // 开启备份功能


      BackupSetInterval();
    }, function () {
      return common.showNotification('恢复失败，请检查服务器连接！', 'danger');
    });
  }; // 处理备份按钮点击函数


  $('#backupBtn').click(function () {
    var data = {
      table: table.table.data().toArray(),
      table2: table2.table.data().toArray(),
      table3: table3.table.data().toArray()
    };
    var blob = new Blob([JSON.stringify(data)], {
      type: "text/plain;charset=utf-8"
    });
    FileSaver.saveAs(blob, "depart_bak_" + getNowFormatDate() + ".json");
  }); // 处理恢复数据上传按钮

  $('#recoverBtn').change(function () {
    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

    var file = $('#recoverBtn')[0].files[0];
    var reader = new FileReader(); // 设置读取完成回调函数

    reader.onload = function (event) {
      var data = event.target.result;
      data = JSON.parse(data);
      mergeBackupData(data, peopleCurData);
      table.updateData(data.table);
      table2.updateData(data.table2);
      table3.updateData(data.table3);
      common.showNotification('数据恢复成功！', 'success');
    }; // 开始读取文件


    reader.readAsText(file);
  });
  $("#saveBtn").click(BackupSenddata);

  function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = "_";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();

    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }

    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }

    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + seperator2 + date.getHours() + seperator1 + date.getMinutes() + seperator1 + date.getSeconds();
    return currentdate;
  }
});