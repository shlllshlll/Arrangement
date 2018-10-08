/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-08 23:02:03
 */
define(['jquery', 'common', 'module.utils', 'module.datatable'],
    function($, common, Utils, DatatableModule) {
        'use strict';
        let table = null,
            table2 = null,
            table3 = null;

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
                    if (person.month.indexOf('1810') !== -1) {
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
                    { title: 'ID' },
                    ...departCols
                ];
                table = Utils.getInstance(table, DatatableModule, ['#datatables']);
                table.createTable([], {
                    table: {
                        columns: tableCols
                    }
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
                        let colData = table.table.column(table_col_num).data().toArray();
                        // 如果该列最后一行为空则直接添加的空的单元格中
                        if (colData.length && colData[0] === '') {
                            colData.every((val, idx) => {
                                if (val === '') {
                                    table.table.cell({ row: idx, column: table_col_num }).data(name);
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        } else { // 否则需要新加一行数据
                            let tableRowData = Array(tableCols.length).fill('');
                            let nxtId = idData.length ? idData[idData.length - 1] + 1 : 1;
                            tableRowData[0] = nxtId;
                            tableRowData[table_col_num] = name;
                            table.table.row.add(tableRowData);
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
                    console.log(index);
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
    });
