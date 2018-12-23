"use strict";

/*
 * @Author: SHLLL
 * @Date:   2018-09-23 21:32:02
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-24 21:03:44
 */
define(['jquery', 'common', 'xlsx', 'module.datatable', 'module.utils'], function ($, common, XLSX, DataTableModule, Utils) {
  'use strict';

  var dataUrl = common.dataUrl;
  var tableIdx = ['name', 'type', 'remark', 'history', 'month', 'times'];
  var allData = null;
  var table = null;

  function getData() {
    $.ajax({
      type: "GET",
      url: dataUrl,
      dataType: 'json',
      xhrFields: {
        'Access-Control-Allow-Origin': '*'
      }
    }).done(function (data) {
      if (typeof data == 'String') {
        data = JSON.parse(data);
      }

      allData = data;
      freshTable(data.peopledata);
    }).fail(function () {
      return common.showNotification('获取数据失败，请检查服务器连接！', 'danger');
    });
  }

  function convertData2Table(peopledata) {
    // 将Object数据转换为数组数据
    // 对数据进行深拷贝
    console.log('人员数据', peopledata);
    var data = JSON.parse(JSON.stringify(peopledata));
    var dataInRows = [];

    for (var i = 0; i < data.length; i++) {
      var tempArray = []; // 处理人员历史

      var history = '';
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[i].history[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          history += '(';
          history += item.name;
          history += ':';
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = item.month[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var month = _step2.value;
              history += month + ' ';
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

          history += ')';
        } // 如果存储中存在备注则转换到数据存储中

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

      var remark = '';

      if (data[i].remark) {
        remark = data[i].remark;
      } // 将数据存入数组


      tempArray.push(data[i].name);
      tempArray.push(data[i].type);
      tempArray.push(remark);
      tempArray.push(history);
      tempArray.push(data[i].month.toString());
      tempArray.push(data[i].times);
      dataInRows.push(tempArray);
    }

    console.log('表格数据', dataInRows);
    return dataInRows;
  }

  function on_TableDel_Click(event) {
    var rowNum = event.data.rowIndex;
    var rowData = event.data.rowData;
    Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据', function () {
      // 删除指定位置数据
      allData.peopledata.splice(rowNum, 1);
      freshTable(allData.peopledata);
    }, 'okDelRowBtn');
  }

  var TYPE_OPTIONS = [{
    value: "本院住院医",
    display: "本院住院医"
  }, {
    value: "八年制（骨科）",
    display: "八年制（骨科）"
  }, {
    value: "八年制（非骨科）",
    display: "八年制（非骨科）"
  }, {
    value: "研究生（骨科）",
    display: "研究生（骨科）"
  }, {
    value: "研究生（非骨科）",
    display: "研究生（非骨科）"
  }, {
    value: "骨科临博",
    display: "骨科临博"
  }, {
    value: "基地住院医",
    display: "基地住院医"
  }, {
    value: "进修医",
    display: "进修医"
  }, {
    value: "其他",
    display: "其他"
  }];

  function freshTable(data) {
    var tableData = convertData2Table(data);
    table = Utils.getInstance(table, DataTableModule, ['#datatables']);
    table.createTable(tableData, {
      table: {
        autoWidth: true,
        ordering: false,
        data: tableData,
        dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" + "<'row'<'col-md-12'tr>>" + "<'row'<'col-md-5'i><'col-md-7'p>>",
        buttons: [{
          extend: 'excelHtml5',
          filename: '人员信息表',
          title: null
        }],
        columns: [{
          title: '姓名'
        }, {
          title: '类别'
        }, {
          title: '备注'
        }, {
          title: '排班历史'
        }, {
          title: '排班月份'
        }, {
          title: '总排班月份数'
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
            }, on_TableDel_Click);
          }
        }]
      },
      cellEditable: true,
      cellEdit: {
        "columns": [1, 2, 4],
        "onUpdate": tableEditCallback,
        "inputTypes": [{
          "column": 1,
          "type": "list",
          "options": TYPE_OPTIONS
        }]
      }
    });
  }

  getData();
  $('#xslxUpload').change(function () {
    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

    var file = $('#xslxUpload')[0].files[0];
    var reader = new FileReader(); // 设置读取完成回调函数

    reader.onload = function (event) {
      console.log('文件读取完成');
      var data = event.target.result;
      if (!rABS) data = new Uint8Array(data);
      var workbook = XLSX.read(data, {
        type: rABS ? 'binary' : 'array'
      });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      var xlsxData = XLSX.utils.sheet_to_json(worksheet); // 这里将xlsx中的数据转换为一个数组

      var dataArray = [];

      for (var i = 0; i < xlsxData.length; i++) {
        var tempObj = {
          month: []
        }; // 遍历对象的key

        for (var key in xlsxData[i]) {
          var name = xlsxData[i]['姓名'];
          tempObj.name = name;

          if (xlsxData[i][key] === '骨') {
            tempObj.month.push(String(key));
          }
        }

        dataArray.push(tempObj);
      }

      console.log('读取的数据', dataArray); // 发送Ajax请求

      $.ajax({
        type: "POST",
        url: common.uploadUrl,
        data: JSON.stringify(dataArray),
        dataType: 'json',
        xhrFields: {
          'Access-Control-Allow-Origin': '*'
        }
      }).done(function (data) {
        getData();
      }).fail(function () {
        return common.showNotification('数据保存失败，请检查服务器连接！', 'danger');
      });
      ;
    }; // 开始读取文件


    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBufer(file);
    }
  }); // 绑定按键方法

  $('#saveBtn').click(function () {
    $.ajax({
      type: "POST",
      url: dataUrl,
      data: JSON.stringify(allData),
      dataType: 'json',
      xhrFields: {
        'Access-Control-Allow-Origin': '*'
      }
    }).done(function (data) {
      if (typeof data == 'String') {
        data = JSON.parse(data);
      }

      if (data.status === 'ok') {
        common.showNotification('数据保存成功！', 'success');
      }
    }).fail(function () {
      return common.showNotification('数据保存失败，请检查服务器连接！', 'danger');
    });
  });
  $('#delBtn').click(function () {
    Utils.showModal('delModal', '警告', '是否确定删除数据', function () {
      $.ajax({
        type: "GET",
        url: common.clearUrl,
        dataType: 'json',
        xhrFields: {
          'Access-Control-Allow-Origin': '*'
        }
      }).done(function (data) {
        common.showNotification('数据清楚成功', 'success');
        getData();
      }).fail(function () {
        return common.showNotification('请检查服务器连接！', 'danger');
      });
      ;
    }, 'okDelBtn');
  });
  $('#outputBtn').click(function () {
    Utils.showModal('outputModal', '请选择输出的数据', "<select class=\"form-control col-sm-7\" id=\"inputModalType\">\n                    <option value='0'>\u5168\u90E8\u6570\u636E</option>\n                    <option value='1'>\u6309\u7C7B\u522B\u8F93\u51FA</option>\n                </select>", function () {
      var val = $('#inputModalType').val();

      switch (val) {
        case '0':
          // 选项0直接输出数据
          // 直接调用表格实例的Excel输出按钮
          table.table.buttons('.buttons-excel').trigger();
          break;

        case '1':
          // 选项1分类别输出数据
          // 1.首先获取表格标题
          var title = [];
          var header = $('th', table.table.header());

          for (var i = 0; i < header.length - 1; i++) {
            title.push($(header[i]).text());
          } // 2.获取类别数据


          var personType = [];

          for (var _i = 0; _i < TYPE_OPTIONS.length; _i++) {
            var item = TYPE_OPTIONS[_i];
            personType.push(item.value);
          } // 3.根据类别数据的数量及内容构建人员数据容器


          var personDatainType = Array(personType.length + 1);

          for (var _i2 = 0; _i2 < personDatainType.length; _i2++) {
            personDatainType[_i2] = [title];
          }

          var personData = table.table.data().toArray();
          personData.forEach(function (item) {
            var idx = personType.indexOf(item[1]);

            if (idx !== -1) {
              personDatainType[idx].push(item);
            } else {
              personDatainType[personDatainType.length - 1].push(item);
            }
          }); // 4.从生成的数据中生成Excel文件

          personType.push('未分类');
          var sheets = {};
          personType.forEach(function (item, idx) {
            sheets[item] = XLSX.utils.aoa_to_sheet(personDatainType[idx]);
          });
          var wb = {
            SheetNames: personType,
            Sheets: sheets
          };
          XLSX.writeFile(wb, '人员信息表_按类型分.xlsx');
      }
    }, 'outputModalBtn');
  });

  function tableEditCallback(updatedCell, updatedRow, oldValue) {
    var val = updatedCell.data();

    if (val === oldValue) {
      return;
    } // 获取单元格对应的列号


    var col = updatedCell.index().column;
    var col_name = tableIdx[col];
    var row = updatedCell.index().row;

    if (col === 4) {
      // 将字符串转化为数组
      val = val.split(',');
      val = val.map(function (item) {
        if (typeof item === 'number') {
          return item.toString();
        } else {
          return item;
        }
      }); // 同步更新times单元格

      updatedCell.table().cell({
        row: row,
        column: 5
      }).data(val.length).draw();
      allData.peopledata[row]['times'] = val.length;
    }

    allData.peopledata[row][col_name] = val;
  } // 处理添加人员数据的弹出模态框


  $('#addBtn').click(function () {
    // 显示模态框
    $('#mymodal').modal();
  });
  $('#formNxtBtn').click(function () {
    ModalCallback();
  });
  $('#formOkBtn').click(function () {
    ModalCallback();
    $('#mymodal').modal('hide');
  });
  /**
   * 人员数据模态框回调函数
   */

  function ModalCallback() {
    var name = $('#formName').val();
    var type = $('#formType').val();
    var remark = $('#formRemark').val();
    var month = $('#formMonth').val();
    var history = $('#formHistory').val(); // 根据name去重

    var nameList = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = allData.peopledata[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var item = _step3.value;
        nameList.push(item.name);
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

    if (nameList.indexOf(name) !== -1) {
      alert('该人已存在于数据库中');
      return;
    } // 按逗号分割月份


    month = month.split(','); // 将字符串转换为Int

    month = month.map(function (item) {
      if (typeof item === 'number') {
        return item.toString();
      } else {
        return item;
      }
    }); // 根据人员数据构建一个Object

    var personData = {
      name: name,
      month: month,
      times: month.length,
      type: type,
      remark: remark,
      history: []
    };
    allData.peopledata.unshift(personData);
    freshTable(allData.peopledata);
  }
});