/*
 * @Author: SHLLL
 * @Date:   2018-09-23 21:32:02
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2019-09-18 18:40:34
 */
define(['jquery', 'common', 'xlsx', 'module.datatable', 'module.utils'],
    function ($, common, XLSX, DataTableModule, Utils) {
        'use strict';
        const dataUrl = common.dataUrl;
        const tableIdx = ['name', 'type', 'remark', 'history', 'month', 'times'];
        let allData = null;
        let table = null;

        function getData() {
            $.ajax({
                type: "GET",
                url: dataUrl,
                dataType: 'json',
                xhrFields: { 'Access-Control-Allow-Origin': '*' }
            }).done(data => {
                if (typeof (data) == 'String') {
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

                // 处理人员历史
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

                // 如果存储中存在备注则转换到数据存储中
                let remark = '';
                if (data[i].remark) {
                    remark = data[i].remark;
                }

                // 将数据存入数组
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
            let rowNum = event.data.rowIndex;
            let rowData = event.data.rowData;
            Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据',
                () => {
                    // 删除指定位置数据
                    allData.peopledata.splice(rowNum, 1);
                    freshTable(allData.peopledata);
                },
                'okDelRowBtn'
            );
        }

        const TYPE_OPTIONS = [{
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
            value: "进修医",
            display: "进修医"
        },
        {
            value: "其他",
            display: "其他"
        }
        ];

        function freshTable(data) {
            let tableData = convertData2Table(data);

            table = Utils.getInstance(table, DataTableModule, ['#datatables']);
            table.createTable(
                tableData, {
                    table: {
                        autoWidth: true,
                        ordering: false,
                        data: tableData,
                        dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" +
                            "<'row'<'col-md-12'tr>>" +
                            "<'row'<'col-md-5'i><'col-md-7'p>>",
                        buttons: [{
                            extend: 'excelHtml5',
                            filename: '人员信息表',
                            title: null,
                        }],
                        columns: [
                            { title: '姓名' },
                            { title: '类别' },
                            { title: '备注' },
                            { title: '排班历史' },
                            { title: '排班月份' },
                            { title: '总排班月份数' },
                            {
                                name: "control",
                                searchable: false,
                                title: "操作",
                                orderable: false,
                                defaultContent: `<input type="button" value="❌" style="border-style: none;background: inherit;">`,
                                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                                    $(cell).on("click", "input", { rowIndex: rowIndex, rowData: rowData },
                                        on_TableDel_Click);
                                }
                            }
                        ]
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

                // 这里将xlsx中的数据转换为一个数组
                let dataArray = [];
                for (let sheet_name of workbook.SheetNames) {
                    let worksheet = workbook.Sheets[sheet_name];
                    let xlsxData = XLSX.utils.sheet_to_json(worksheet);

                    for (let i = 0; i < xlsxData.length; i++) {
                        let tempObj = {};
                        tempObj.name = xlsxData[i]['姓名'];
                        tempObj.type = xlsxData[i]['类别'];
                        tempObj.remark = xlsxData[i]['备注'];

                        if (xlsxData[i]['排班历史']) {
                            tempObj.history = xlsxData[i]['排班历史'];
                        } else {
                             tempObj.history = "";
                        }
                        tempObj.month = xlsxData[i]['排班月份'];

                        dataArray.push(tempObj);
                    }
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
                if (typeof (data) == 'String') {
                    data = JSON.parse(data);
                }
                if (data.status === 'ok') {
                    common.showNotification('数据保存成功！', 'success');
                }
            }).fail(() => common.showNotification('数据保存失败，请检查服务器连接！', 'danger'));
        });

        $('#delBtn').click(() => {
            Utils.showModal('delModal', '警告', '是否确定删除数据',
                () => {
                    $.ajax({
                        type: "GET",
                        url: common.clearUrl,
                        dataType: 'json',
                        xhrFields: { 'Access-Control-Allow-Origin': '*' }
                    }).done(data => {
                        common.showNotification('数据清楚成功', 'success');
                        getData();
                    }).fail(() => common.showNotification('请检查服务器连接！', 'danger'));;
                },
                'okDelBtn'
            );
        });

        $('#outputBtn').click(() => {
            Utils.showModal('outputModal', '请选择输出的数据',
                `<select class="form-control col-sm-7" id="inputModalType">
                    <option value='0'>全部数据</option>
                    <option value='1'>按类别输出</option>
                </select>`,
                () => {
                    let val = $('#inputModalType').val();
                    switch (val) {
                        case '0': // 选项0直接输出数据
                            // 直接调用表格实例的Excel输出按钮
                            table.table.buttons('.buttons-excel').trigger();
                            break;
                        case '1': // 选项1分类别输出数据
                            // 1.首先获取表格标题
                            let title = [];
                            let header = $('th', table.table.header());
                            for (let i = 0; i < header.length - 1; i++) {
                                title.push($(header[i]).text());
                            }

                            // 2.获取类别数据
                            let personType = [];
                            for (let item of TYPE_OPTIONS) {
                                personType.push(item.value);
                            }

                            // 3.根据类别数据的数量及内容构建人员数据容器
                            let personDatainType = Array(personType.length + 1);
                            for (let i = 0; i < personDatainType.length; i++) {
                                personDatainType[i] = [title];
                            }

                            let personData = table.table.data().toArray();
                            personData.forEach((item) => {
                                let idx = personType.indexOf(item[1]);
                                if (idx !== -1) {
                                    personDatainType[idx].push(item);
                                } else {
                                    personDatainType[personDatainType.length - 1].push(item);
                                }
                            });

                            // 4.从生成的数据中生成Excel文件
                            personType.push('未分类');
                            let sheets = {};
                            personType.forEach((item, idx) => {
                                sheets[item] = XLSX.utils.aoa_to_sheet(personDatainType[idx]);
                            });
                            let wb = {
                                SheetNames: personType,
                                Sheets: sheets
                            };
                            XLSX.writeFile(wb, '人员信息表_按类型分.xlsx');
                    }
                }, 'outputModalBtn');
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

            if (col === 4) {
                // 将字符串转化为数组
                val = val.split(',');
                val = val.map(item => {
                    if (typeof item === 'number') {
                        return item.toString();
                    } else {
                        return item;
                    }
                });

                // 同步更新times单元格
                updatedCell.table().cell({ row: row, column: 5 }).data(val.length).draw();
                allData.peopledata[row]['times'] = val.length;
            }

            allData.peopledata[row][col_name] = val;
        }

        // 处理添加人员数据的弹出模态框
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
        /**
         * 人员数据模态框回调函数
         */
        function ModalCallback() {
            let name = $('#formName').val();
            let type = $('#formType').val();
            let remark = $('#formRemark').val();
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
                if (typeof item === 'number') {
                    return item.toString();
                } else {
                    return item;
                }
            });
            // 根据人员数据构建一个Object
            let personData = {
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
