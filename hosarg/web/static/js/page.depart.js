/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-13 16:16:14
 */
define(['jquery', 'common', 'module.utils', 'module.datatable', 'FileSaver'],
    function($, common, Utils, DatatableModule, FileSaver) {
        'use strict';
        let tableInited = false;
        let table = null,
            table2 = null,
            table3 = null;
        let curMonth = '1810';
        let peopleCurData = [];

        // 处理标签页相关的事物
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            let tarTab = $(e.target).attr('aria-controls');
            tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
            let lstTab = $(e.relatedTarget).attr('aria-controls');
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

        function showTab2(month) {
            Utils.getJson({ url: common.dataUrl },
                data => {
                    if (typeof(data) == 'String') {
                        data = JSON.parse(data);
                    }
                    console.log(data);

                    // 这里存储了当月需要分组的每个人的信息
                    let peopleCurMonth = [];
                    for (let person of data.peopledata) {
                        // 找出指定月份需要分组的人员
                        if (person.month.indexOf(month) !== -1) {
                            peopleCurMonth.push(person);
                        }
                    }

                    // 构建一个科室名的列标题
                    let departCols = [];
                    for (let key in data.departid) {
                        departCols.push({ title: data.departid[key] });
                    }

                    // 首先创建第一个科室分组名单数据表
                    let tableCols = [
                        ...departCols
                    ];
                    table = Utils.getInstance(table, DatatableModule, ['#datatables']);
                    table.createTable([], {
                        table: {
                            ordering: false,
                            columns: tableCols,
                            dom: 'Blfrtip',
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '科室分组表',
                                title: null
                            }]
                        },
                    });

                    // 接下来创建第二个待分配人员名单数据表
                    // 准备列标题
                    let peopleCols = [
                        { title: '姓名' },
                        { title: '类别' },
                        ...departCols
                    ];
                    // 准备表格数据
                    peopleCurData = [];
                    for (let person of peopleCurMonth) {
                        let temp = Array(peopleCols.length).fill('');
                        temp[0] = person.name;
                        temp[1] = person.type;
                        for (let item of person.history) {
                            temp[item.id + 1] = item.month.toString();
                        }
                        peopleCurData.push(temp);
                    }

                    table2 = Utils.getInstance(table2, DatatableModule, ['#datatables2']);
                    table2.createTable(peopleCurData, {
                        table: {
                            ordering: false, // 禁止排序
                            autoWidth: true, // 自动宽度
                            columns: peopleCols,
                            dom: 'Blfrtip',
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '带分组人员名单',
                                title: null
                            }]
                        }
                    });
                    // 为表格1创建点击事件
                    $('#datatables tbody').on('click', 'td', function() {
                        // 如果数组为空则直接退出程序
                        if (table.table.data().toArray().length === 0) {
                            return;
                        }

                        // 获取当前点击的单元格的位置
                        let cell = table.table.cell(this);
                        let index = cell.index();
                        let cellData = cell.data();

                        const showModalCallback = () => {
                            // 获取当前表格的全部数据
                            let allData = table.table.data().toArray();

                            // 重新调整表格数据
                            // 如果操作的是最后一行数据
                            if (index.row === allData.length - 1) {
                                allData[index.row][index.column] = '';
                            } else {
                                for (let i = index.row + 1; i < allData.length; i++) {
                                    if (allData[i][index.column] === '') {
                                        break;
                                    }

                                    // 向上迁移数据
                                    allData[i - 1][index.column] = allData[i][index.column];
                                    allData[i][index.column] = '';
                                }
                            }
                            // 判断最后一行是否为全空
                            let lstArray = allData[allData.length - 1];
                            let arrayEmptyFlag = true;
                            for (let i = 0; i < lstArray.length; i++) {
                                if (lstArray[i] !== '') {
                                    arrayEmptyFlag = false;
                                    break;
                                }
                            }
                            if (arrayEmptyFlag) {
                                allData.pop();
                            }
                            table.updateData(allData);

                            // 获取table3的数据
                            let table3Data = table3.table.data().toArray();
                            for (let i = 0; i < table3Data.length; i++) {
                                let temp = table3Data[i];
                                if (table3Data[i][0] === cellData) {
                                    table3Data.splice(i, 1);
                                    table3.updateData(
                                        table3Data);
                                    let table2Data = table2.table.data().toArray();
                                    temp[index.column + 2] = temp[index.column + 2].replace(curMonth, '');
                                    if (temp[index.column + 2].substr(0, 1) === ' ') {
                                        temp[index.column + 2] = temp[index.column + 2].substr(1);
                                    }
                                    table2Data.splice(0, 0, temp);
                                    table2.updateData(table2Data);
                                    break;
                                }
                            }
                        };

                        if (cellData !== '') {
                            // 触发模态框
                            Utils.showModal('modal', '注意',
                                cellData + '将被移出科室分组名单，重新退回待分组列表中，是否确定',
                                showModalCallback,
                                'okBtn'
                            );
                        }
                    });

                    // 为表格2创建点击事件
                    $('#datatables2 tbody').on('click', 'td', function() {
                        // 获取当前点击的单元格的位置
                        let cell = table2.table.cell(this);
                        let index = cell.index();
                        let column = cell.column(index.column);
                        let row = table2.table.row($(this).parents('tr'));
                        let name = row.data()[0];
                        let cellData = cell.data();
                        let title = column.title();

                        // 不响应前两列的点击事件
                        if (index.column <= 1) {
                            return;
                        }

                        let showModalCallback = () => {
                            // 如果数组为空则直接退出程序
                            if (table2.table.data().toArray().length === 0) {
                                return;
                            }

                            // 获取当前行数据
                            let rowData = row.data();
                            // 移除当前点击的行
                            row.remove();
                            // 重新绘制表格
                            table2.table.draw();
                            // 更新行数据
                            rowData[index.column] = rowData[index.column] + ' ' + curMonth;
                            // 将数据添加到表格3中并重新绘制
                            table3.table.row.add(rowData).draw();

                            // 将数据添加到表格1中并重新绘制
                            // 首先获取当前表格有多少行
                            let rows_length = table.table.rows().data().length;
                            // 获取列数据
                            const table_col_num = index.column;
                            let idData = table.table.column(0).data().toArray();
                            let colData = table.table.column(table_col_num - 2).data().toArray();
                            // 如果该列最后一行为空则直接添加的空的单元格中
                            if (colData.length && colData[colData.length - 1] === '') {
                                colData.every((val, idx) => {
                                    if (val === '') {
                                        table.table.cell({ row: idx, column: table_col_num - 2 }).data(name);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                            } else { // 否则需要新加一行数据
                                let tableRowData = Array(tableCols.length).fill('');
                                tableRowData[table_col_num - 2] = name;
                                table.table.row.add(tableRowData).draw();
                            }
                            // 刷新显示
                            table.table.draw();
                        };

                        if (cellData !== '') {
                            // 触发模态框
                            Utils.showModal('modal', '注意',
                                name + '已于' + cellData + '值"' + title + '"科室，是否确定重复选择',
                                showModalCallback,
                                'okBtn'
                            );
                        } else {
                            // 触发模态框
                            Utils.showModal('modal', '注意',
                                name + '将值"' + title + '"科室，是否确定',
                                showModalCallback,
                                'okBtn'
                            );
                        }
                    });

                    // 接下来创建第三个已分配人员名单数据表
                    table3 = Utils.getInstance(table3, DatatableModule, ['#datatables3']);
                    table3.createTable([], {
                        table: {
                            ordering: false, // 禁止排序
                            autoWidth: true, // 自动宽度
                            columns: peopleCols,
                            dom: 'Blfrtip',
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '已分组人员名单',
                                title: null
                            }]
                        }
                    });

                    // 获取备份数据
                    BackupGetData();
                },
                () => common.showNotification('获取数据失败，请检查服务器连接！', 'danger')
            );
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
                $('#nextBtn').addClass('disabled');
            } else {
                $('#nextBtn').removeClass('disabled');
            }
        });

        // 处理数据备份的事情
        let backupInterval = null;
        const BackupSenddata = () => {
            let jsonData = { type: 'depart_bak', month: curMonth };
            jsonData.table = table.table.data().toArray();
            jsonData.table2 = table2.table.data().toArray();
            jsonData.table3 = table3.table.data().toArray();
            Utils.postJson({
                    url: common.backUpUrl,
                    data: JSON.stringify(jsonData)
                }, () => common.showNotification('备份成功！', 'success'),
                () => common.showNotification('备份失败，请检查服务器连接！', 'danger'));
        };

        const BackupTimerCallBack = () => {
            console.log("备份数据中");
            BackupSenddata();
        };


        const BackupSetInterval = () => {
            if (backupInterval) {
                return;
            }
            backupInterval = setInterval(BackupTimerCallBack, 60000);
            common.showNotification('数据备份已开启，每60s备份一次', 'info');
        };

        const BackupClearInterval = () => {
            clearInterval(backupInterval);
            common.showNotification('数据备份已关闭', 'info');
        };

        const BackupGetData = (callBack) => {
            Utils.getJson({
                url: common.backUpUrl
            }, data => {
                if (typeof(data) == 'String') {
                    data = JSON.parse(data);
                }

                if (!data.type || data.type !== 'depart_bak' || data.month !== curMonth) {;
                } else {
                    Utils.showModal(
                        'bkmodal',
                        '发现备份数据',
                        '是否要恢复上期的编辑数据？',
                        () => {
                            let newDataName = [];
                            for (let item of peopleCurData) {
                                newDataName.push(item[0]);
                            }

                            let backupDataName = [];
                            for (let item of data.table2) {
                                backupDataName.push(item[0]);
                            }
                            for (let item of data.table3) {
                                backupDataName.push(item[0]);
                            }

                            for (let i = 0; i < newDataName.length; i++) {
                                // 判断当前系统是否有新的数据
                                if (backupDataName.indexOf(newDataName[i]) === -1) {
                                    data.table2.splice(0, 0, peopleCurData[i]);
                                }
                            }

                            table.updateData(data.table);
                            table2.updateData(data.table2);
                            table3.updateData(data.table3);
                            common.showNotification('数据恢复成功！', 'success');
                        },
                        'okBtn2'
                    );
                }
                // 开启备份功能
                BackupSetInterval();

            }, () => common.showNotification('恢复失败，请检查服务器连接！', 'danger'));
        };

        // 处理备份按钮点击函数
        $('#backupBtn').click(() => {
            let data = {
                table: table.table.data().toArray(),
                table2: table2.table.data().toArray(),
                table3: table3.table.data().toArray()
            };
            let blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
            FileSaver.saveAs(blob, "depart_bak_" + getNowFormatDate() + ".json");
        });

        // 处理恢复数据上传按钮
        $('#recoverBtn').change(() => {
            const rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
            const file = $('#recoverBtn')[0].files[0];
            const reader = new FileReader();
            // 设置读取完成回调函数
            reader.onload = (event) => {
                let data = event.target.result;
                data = JSON.parse(data);

                let newDataName = [];
                for (let item of peopleCurData) {
                    newDataName.push(item[0]);
                }

                let backupDataName = [];
                for (let item of data.table2) {
                    backupDataName.push(item[0]);
                }
                for (let item of data.table3) {
                    backupDataName.push(item[0]);
                }

                for (let i = 0; i < newDataName.length; i++) {
                    // 判断当前系统是否有新的数据
                    if (backupDataName.indexOf(newDataName[i]) === -1) {
                        data.table2.splice(0, 0, peopleCurData[i]);
                    }
                }

                table.updateData(data.table);
                table2.updateData(data.table2);
                table3.updateData(data.table3);
                common.showNotification('数据恢复成功！', 'success');
            };
            // 开始读取文件
            reader.readAsText(file);
        });

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
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
                seperator2 + date.getHours() + seperator1 + date.getMinutes() +
                seperator1 + date.getSeconds();
            return currentdate;
        }
    });
