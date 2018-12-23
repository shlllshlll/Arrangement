"use strict";

/*
 * @Author: SHLLL
 * @Date:   2018-09-24 15:55:57
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-23 18:36:25
 */
define(['jquery', 'xlsx', 'common', 'module.datatable', 'module.utils', 'crc'], function ($, XLSX, common, DataTableModule, Utils, CRC) {
  'use strict';

  var table = null;
  var table2 = null;
  var table3 = null;
  var table4 = null;
  var table5 = null;
  var curMonth = null;
  var xlsxDataArrayInCol = [];
  var xlsxTitleArray = [];
  var tableColTitle = [];
  var xlsxDataArray = [];
  var table4data = [];
  /**
   * 处理页面初始化相关的事件
   */

  function page_init() {
    // 从sessionStorage中读取是否由数据存储
    var month = sessionStorage.getItem('month');
    var tableData = sessionStorage.getItem('table'); // 读取完成后清理存储

    sessionStorage.clear(); // 如果读取的数据不为空说明从科室分组跳转而来

    if (month !== null && tableData !== null) {
      // 将JSON字符串转化为对象
      tableData = JSON.parse(tableData); // 存储数据

      curMonth = month;
      tableColTitle = tableData.col;
      xlsxTitleArray = [];
      tableColTitle.forEach(function (v) {
        return xlsxTitleArray.push(v.title);
      });
      xlsxDataArray = tableData.data; // 转换为列数组

      xlsxDataArrayInCol = []; // 首先遍历每一列数组

      for (var i = 0; i < xlsxDataArray[0].length; i++) {
        var tempArray = [];

        for (var n = 0; n < xlsxDataArray.length; n++) {
          var item = xlsxDataArray[n][i];

          if (item) {
            tempArray.push(item);
          }
        }

        xlsxDataArrayInCol.push(tempArray);
      } // js点击下一步按钮切换到标签页2


      $('#nextBtn').click();
    }
  } // 处理Tab1的文件上传按钮


  $('#xslxUpload').change(function () {
    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

    var file = $('#xslxUpload')[0].files[0];
    var reader = new FileReader(); // 设置读取完成回调函数

    reader.onload = function (event) {
      var data = event.target.result;
      if (!rABS) data = new Uint8Array(data);
      var workbook = XLSX.read(data, {
        type: rABS ? 'binary' : 'array'
      });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      var xlsxData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1
      }); // 转换为行数组
      // 获取数据表的行数和列数

      var rowNum = xlsxData.length;
      var colNum = xlsxData[0].length;
      xlsxTitleArray = [];

      for (var key in xlsxData[0]) {
        xlsxTitleArray[parseInt(key)] = xlsxData[0][key];
      }

      xlsxDataArray = [];

      for (var i = 1; i < rowNum; i++) {
        // 数组初始化
        var tempArray = [];

        for (var n = 0; n < colNum; n++) {
          tempArray[n] = '';
        }

        for (var _key in xlsxData[i]) {
          tempArray[parseInt(_key)] = xlsxData[i][_key];
        }

        xlsxDataArray.push(tempArray);
      } // 转换为列数组


      xlsxDataArrayInCol = []; // 首先遍历每一列数组

      for (var _i = 0; _i < xlsxDataArray[0].length; _i++) {
        var _tempArray = [];

        for (var _n = 0; _n < xlsxDataArray.length; _n++) {
          var item = xlsxDataArray[_n][_i];

          if (item) {
            _tempArray.push(item);
          }
        }

        xlsxDataArrayInCol.push(_tempArray);
      }

      tableColTitle = [];
      xlsxTitleArray.forEach(function (v) {
        return tableColTitle.push({
          title: v
        });
      }); // 获取DataTableModule类实例

      table = table ? table : new DataTableModule('#datatables');
      table.createTable(xlsxDataArray, {
        table: {
          searching: false,
          // 禁止搜索
          ordering: false,
          // 禁止排序
          autoWidth: true,
          columns: tableColTitle
        }
      });
    }; // 开始读取文件


    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBufer(file);
    }
  }); // 处理激活各个Tab的事件

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var tarTab = $(e.target).attr('aria-controls');
    tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
    var lstTab = $(e.relatedTarget).attr('aria-controls');
    lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

    if (lstTab === 2) {
      BackupSenddata();
      BackupClearInterval();
    }

    if (tarTab === 1) {
      $('#title h3').text('选择科室排班文件');
      $('#title p').text('选择输入的科室排班文件数据，用于后续的病房排班');
    } else if (tarTab === 2) {
      BackupSetInterval();

      if (lstTab === 1) {
        if (!curMonth) curMonth = $('#fileMonth').val();
        var postDepartData = {
          title: xlsxTitleArray,
          data: xlsxDataArrayInCol,
          month: curMonth
        };
        Utils.postJson({
          url: common.departUrl,
          data: JSON.stringify(postDepartData)
        }, function () {
          return common.showNotification('历史数据保存成功！', 'success');
        }, function () {
          return common.showNotification('历史数据保存失败！', 'danger');
        });
      }

      $('#title h3').text('编辑科室排班数据');
      $('#title p').text('通过编辑下面的表格中的人员名单来更新人员名单数据');
      showTab2Table();
    } else if (tarTab === 3) {
      $('#title h3').text('日期及休假设置');
      $('#title p').text('在下面的表单中填写日期和人员的请假信息');
      var data = [];
      var title = [{
        title: '姓名'
      }, {
        title: '起始日期'
      }, {
        title: '结束日期'
      }]; // 获取DataTableModule类实例

      table3 = table3 ? table3 : new DataTableModule('#datatables3');
      table3.createTable(data, {
        table: {
          searching: false,
          // 禁止搜索
          ordering: false,
          // 禁止排序
          autoWidth: true,
          paging: false,
          info: false,
          columns: title
        }
      }); // showTab3Table(title, data);
    } else if (tarTab === 4) {
      // 如果从标签3切换到标签4
      if (lstTab === 3) {
        var startday = $('#startday').val();
        var endday = $('#endday').val();

        var _data = $('#datatables3').dataTable().api().data();

        var dataArray = [];

        for (var i = 0; i < _data.length; i++) {
          var tempArray = _data[i];
          var tempObj = {};
          var idx = tempArray.indexOf('');

          if (idx !== -1) {
            continue;
          }

          tempObj.name = tempArray[0];
          tempObj.start = tempArray[1];
          tempObj.end = tempArray[2];
          dataArray.push(tempObj);
        }

        var dataJson = {
          month: curMonth,
          startday: startday,
          endday: endday,
          data: dataArray
        }; // 准备人员数据

        var sliceDataArray = [];
        var tableData = table2.table.columns().data();

        for (var _i2 = 0; _i2 < tableData.length; _i2++) {
          var colData = tableData[_i2]; // 去除数据中的空元素

          colData.remove('');

          if (colData.length > 0) {
            sliceDataArray.push(colData);
          }
        }

        var data_all = {
          range: dataJson,
          people: sliceDataArray
        };
        $.ajax({
          type: "POST",
          url: common.wardUrl,
          data: JSON.stringify(data_all),
          dataType: 'json',
          xhrFields: {
            'Access-Control-Allow-Origin': '*'
          }
        }).done(function (data) {
          if (typeof data == 'String') {
            data = JSON.parse(data);
          }

          showTab4Table(data);
        }).fail(function () {
          return common.showNotification('数据保存失败，请检查服务器连接！', 'danger');
        });
      }

      $('#title h3').text('排班结果输出');
      $('#title p').text('下面的表格输出了最终的病房排班结果，可以使用到处按钮到处文件');
    }
  });

  function showTab2Table(data) {
    var wardColName = [{
      title: '骨1'
    }, {
      title: '骨2'
    }, {
      title: '骨3'
    }, {
      title: '骨4'
    }, {
      title: '小辅班'
    }, {
      title: '急诊一线'
    }];
    var tmp = table2 ? true : false;
    table2 = Utils.getInstance(table2, DataTableModule, ['#datatables2']);
    table2.createTable([], {
      table: {
        paging: false,
        ordering: false,
        // 禁止排序
        autoWidth: true,
        // 自动宽度
        columns: wardColName
      }
    }); // 获取备份数据

    if (!tmp) BackupGetData(); // 获取DataTableModule类实例

    table5 = table5 ? table5 : new DataTableModule('#datatables5');
    table5.createTable(xlsxDataArray, {
      table: {
        searching: false,
        // 禁止搜索
        ordering: false,
        // 禁止排序
        autoWidth: true,
        columns: tableColTitle
      }
    });
    $('#datatables2 tbody').on('click', 'td', function () {
      // 获取当前点击的单元格的位置
      var cell = table2.table.cell(this);
      var index = cell.index();
      var cellData = cell.data();

      var showModalCallback = function showModalCallback() {
        // 利用正则表达式提取括号外的内容
        cellData = cellData.match(/(\S*)\((.+?)\)/)[1];
        var nameFindFlag = false;
        xlsxDataArrayInCol.every(function (item, idx) {
          var index = item.indexOf(cellData);

          if (index !== -1) {
            insertACell(table5, idx, cellData, tableColTitle.length);
            nameFindFlag = true;
            return false;
          }

          return true;
        }); // 只有当原数据中找到了才删除现在的数据

        if (nameFindFlag) {
          delTableCell(table2, cell);
        }
      };

      if (cellData !== '') {
        // 触发模态框
        Utils.showModal('modal2', '注意', '是否确认取消' + cellData + '的病房安排', showModalCallback, 'okBtn2');
      }
    });
    $('#datatables5 tbody').on('click', 'td', function () {
      // 获取当前点击的单元格的位置
      var cell = table5.table.cell(this);
      var index = cell.index();
      var cellData = cell.data();
      var title = cell.table().column(index.column).title();

      var showModalCallback = function showModalCallback() {
        delTableCell(table5, cell);
        cellData += '(' + title + ')'; // 获取选择的选项

        var departId = $('#table5Type').val().toString(); // 将数据添加到表格1中并重新绘制
        // 首先获取当前表格有多少行

        var rows_length = table2.table.rows().data().length; // 获取列数据

        var table_col_num = index.column;
        insertACell(table2, departId, cellData, wardColName.length);
      };

      if (cellData !== '') {
        // 触发模态框
        Utils.showModal('modal', '请选择' + cellData + '的病房', "<div class=\"form-group row\">\n                            <label for=\"formType\" class=\"col-sm-3 col-form-label\">\u8EAB\u4EFD</label>\n                            <select class=\"form-control col-sm-7\" id=\"table5Type\">\n                                <option value=\"0\">\u9AA81</option>\n                                <option value=\"1\">\u9AA82</option>\n                                <option value=\"2\">\u9AA83</option>\n                                <option value=\"3\">\u9AA84</option>\n                                <option value=\"4\">\u5C0F\u8F85\u73ED</option>\n                                <option value=\"5\">\u6025\u8BCA\u4E00\u7EBF</option>\n                            </select>\n                        </div>", showModalCallback, 'okBtn');
      }
    });
  }

  function insertACell(table, col, data, titleLen) {
    var colData = table.table.column(col).data().toArray(); // 如果该列最后一行为空则直接添加的空的单元格中

    if (colData.length && colData[colData.length - 1] === '') {
      colData.every(function (val, idx) {
        if (val === '') {
          table.table.cell({
            row: idx,
            column: col
          }).data(data);
          return false;
        } else {
          return true;
        }
      });
    } else {
      // 否则需要新加一行数据
      var tableRowData = Array(titleLen).fill('');
      tableRowData[col] = data;
      table.table.row.add(tableRowData).draw();
    } // 刷新显示


    table.table.draw();
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

    for (var _i3 = 0; _i3 < lstArray.length; _i3++) {
      if (lstArray[_i3] !== '') {
        arrayEmptyFlag = false;
        break;
      }
    }

    if (arrayEmptyFlag) {
      array.pop();
    }

    return array;
  }

  function showTab4Table(data) {
    var wardColName = [{
      title: '日期'
    }, {
      title: '星期'
    }, {
      title: '骨1'
    }, {
      title: '骨2'
    }, {
      title: '骨3'
    }, {
      title: '骨4'
    }, {
      title: '小辅班'
    }, {
      title: '急诊一线'
    }]; // 将列数组转换为行数组

    table4data = [];

    for (var i = 0; i < data[0].length; i++) {
      var tempArray = [];

      for (var j = 0; j < data.length; j++) {
        tempArray.push(data[j][i]);
      } // 若数据长度不足则直接补齐数据


      var lenDiff = wardColName.length - data.length;
      tempArray = tempArray.concat(Array(lenDiff).fill(''));
      table4data.push(tempArray);
    }

    if (table4) {
      table4.clear(); // xlsxDataArray.forEach(v => table3.row.add(v));

      table4.rows.add(table4data).draw();
    } else {
      table4 = $('#datatables4').DataTable({
        searching: false,
        // 禁止搜索
        ordering: false,
        // 禁止排序
        autoWidth: true,
        pagint: false,
        data: table4data,
        columns: wardColName,
        dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
        buttons: [{
          extend: 'excelHtml5',
          filename: '病房排班表',
          title: null
        }]
      });
    }
  }

  $('#finishBtn').click(function () {
    getStatics(table4data);
  });

  function getStatics(array) {
    var wardName = ['骨1', '骨2', '骨3', '骨4', '小辅班', '急诊一线'];
    var nameList = [];
    var weekdayList = [];
    var weekendList = [];
    var weekdayAvr = [];
    var weekendAvr = [];
    var weekdayTotal = 0;
    var weekendTotal = 0; // 初始化二维数组

    for (var i = 0; i < wardName.length; i++) {
      nameList.push(new Array());
      weekdayList.push(new Array());
      weekendList.push(new Array());
      weekdayAvr.push(0);
      weekendAvr.push(0);
    }
    /**
     * 判断当前星期是否是工作日
     * @param  {Number} day 输入星期
     * @return {Boolean} 是否是工作日
     */


    var isWeekday = function isWeekday(day) {
      if (day < 6) {
        return true;
      } else {
        return false;
      }
    };
    /**
     * 计算数组之和函数
     * @param  {Array} arr 输入的数组
     * @return {Number}    输入数组之和
     */


    var getArraySum = function getArraySum(arr) {
      if (arr.length === 0) {
        return 0;
      }

      return arr.reduce(function (total, sum) {
        return total + sum;
      });
    };
    /**
     * 计算数组均值
     * @param  {Array} arr 输入的数组
     * @return {Number}    返回的平均值
     */


    var getArrayAvr = function getArrayAvr(arr) {
      if (arr.length === 0) {
        return 0;
      }

      return getArraySum(arr) / arr.length;
    };
    /**
     * 计算二维数组的均值
     * @param  {Array} arr 输入的二维数组
     * @return {Number}    返回的平均值
     */


    var get2DArrayAvr = function get2DArrayAvr(arr) {
      var sum = 0;
      var length = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          sum += getArraySum(item);
          length += item.length;
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

      if (sum === 0) {
        return 0;
      }

      return sum / length;
    }; // 1.首先计算每个人的统计信息


    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = array[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var item = _step2.value;

        for (var _i6 = 2; _i6 < item.length; _i6++) {
          if (item[_i6] === '') {
            continue;
          }

          var idx = nameList[_i6 - 2].indexOf(item[_i6]);

          if (idx === -1) {
            nameList[_i6 - 2].push(item[_i6]);

            if (isWeekday(item[1])) {
              weekdayList[_i6 - 2].push(1);

              weekendList[_i6 - 2].push(0);
            } else {
              weekdayList[_i6 - 2].push(0);

              weekendList[_i6 - 2].push(1);
            }
          } else {
            if (isWeekday(item[1])) {
              weekdayList[_i6 - 2][idx]++;
            } else {
              weekendList[_i6 - 2][idx]++;
            }
          }
        }
      } // 2.接下来统计每个病房的统计信息

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

    for (var _i4 = 0; _i4 < weekdayList.length; _i4++) {
      weekdayAvr[_i4] = getArrayAvr(weekdayList[_i4]);
      weekendAvr[_i4] = getArrayAvr(weekendList[_i4]);
    } // 3.接下来统计全部病房的统计信息


    weekdayTotal = get2DArrayAvr(weekdayList);
    weekendTotal = get2DArrayAvr(weekendList); // 4.接下来构建Excel数据表

    var sheetNames = wardName.concat('分病房统计');
    var sheets = {}; // 首先处理每个病房的数据

    wardName.forEach(function (item, idx) {
      var temp = [['姓名', '周中班数', '周末班数']];

      for (var _i5 = 0; _i5 < nameList[idx].length; _i5++) {
        temp.push([nameList[idx][_i5], weekdayList[idx][_i5], weekendList[idx][_i5]]);
      }

      sheets[item] = XLSX.utils.aoa_to_sheet(temp);
    }); // 接下来处理总的统计数据

    var totalDataArray = [['病房', '平均周中班数', '平均周末班数']];
    wardName.forEach(function (item, idx) {
      totalDataArray.push([item, weekdayAvr[idx], weekendAvr[idx]]);
    });
    sheets[sheetNames[sheetNames.length - 1]] = XLSX.utils.aoa_to_sheet(totalDataArray); // 5.最后处理排班人员名单

    sheetNames.splice(0, 0, "名单");
    var nameDataArr = [[]]; // 获取表格的所有列标题

    $('#datatables4 thead th').each(function () {
      nameDataArr[0].push($(this).html());
    });
    nameDataArr = nameDataArr.concat(table4.data().toArray());
    sheets[sheetNames[0]] = XLSX.utils.aoa_to_sheet(nameDataArr); // 6.最终输出统计信息

    var wb = {
      SheetNames: sheetNames,
      Sheets: sheets
    };
    XLSX.writeFile(wb, '病房排班统计信息表.xlsx');
  } // 处理数据备份的事情


  var backupInterval = null;

  var BackupSenddata = function BackupSenddata() {
    var jsonData = {
      type: 'depart_bak',
      month: curMonth
    };
    jsonData.crc = CRC.crc32(JSON.stringify(xlsxDataArray)); // jsonData.data = JSON.stringify(xlsxDataArray);

    jsonData.table2 = table2.table.data().toArray();
    jsonData.table5 = table5.table.data().toArray();
    Utils.postJson({
      url: common.backupWard,
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
    backupInterval = null;
    common.showNotification('数据备份已关闭', 'info');
  };

  var BackupGetData = function BackupGetData(callBack) {
    Utils.getJson({
      url: common.backupWard
    }, function (data) {
      if (typeof data == 'String') {
        data = JSON.parse(data);
      }

      if (!data.type || data.type !== 'depart_bak' || parseInt(data.month) !== parseInt(curMonth) || data.crc !== CRC.crc32(JSON.stringify(xlsxDataArray))) {
        common.showNotification('备份数据与当前选项不符', 'warning');
      } else {
        table2.updateData(data.table2);
        table5.updateData(data.table5);
        common.showNotification('数据恢复成功！', 'success');
      } // 开启备份功能


      BackupSetInterval();
    }, function () {
      return common.showNotification('恢复失败，请检查服务器连接！', 'danger');
    });
  };

  $("#saveBtn").click(BackupSenddata);
  $('#addRestData').click(function () {
    var body = "<form>\n                          <div class=\"form-group row\">\n                            <label for=\"formName\" class=\"col-sm-3 col-form-label\">\u59D3\u540D</label>\n                            <input type=\"text\" class=\"form-control col-sm-7\" id=\"formName\">\n                          </div>\n                          <div class=\"form-group row\">\n                            <label for=\"formStart\" class=\"col-sm-3 col-form-label\">\u8D77\u59CB\u65E5\u671F</label>\n                            <input type=\"text\" class=\"form-control col-sm-7\" id=\"formStart\" placeholder=\"1\">\n                          </div>\n                          <div class=\"form-group row\">\n                            <label for=\"formEnd\" class=\"col-sm-3 col-form-label\">\u7ED3\u675F\u65E5\u671F</label>\n                            <input type=\"text\" class=\"form-control col-sm-7\" id=\"formEnd\" placeholder=\"5\">\n                          </div>\n                        </form>";
    Utils.showModal('modal3', '请添加一条请假信息', body, function () {
      var data = [];
      data.push($('#formName').val());
      data.push($('#formStart').val());
      data.push($('#formEnd').val());
      table3.table.row.add(data).draw();
    }, 'okBtn3');
  }); // 处理导航标签相关的事情

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
  }); // 处理页面初始化的相关事务

  page_init();
});