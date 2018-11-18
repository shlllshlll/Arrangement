/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-25 10:53:50
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

        function hideTableCols(table, colRange, data = table.table.columns().data()) {
            // 遍历选中的每一列
            for(let idx = colRange[0]; idx <= colRange[1]; idx++) {
                let col_data = data[idx];
                let emptyFlag = true;
                for(let item of col_data) {
                    if(item !== '') {
                        emptyFlag = false;
                        break;
                    }
                }
                if(emptyFlag) {
                    table.table.column(idx).visible(false);
                }
            }
        }

        // 新建一个自定义的下拉栏
        $('#datatables2').on('init.dt', function() {
            $('#mySelect').append(`<select class="form-control col-sm-7" id="formSelect">
                                    <option value="" selected>请选择类别</option>
                                    <option>本院住院医</option>
                                    <option>八年制（骨科）</option>
                                    <option>八年制（非骨科）</option>
                                    <option>研究生（骨科）</option>
                                    <option>研究生（非骨科）</option>
                                    <option>骨科临博</option>
                                    <option>基地住院医</option>
                                    <option>进修医</option>
                                    <option>其他</option>
                                </select>`).css('width', '100%').change(() => {
                let val = $('#formSelect').val();
                $('#datatables2_filter input').val(val).keyup();
            });
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
                    let departNames = [];
                    for (let key in data.departid) {
                        departNames.push(data.departid[key]);
                    }
                    let departCols = departNames.map((item)=>{return {title: item};});

                    // 首先创建第一个科室分组名单数据表
                    let tableCols = [
                        ...departCols
                    ];
                    table = Utils.getInstance(table, DatatableModule, ['#datatables']);
                    table.createTable([], {
                        table: {
                            ordering: false,
                            columns: tableCols,
                            dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" +
                                "<'row'<'col-md-12'tr>>" +
                                "<'row'<'col-md-5'i><'col-md-7'p>>",
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '科室分组表',
                                title: null
                            }]
                        },
                    });

                    // 接下来创建第二个待分配人员名单数据表
                    /**
                     * 获取当前月份的上一个月份函数
                     * @param  {String} month 当前月份
                     * @return {String}       上一个月份
                     */
                    let getLstMonth = (date) => {
                        // 首相将数据转换为int型
                        date = parseInt(date);
                        // 然后分离月份和年份
                        let month = date % 100;
                        let year = Math.floor(date / 100);
                        // 判断是否为1月
                        if (month <= 1) {
                            month = 12;
                            year--;
                        } else {
                            month--;
                        }

                        return (year * 100 + month).toString();
                    };
                    /**
                     * 获取月份列表函数
                     * @param  {String} curMonth 当前月份
                     * @return {Array}           返回月份数组
                     */
                    let getLastMonths = (curMonth) => {
                        let monthsArr = [];
                        for (let i = 0; i < 8; i++) {
                            // 循环获取上一个月份
                            curMonth = getLstMonth(curMonth);
                            monthsArr.splice(0, 0, curMonth);
                        }
                        return monthsArr;
                    };
                    // 首先获取monthscols列表
                    let months = getLastMonths(month);
                    let monthsCol = months.map(item => { return { title: item }; });
                    // 准备列标题
                    let peopleCols = [
                        { title: '姓名' },
                        { title: '类别' },
                        { title: '备注' },
                        ...monthsCol
                    ];
                    // 准备表格数据
                    peopleCurData = [];
                    for (let person of peopleCurMonth) {
                        let temp = Array(peopleCols.length).fill('');
                        temp[0] = person.name;
                        temp[1] = person.type;
                        if (person.remark) {
                            temp[2] = person.remark;
                        }
                        for (let item of person.history) {
                            for (let month of item.month) {
                                let idx = months.indexOf(month);
                                if (idx !== -1) {
                                    temp[idx + 3] = item.name;
                                }
                            }
                        }
                        peopleCurData.push(temp);
                    }

                    table2 = Utils.getInstance(table2, DatatableModule, ['#datatables2']);
                    table2.createTable(peopleCurData, {
                        table: {
                            ordering: false, // 禁止排序
                            autoWidth: true, // 自动宽度
                            columns: peopleCols,
                            dom: "<'row'<'col-md-4 d-flex justify-content-start align-items-center'l<'#mySelect'>><'col-md-8 d-flex justify-content-end align-items-center'Bf>>" +
                                "<'row'<'col-md-12'tr>>" +
                                "<'row'<'col-md-5'i><'col-md-7'p>>",
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '带分组人员名单',
                                title: null
                            }]
                        }
                    });
                    hideTableCols(table2, [3, 10]);
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
                            // 删除表格中指定单元格数据
                            delTableCell(table, cell);

                            // 获取table3的数据
                            let table3Data = table3.table.data().toArray();
                            for (let i = 0; i < table3Data.length; i++) {
                                // 根据人名对应关系找到
                                if (table3Data[i][0] === cellData) {
                                    // 删除对应位置的数据行
                                    let temp = table3Data.splice(i, 1)[0];
                                    table3.updateData(table3Data);
                                    let table2Data = table2.table.data().toArray();
                                    temp.pop();
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
                    $('#datatables2 tbody').on('click', 'tr', function() {
                        // 获取当前点击的行的位置
                        let row = table2.table.row(this);
                        let name = row.data()[0];


                        // 生成按钮的HTML
                        let table2ModalBtnHtml = ((cols)=>{
                            let html = '';
                            for(let item of cols) {
                                html += '<button type="button" class="btn btn-outline-primary">';
                                html += item.title;
                                html += "</button>";
                            }
                            return html;
                        })(departCols);
                        Utils.showModalNoBtn('modal', '请选择'+name+'的科室',
                            `<div class="row" id="departBtnGroup">
                                ${table2ModalBtnHtml}
                            </div>`
                        );
                        $('#departBtnGroup button').click(function(){
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

                            // 将数据添加到表格3中并重新绘制
                            rowData.push($(this).text());
                            table3.table.row.add(rowData).draw();

                            // 将数据添加到表格1中并重新绘制
                            // 首先获取当前表格有多少行
                            let rows_length = table.table.rows().data().length;
                            // 获取列数据
                            const table_col = departNames.indexOf($(this).text());
                            let idData = table.table.column(0).data().toArray();
                            let colData = table.table.column(table_col).data().toArray();
                            // 如果该列最后一行为空则直接添加的空的单元格中
                            if (colData.length && colData[colData.length - 1] === '') {
                                colData.every((val, idx) => {
                                    if (val === '') {
                                        table.table.cell({ row: idx, column: table_col }).data(name);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                            } else { // 否则需要新加一行数据
                                let tableRowData = Array(tableCols.length).fill('');
                                tableRowData[table_col] = name;
                                table.table.row.add(tableRowData).draw();
                            }
                            // 刷新显示
                            table.table.draw();
                            // 关闭模态框显示
                            $('#modal').modal('hide');
                        });
                    });

                    // 接下来创建第三个已分配人员名单数据表
                    let peopleCols3  = [
                        ...peopleCols,
                        {title: month}
                    ];
                    table3 = Utils.getInstance(table3, DatatableModule, ['#datatables3']);
                    table3.createTable([], {
                        table: {
                            ordering: false, // 禁止排序
                            autoWidth: true, // 自动宽度
                            columns: peopleCols3,
                            dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" +
                                "<'row'<'col-md-12'tr>>" +
                                "<'row'<'col-md-5'i><'col-md-7'p>>",
                            buttons: [{
                                extend: 'excelHtml5',
                                filename: '已分组人员名单',
                                title: null
                            }]
                        }
                    });
                    hideTableCols(table3, [3, 10], table2.table.columns().data());

                    // 获取备份数据
                    BackupGetData();
                },
                () => common.showNotification('获取数据失败，请检查服务器连接！', 'danger')
            );
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
            let allData = table.table.data().toArray();
            // 从单元格中获取index
            let index = cell.index();

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
                for (let i = index.row + 1; i < array.length; i++) {
                    // 向上迁移数据
                    array[i - 1][index.column] = array[i][index.column];
                    if (array[i][index.column] === '') {
                        break;
                    }
                    array[i][index.column] = '';
                }
            }
            // 判断最后一行是否为全空
            let lstArray = array[array.length - 1];
            let arrayEmptyFlag = true;
            for (let i = 0; i < lstArray.length; i++) {
                if (lstArray[i] !== '') {
                    arrayEmptyFlag = false;
                    break;
                }
            }
            if (arrayEmptyFlag) {
                array.pop();
            }

            return array;
        }

        /**
         * 将备份数据与当前人员数据合并
         * @param  {Object} bkdata  备份的三个表格的数据
         * @param  {Array} curdata 当前系统的人员数据数组
         * @return {Object}         合并后的备份数据
         */
        function mergeBackupData(bkdata, curdata) {
            // 从当前数据中取出人名数据
            let newDataName = [];
            for (let item of curdata) {
                newDataName.push(item[0]);
            }

            // 从恢复的Table2和Table3中提取名字信息
            let backupDataName = [];
            for (let item of bkdata.table2) {
                backupDataName.push(item[0]);
            }
            for (let item of bkdata.table3) {
                backupDataName.push(item[0]);
            }

            // 将删除的数据记录在备份数据中同步删除
            // 需要遍历三个备份数据表格，找到被删除的数据进行删除
            // 首先遍历第一个表格
            for (let i = 0; i < bkdata.table.length; i++) {
                for (let j = 0; j < bkdata.table[i].length; j++) {
                    let cellName = bkdata.table[i][j];
                    if (cellName === '') {
                        continue;
                    }

                    // 如果备份数据在当前系统数据中没有找到就需要删除
                    if (newDataName.indexOf(cellName) === -1) {
                        delArrayCell(bkdata.table, { row: i, column: j });
                    }
                }
            }
            // 接下来遍历第二个表格
            for (let i = 0; i < bkdata.table2.length; i++) {
                let cellName = bkdata.table2[i][0];
                // 如果备份数据在当前系统数据中没有找到就需要删除
                if (newDataName.indexOf(cellName) === -1) {
                    bkdata.table2.splice(i, 1);
                }
            }
            // 接下来遍历第三个表格
            for (let i = 0; i < bkdata.table3.length; i++) {
                let cellName = bkdata.table3[i][0];
                // 如果备份数据在当前系统数据中没有找到就需要删除
                if (newDataName.indexOf(cellName) === -1) {
                    bkdata.table3.splice(i, 1);
                }
            }

            // 针对表格2,3的已有数据使用系统最新数据进行替换
            // 首先遍历表格2
            for (let i = 0; i < bkdata.table2.length; i++) {
                let bkName = bkdata.table2[i][0];
                let idx = newDataName.indexOf(bkName);
                // 从当前系统数据中查找对应元素
                if (idx !== -1) {
                    bkdata.table2.splice(i, 1, curdata[idx]);
                }
            }
            // 接下来遍历表格三
            for (let i = 0; i < bkdata.table3.length; i++) {
                let bkName = bkdata.table3[i][0];
                let idx = newDataName.indexOf(bkName);
                // 从当前系统数据中查找对应元素
                if (idx !== -1) {
                    bkdata.table3[i][1] = curdata[idx][1];
                }
            }

            // 将新添加的数据合并到备份数据中
            for (let i = 0; i < newDataName.length; i++) {
                // 判断当前系统是否有新的数据
                if (backupDataName.indexOf(newDataName[i]) === -1) {
                    bkdata.table2.splice(0, 0, curdata[i]);
                }
            }

            return bkdata;
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

                if (!data.type || data.type !== 'depart_bak' || data.month !== curMonth) {
                    common.showNotification('备份数据与当前选项不符', 'warning');
                } else {
                    mergeBackupData(data, peopleCurData);
                    table.updateData(data.table);
                    table2.updateData(data.table2);
                    table3.updateData(data.table3);
                    common.showNotification('数据恢复成功！', 'success');
                    // Utils.showModal(
                    //     'bkmodal',
                    //     '发现备份数据',
                    //     '是否要恢复上期的编辑数据？',
                    //     () => {
                    //         mergeBackupData(data, peopleCurData);
                    //         table.updateData(data.table);
                    //         table2.updateData(data.table2);
                    //         table3.updateData(data.table3);
                    //         common.showNotification('数据恢复成功！', 'success');
                    //     },
                    //     'okBtn2'
                    // );
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

                mergeBackupData(data, peopleCurData);
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
