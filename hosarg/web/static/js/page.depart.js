/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-10 00:29:49
 */
define(['jquery', 'common', 'module.utils', 'module.datatable'],
    function($, common, Utils, DatatableModule) {
        'use strict';
        let tableInited = false;
        let table = null,
            table2 = null,
            table3 = null;

        // 处理标签页相关的事物
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            let tarTab = $(e.target).attr('aria-controls');
            tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
            let lstTab = $(e.relatedTarget).attr('aria-controls');
            lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

            if (tarTab === 1) {
                $('#title h3').text('输入月份');
                $('#title p').text('请设置分组的月份');
            } else if (tarTab === 2) {
                // 判断是否从标签1切换而来
                if (lstTab === 1) {
                    // 获取输入的月份
                    let month = $('#month').val();
                    month = String(month);
                    if (!month) {
                        month = '1810';
                    }
                    if (tableInited === false) {
                        tableInited = true;
                        showTab2(month);
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
                            columns: tableCols,
                            dom: 'Blfrtip',
                            buttons: [
                                'excelHtml5'
                            ]
                        },
                    });

                    // 接下来创建第二个待分配人员名单数据表
                    // 准备列标题
                    let peopleCols = [
                        { title: '姓名' },
                        ...departCols
                    ];
                    // 准备表格数据
                    let peopleCurData = [];
                    for (let person of peopleCurMonth) {
                        let temp = Array(peopleCols.length).fill('');
                        temp[0] = person.name;
                        for (let item of person.history) {
                            temp[item] = '值';
                        }
                        peopleCurData.push(temp);
                    }

                    table2 = Utils.getInstance(table2, DatatableModule, ['#datatables2']);
                    table2.createTable(peopleCurData, {
                        table: {
                            ordering: false, // 禁止排序
                            autoWidth: true, // 自动宽度
                            columns: peopleCols
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

                        // 不响应第一列的点击事件
                        if (index.column === 0) {
                            return;
                        }

                        let showModalCallback = () => {
                            // 获取当前行数据
                            let rowData = row.data();
                            // 移除当前点击的行
                            row.remove();
                            // 重新绘制表格
                            table2.table.draw();
                            // 更新行数据
                            rowData[index.column] = '值';
                            // 将数据添加到表格3中并重新绘制
                            table3.table.row.add(rowData).draw();

                            // 将数据添加到表格1中并重新绘制
                            // 首先获取当前表格有多少行
                            let rows_length = table.table.rows().data().length;
                            // 获取列数据
                            const table_col_num = index.column;
                            let idData = table.table.column(0).data().toArray();
                            let colData = table.table.column(table_col_num-1).data().toArray();
                            // 如果该列最后一行为空则直接添加的空的单元格中
                            if (colData.length && colData[colData.length - 1] === '') {
                                colData.every((val, idx) => {
                                    if (val === '') {
                                        table.table.cell({ row: idx, column: table_col_num-1 }).data(name);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                            } else { // 否则需要新加一行数据
                                let tableRowData = Array(tableCols.length).fill('');
                                tableRowData[table_col_num-1] = name;
                                table.table.row.add(tableRowData).draw();
                            }
                            // 刷新显示
                            table.table.draw();
                        };

                        if (cellData === '值') {
                            // 触发模态框
                            Utils.showModal('modal', '注意',
                                name + '已值"' + title + '"科室，是否确定重复选择',
                                showModalCallback
                            );
                        } else {
                            // 触发模态框
                            Utils.showModal('modal', '注意',
                                name + '将值"' + title + '"科室，是否确定',
                                showModalCallback
                            );
                        }
                    });

                    // 接下来创建第三个已分配人员名单数据表
                    table3 = Utils.getInstance(table3, DatatableModule, ['#datatables3']);
                    table3.createTable([], {
                        table: {
                            columns: peopleCols
                        }
                    });
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
    }
);
