/*
 * @Author: SHLLL
 * @Date:   2018-09-23 21:32:02
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-10 19:24:34
 */
define(['jquery', 'common', 'xlsx', 'module.datatable', 'module.utils'], function($, common, XLSX, DataTableModule, Utils) {
    'use strict';
    const dataUrl = common.dataUrl;
    const tableIdx = ['name', 'type', 'history', 'month', 'times'];
    let allData = null;
    let table = null;

    function getData() {
        $.ajax({
            type: "GET",
            url: dataUrl,
            dataType: 'json',
            xhrFields: { 'Access-Control-Allow-Origin': '*' }
        }).done(data => {
            if (typeof(data) == 'String') {
                data = JSON.parse(data);
            }
            allData = data;
            freshTable(data.peopledata);
        }).fail(() => common.showNotification('获取数据失败，请检查服务器连接！', 'danger'));
    }

    function convertData2Table(peopledata) {
        // 将Object数据转换为数组数据
        // 对数据进行深拷贝
        console.log('人员数据', peopledata);
        let data = JSON.parse(JSON.stringify(peopledata));

        let dataInRows = [];
        for (let i = 0; i < data.length; i++) {
            let tempArray = [];
            tempArray.push(data[i].name);
            tempArray.push(data[i].type);
            let history = '';
            for (let item of data[i].history) {
                history += '(';
                history += item.name;
                history += ':';
                for (let month of item.month) {
                    history += month + ' ';
                }
                history += ')';
            }
            tempArray.push(history);
            tempArray.push(data[i].month.toString());
            tempArray.push(data[i].times);
            dataInRows.push(tempArray);
        }
        console.log('表格数据', dataInRows);
        return dataInRows;
    }

    function freshTable(data) {
        let tableData = convertData2Table(data);

        table = Utils.getInstance(table, DataTableModule, ['#datatables']);
        table.createTable(
            tableData,
            {
                table: {
                    autoWidth: true,
                    ordering: false,
                    data: tableData,
                    dom: 'Blfrtip',
                    buttons: [{
                        extend: 'excelHtml5',
                        filename: '人员信息表'
                    }],
                    columns: [
                        { title: '姓名' },
                        { title: '类别' },
                        { title: '排班历史' },
                        { title: '排班月份' },
                        { title: '总排班月份数' }
                    ]
                },
                cellEditable: true,
                cellEdit: {
                    "columns": [1, 3],
                    "onUpdate": tableEditCallback,
                    "inputTypes": [{
                        "column": 1,
                        "type": "list",
                        "options": [{
                                value: "本院住院医",
                                display: "本院住院医"
                            },
                            {
                                value: "八年制（骨科）",
                                display: "八年制（骨科）"
                            },
                            {
                                value: "八年制（非骨科）",
                                display: "八年制（非骨科）"
                            },
                            {
                                value: "研究生（骨科）",
                                display: "研究生（骨科）"
                            },
                            {
                                value: "研究生（非骨科）",
                                display: "研究生（非骨科）"
                            },
                            {
                                value: "骨科临博",
                                display: "骨科临博"
                            },
                            {
                                value: "基地住院医",
                                display: "基地住院医"
                            },
                            {
                                value: "其他",
                                display: "其他"
                            }
                        ]
                    }]
                }
            }
        );
    }

    getData();

    $('#xslxUpload').change(() => {
        const rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
        const file = $('#xslxUpload')[0].files[0];
        const reader = new FileReader();
        // 设置读取完成回调函数
        reader.onload = (event) => {
            console.log('文件读取完成');
            let data = event.target.result;
            if (!rABS) data = new Uint8Array(data);
            let workbook = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
            let first_sheet_name = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[first_sheet_name];
            let xlsxData = XLSX.utils.sheet_to_json(worksheet);

            // 这里将xlsx中的数据转换为一个数组
            let dataArray = [];
            for (let i = 0; i < xlsxData.length; i++) {
                let tempObj = { month: [] };
                // 遍历对象的key
                for (let key in xlsxData[i]) {
                    let name = xlsxData[i]['姓名'];
                    tempObj.name = name;
                    if (xlsxData[i][key] === '骨') {
                        tempObj.month.push(String(key));
                    }
                }
                dataArray.push(tempObj);
            }
            console.log('读取的数据', dataArray);

            // 发送Ajax请求
            $.ajax({
                type: "POST",
                url: common.uploadUrl,
                data: JSON.stringify(dataArray),
                dataType: 'json',
                xhrFields: { 'Access-Control-Allow-Origin': '*' }
            }).done(data => {
                getData();
            }).fail(() => common.showNotification('数据保存失败，请检查服务器连接！', 'danger'));;
        };
        // 开始读取文件
        if (rABS) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBufer(file);
        }
    });

    // 绑定按键方法
    $('#saveBtn').click(() => {
        $.ajax({
            type: "POST",
            url: dataUrl,
            data: JSON.stringify(allData),
            dataType: 'json',
            xhrFields: { 'Access-Control-Allow-Origin': '*' }
        }).done(data => {
            if (typeof(data) == 'String') {
                data = JSON.parse(data);
            }
            if (data.status === 'ok') {
                common.showNotification('数据保存成功！', 'success');
            }
        }).fail(() => common.showNotification('数据保存失败，请检查服务器连接！', 'danger'));
    });

    $('#delBtn').click(() => {
        $.ajax({
            type: "GET",
            url: common.clearUrl,
            dataType: 'json',
            xhrFields: { 'Access-Control-Allow-Origin': '*' }
        }).done(data => {
            common.showNotification('数据清楚成功', 'success');
            getData();
        }).fail(() => common.showNotification('请检查服务器连接！', 'danger'));;
    });

    function tableEditCallback(updatedCell, updatedRow, oldValue) {
        let val = updatedCell.data();
        if (val === oldValue) {
            return;
        }
        // 获取单元格对应的列号
        let col = updatedCell.index().column;
        let col_name = tableIdx[col];
        let row = updatedCell.index().row;

        if (col === 3) {
            // 将字符串转化为数组
            val = val.split(',');
            val = val.map(item => {
                return parseInt(item);
            });
            // 同步更新times单元格
            updatedCell.table().cell({ row: row, column: 4 }).data(val.length).draw();
            allData.peopledata[row]['times'] = val.length;
        }

        allData.peopledata[row][col_name] = val;
    }

    $('#addBtn').click(() => {
        // 显示模态框
        $('#mymodal').modal();
    });

    $('#formNxtBtn').click(() => {
        ModalCallback();
    });

    $('#formOkBtn').click(() => {
        ModalCallback();
        $('#mymodal').modal('hide');
    });


    function ModalCallback() {
        let name = $('#formName').val();
        let type = $('#formType').val();
        let month = $('#formMonth').val();
        let history = $('#formHistory').val();

        // 根据name去重
        let nameList = [];
        for (let item of allData.peopledata) {
            nameList.push(item.name);
        }
        if (nameList.indexOf(name) !== -1) {
            alert('该人已存在于数据库中');
            return;
        }

        // 按逗号分割月份
        month = month.split(',');
        // 将字符串转换为Int
        month = month.map(item => {
            return parseInt(item);
        });
        // 根据人员数据构建一个Object
        let personData = {
            name: name,
            month: month,
            times: month.length,
            type: type,
            history: []
        };

        allData.peopledata.unshift(personData);
        freshTable(allData.peopledata);
    }
});
