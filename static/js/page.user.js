/*
 * @Author: SHLLL
 * @Date:   2018-09-23 21:32:02
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-07 21:30:38
 */
define(['jquery', 'common', 'xlsx', 'datatables'], function($, common, XLSX) {
    'use strict';
    const dataUrl = common.dataUrl;
    const tableIdx = ['id', 'name', 'history', 'month'];
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

            // 对数据进行深拷贝
            let peopledata = JSON.parse(JSON.stringify(data.peopledata));
            // console.log(peopledata);
            // 将数据中的数组转换为字符串
            for (let i = 0; i < peopledata.length; i++) {
                peopledata[i].history = peopledata[i].history.toString();
                peopledata[i].month = peopledata[i].month.toString();
            }
            let dataInRows = [];
            for (let i = 0; i < peopledata.length; i++) {
                let tempArray = [];
                tempArray.push(peopledata[i].id);
                tempArray.push(peopledata[i].name);
                tempArray.push(peopledata[i].history);
                tempArray.push(peopledata[i].month);
                dataInRows.push(tempArray);
            }

            freshTable(dataInRows);
        }).fail(() => common.showNotification('获取数据失败，请检查服务器连接！', 'danger'));
    }

    function freshTable(data) {
        if (table) {
            table.clear();
            table.rows.add(data).draw();
        } else {
            table = $('#datatables').DataTable({
                "autoWidth": true,
                data: data,
                columns: [
                    { title: 'ID' },
                    { title: '姓名' },
                    { title: '排班历史' },
                    { title: '排班月份' }
                ]
            });

            table.MakeCellsEditable({
                "columns": [1, 2, 3],
                "onUpdate": tableEditCallback
            });
        }
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
        if (col >= 2) {
            // 将字符串转化为数组
            val = val.split(',');
        }

        if (col === 2) {
            val = val.map(item => {
                return parseInt(item);
            });
        }

        console.log(val, col);
        allData.peopledata[row][col_name] = val;
    }

});
