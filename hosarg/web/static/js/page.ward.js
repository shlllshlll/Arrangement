/*
 * @Author: SHLLL
 * @Date:   2018-09-24 15:55:57
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-11 13:09:02
 */
define(['jquery', 'xlsx', 'common', 'module.datatable', 'module.utils'],
    function($, XLSX, common, DataTableModule, Utils) {
        'use strict';
        let table = null;
        let table2 = null;
        let table3 = null;
        let table4 = null;
        let table5 = null;
        let slicedata = null;
        let xlsxDataArrayInCol = [];
        let xlsxTitleArray = [];
        let tableColTitle = [];
        let xlsxDataArray = [];

        // 处理Tab1的文件上传按钮
        $('#xslxUpload').change(() => {
            const rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
            const file = $('#xslxUpload')[0].files[0];
            const reader = new FileReader();
            // 设置读取完成回调函数
            reader.onload = (event) => {
                let data = event.target.result;
                if (!rABS) data = new Uint8Array(data);
                let workbook = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
                let first_sheet_name = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[first_sheet_name];
                let xlsxData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 转换为行数组
                // 获取数据表的行数和列数
                const rowNum = xlsxData.length;
                const colNum = xlsxData[0].length;
                xlsxTitleArray = [];
                for (let key in xlsxData[0]) {
                    xlsxTitleArray[parseInt(key)] = xlsxData[0][key];
                }

                xlsxDataArray = [];
                for (let i = 1; i < rowNum; i++) {
                    // 数组初始化
                    let tempArray = [];
                    for (let n = 0; n < colNum; n++) {
                        tempArray[n] = '';
                    }

                    for (let key in xlsxData[i]) {
                        tempArray[parseInt(key)] = xlsxData[i][key];
                    }
                    xlsxDataArray.push(tempArray);
                }

                // 转换为列数组
                xlsxDataArrayInCol = [];
                // 首先遍历每一列数组
                for (let i = 0; i < xlsxDataArray[0].length; i++) {
                    let tempArray = [];
                    for (let n = 0; n < xlsxDataArray.length; n++) {
                        let item = xlsxDataArray[n][i];
                        if (item) {
                            tempArray.push(item);
                        }
                    }
                    xlsxDataArrayInCol.push(tempArray);
                }

                tableColTitle = [];
                xlsxTitleArray.forEach(v => tableColTitle.push({ title: v }));
                // 获取DataTableModule类实例
                table = table ? table : (new DataTableModule('#datatables'));
                table.createTable(xlsxDataArray, {
                    table: {
                        searching: false, // 禁止搜索
                        ordering: false, // 禁止排序
                        autoWidth: true,
                        columns: tableColTitle
                    }
                });
            };
            // 开始读取文件
            if (rABS) {
                reader.readAsBinaryString(file);
            } else {
                reader.readAsArrayBufer(file);
            }
        });

        // 处理激活各个Tab的事件
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            let tarTab = $(e.target).attr('aria-controls');
            tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
            let lstTab = $(e.relatedTarget).attr('aria-controls');
            lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

            if (tarTab === 1) {
                $('#title h3').text('选择科室排班文件');
                $('#title p').text('选择输入的科室排班文件数据，用于后续的病房排班');
            } else if (tarTab === 2) {
                $('#title h3').text('编辑科室排班数据');
                $('#title p').text('通过编辑下面的表格中的人员名单来更新人员名单数据');

                if (!xlsxDataArrayInCol.length) {
                    return;
                }

                if (!slicedata) {
                    let postDepartData = {
                        title: xlsxTitleArray,
                        data: xlsxDataArrayInCol,
                        month: $('#fileMonth').val()
                    };
                    console.log(postDepartData);
                    Utils.postJson({
                        url: common.departUrl,
                        data: JSON.stringify(postDepartData)
                    }, data => {
                        if (typeof(data) == 'String') {
                            data = JSON.parse(data);
                        }
                        slicedata = data;
                        showTab2Table();
                        // showTab2Table(slicedata);
                    }, () => common.showNotification('数据保存失败，请检查服务器连接！', 'danger'));
                } else {
                    showTab2Table();
                    // showTab2Table(slicedata);
                }
            } else if (tarTab === 3) {
                $('#title h3').text('日期及休假设置');
                $('#title p').text('在下面的表单中填写日期和人员的请假信息');

                const rowData = ['', '', ''];
                let data = [rowData];
                let title = [
                    { title: '姓名' },
                    { title: '起始日期' },
                    { title: '结束日期' }
                ];
                // 获取DataTableModule类实例
                table3 = table3 ? table3 : (new DataTableModule('#datatables3'));
                table3.createTable(data, {
                    table: {
                        searching: false, // 禁止搜索
                        ordering: false, // 禁止排序
                        autoWidth: true,
                        paging: false,
                        info: false,
                        columns: title
                    },
                    cellEditable: true,
                    cellEdit: {
                        "onUpdate": table3EditCallback
                    }
                });
                // showTab3Table(title, data);
            } else if (tarTab === 4) {
                // 如果从标签3切换到标签4
                if (lstTab === 3) {
                    let month = $('#month').val();
                    let startday = $('#startday').val();
                    let endday = $('#endday').val();
                    let data = $('#datatables3').dataTable().api().data();
                    let dataArray = [];
                    for (let i = 0; i < data.length; i++) {
                        let tempArray = data[i];
                        let tempObj = {};
                        let idx = tempArray.indexOf('');
                        if (idx !== -1) {
                            continue;
                        }
                        tempObj.name = tempArray[0];
                        tempObj.start = tempArray[1];
                        tempObj.end = tempArray[2];
                        dataArray.push(tempObj);
                    }
                    let dataJson = {
                        month: month,
                        startday: startday,
                        endday: endday,
                        data: dataArray
                    };

                    // 准备人员数据
                    let sliceDataArray = [];
                    let tableData = table2.table.columns().data();
                    for (let i = 0; i < tableData.length; i++) {
                        let colData = tableData[i];
                        // 去除数据中的空元素
                        colData.remove('');
                        if (colData.length > 0) {
                            sliceDataArray.push(colData);
                        }
                    }

                    let data_all = { range: dataJson, people: sliceDataArray };
                    console.log('全部人员数据', data_all);
                    $.ajax({
                        type: "POST",
                        url: common.wardUrl,
                        data: JSON.stringify(data_all),
                        dataType: 'json',
                        xhrFields: { 'Access-Control-Allow-Origin': '*' }
                    }).done(data => {
                        if (typeof(data) == 'String') {
                            data = JSON.parse(data);
                        }
                        showTab4Table(data);

                    }).fail(() => common.showNotification('数据保存失败，请检查服务器连接！', 'danger'));
                }
                $('#title h3').text('排班结果输出');
                $('#title p').text('下面的表格输出了最终的病房排班结果，可以使用到处按钮到处文件');
            }
        });


        function showTab2Table(data) {
            const wardColName = [
                { title: '骨1' },
                { title: '骨2' },
                { title: '骨3' },
                { title: '骨4' },
                { title: '小辅班' },
                { title: '急诊一线' }
            ];

            table2 = Utils.getInstance(table2, DataTableModule, ['#datatables2']);
            table2.createTable([], {
                table: {
                    ordering: false, // 禁止排序
                    autoWidth: true, // 自动宽度
                    columns: wardColName
                }
            });

            // 获取DataTableModule类实例
            table5 = table5 ? table5 : (new DataTableModule('#datatables5'));
            table5.createTable(xlsxDataArray, {
                table: {
                    searching: false, // 禁止搜索
                    ordering: false, // 禁止排序
                    autoWidth: true,
                    columns: tableColTitle
                }
            });

            $('#datatables5 tbody').on('click', 'td', function() {
                // 获取当前点击的单元格的位置
                let cell = table5.table.cell(this);
                let index = cell.index();
                let cellData = cell.data();

                let showModalCallback = () => {
                    // 清空当前cell的数据
                    cell.data('');
                    // 重新绘制表格
                    table2.table.draw();

                    // 获取选择的选项
                    let departId = $('#table5Type').val().toString();
                    console.log(departId);

                    // 将数据添加到表格1中并重新绘制
                    // 首先获取当前表格有多少行
                    let rows_length = table2.table.rows().data().length;
                    // 获取列数据
                    const table_col_num = index.column;
                    let colData = table2.table.column(departId).data().toArray();
                    // 如果该列最后一行为空则直接添加的空的单元格中
                    if (colData.length && colData[colData.length - 1] === '') {
                        colData.every((val, idx) => {
                            if (val === '') {
                                table2.table.cell({ row: idx, column: departId }).data(cellData);
                                return false;
                            } else {
                                return true;
                            }
                        });
                    } else { // 否则需要新加一行数据
                        let tableRowData = Array(wardColName.length).fill('');
                        tableRowData[departId] = cellData;
                        table2.table.row.add(tableRowData).draw();
                    }
                    // 刷新显示
                    table2.table.draw();
                };

                if (cellData !== '') {
                    // 触发模态框
                    Utils.showModal('modal', '请选择' + cellData + '的病房',
                        `<div class="form-group row">
                            <label for="formType" class="col-sm-3 col-form-label">身份</label>
                            <select class="form-control col-sm-7" id="table5Type">
                                <option value="0">骨1</option>
                                <option value="1">骨2</option>
                                <option value="2">骨3</option>
                                <option value="3">骨4</option>
                                <option value="4">小辅班</option>
                                <option value="5">急诊一线</option>
                            </select>
                        </div>`,
                        showModalCallback
                    );
                }
            });
        }

        // function showTab2Table(data) {
        //     const wardColName = [
        //         { title: '骨1' },
        //         { title: '骨2' },
        //         { title: '骨3' },
        //         { title: '骨4' },
        //         { title: '小辅班' },
        //         { title: '急诊一线' }
        //     ];

        //     // 这里求出最大行数
        //     let maxRows = 0;
        //     for (let i = 0; i < data.length; i++) {
        //         if (data[i].length > maxRows) {
        //             maxRows = data[i].length;
        //         }
        //     }

        //     // 将列数组转换为行数组
        //     let dataInRows = [];
        //     for (let i = 0; i < maxRows; i++) {
        //         let tempArray = [];
        //         for (let j = 0; j < data.length; j++) {
        //             let temp = data[j][i] ? data[j][i] : '';
        //             temp = temp.replace('*', '').replace('#', '').replace('^', '');
        //             tempArray.push(temp);
        //         }
        //         tempArray.push('');
        //         tempArray.push('');
        //         dataInRows.push(tempArray);
        //     }

        //     // 获取DataTableModule类实例
        //     table2 = table2 ? table2 : (new DataTableModule('#datatables2'));
        //     table2.createTable(dataInRows, {
        //         table: {
        //             searching: false, // 禁止搜索
        //             ordering: false, // 禁止排序
        //             autoWidth: true,
        //             columns: wardColName
        //         },
        //         cellEditable: true,
        //         cellEdit: {
        //             "onUpdate": table2EditCallback
        //         }
        //     });
        // }

        function showTab3Table(title, data) {
            if (table3) {
                // table3.clear();
                // table3.rows.add(data).draw();

            } else {
                table3 = $('#datatables3').DataTable({
                    searching: false, // 禁止搜索
                    ordering: false, // 禁止排序
                    autoWidth: true,
                    paging: false,
                    info: false,
                    data: data,
                    columns: title
                });
                table3.MakeCellsEditable({
                    "onUpdate": table3EditCallback
                });
            }
        }

        function table3EditCallback(updatedCell, updatedRow, oldValue) {
            // 如果当前值没有变就直接返回
            let val = updatedCell.data();
            if (val === oldValue) {
                return;
            }

            let cur_row = updatedCell.index().row;
            let table = updatedCell.table();
            // 获取当前行的数据
            let row_data = updatedCell.row(cur_row).data();

            // 保证当前行的每一个单元格被填满
            for (let i = 0; i < row_data.length; i++) {
                if (!row_data[i]) {
                    return;
                }
            };
            table.row.add(['', '', '']).draw;
        }

        function showTab4Table(data) {
            const wardColName = [
                { title: '日期' },
                { title: '骨1' },
                { title: '骨2' },
                { title: '骨3' },
                { title: '骨4' },
                { title: '小辅班' },
                { title: '急诊一线' }
            ];

            // 将列数组转换为行数组
            let dataInRows = [];
            for (let i = 0; i < data[0].length; i++) {
                let tempArray = [];
                for (let j = 0; j < data.length; j++) {
                    tempArray.push(data[j][i]);
                }

                // 若数据长度不足则直接补齐数据
                let lenDiff = wardColName.length - data.length;
                tempArray = tempArray.concat(Array(lenDiff).fill(''));

                dataInRows.push(tempArray);
            }


            if (table4) {
                table4.clear();
                // xlsxDataArray.forEach(v => table3.row.add(v));
                table4.rows.add(dataInRows).draw();

            } else {
                table4 = $('#datatables4').DataTable({
                    searching: false, // 禁止搜索
                    ordering: false, // 禁止排序
                    autoWidth: true,
                    data: dataInRows,
                    columns: wardColName,
                    dom: 'Blfrtip',
                    buttons: [{
                        extend: 'excelHtml5',
                        filename: '病房排班表'
                    }]
                });
            }
        }

        function table2EditCallback(updatedCell, updatedRow, oldValue) {
            let val = updatedCell.data();
            if (val === oldValue) {
                return;
            }
            // 获取单元格对应的列号
            let cur_col = updatedCell.index().column;
            let cur_row = updatedCell.index().row;
            // 获取当前表格实例
            let table = updatedCell.table();
            // 获取指定值的cells
            let cells_pos = table.cells((idx, data, node) => {
                return (data === val);
            })[0];
            // 如果匹配到多于俩个人
            if (cells_pos.length > 1) {
                cells_pos.forEach(val => {
                    if (val.row !== cur_row || val.column !== cur_col) {
                        table.cell(val.row, val.column).data('');
                    }
                });
            }
        }

        // 处理导航标签相关的事情
        const tabCount = parseInt($('#mytab li:last-child a')
            .attr('aria-controls').replace(/[^0-9]/ig, ""));
        $('#nextBtn').click(() => {
            let curTab = $('.nav-link.active').attr('aria-controls');
            curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
            let nxtTab = curTab >= tabCount ? curTab : curTab + 1;
            $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
        });
        $('#backBtn').click(() => {
            let curTab = $('.nav-link.active').attr('aria-controls');
            curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
            let nxtTab = curTab > 1 ? curTab - 1 : curTab;
            $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
        });
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            let tarTab = $(e.target).attr('aria-controls');
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
        });
    });
