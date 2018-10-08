/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-08 09:26:51
 */
define(['jquery', 'common', 'module.utils', 'module.datatable'],
    function($, common, Utils, DatatableModule) {
        'use strict';
        let peopledata = null;
        let table = null,
            table2 = null,
            table3 = null;

        Utils.getJson({ url: common.dataUrl },
            data => {
                if (typeof(data) == 'String') {
                    data = JSON.parse(data);
                }
                peopledata = data.peopledata;
                console.log(data);

                // 构建一个科室名的列标题
                let departCols = [];
                for(let key in data.departid) {
                    departCols.push({title: data.departid[key]});
                }

                // 首先创建第一个科室分组名单数据表
                table = Utils.getInstance(table, DatatableModule, ['#datatables']);
                table.createTable([], {
                    table: {
                        columns: departCols
                    }
                });

                // 接下来创建第二个待分配人员名单数据表
                let peopleCols = [
                    {title: '姓名'},
                    ...departCols
                ];
                table2 = Utils.getInstance(table2, DatatableModule, ['#datatables2']);
                table2.createTable([], {
                    table: {
                        columns: peopleCols
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
    });
