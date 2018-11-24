/*
 * @Author: SHLLL
 * @Date: 2018-11-22 10:50:03
 * @License: MIT License
 * @Email: shlll7347@gmail.com
 * @Modified by: SHLLL
 * @Last Modified time: 2018-11-22 11:25:43
 */

define([
    'common',
    'jquery',
    'module.datatable',
    'module.utils',
    'datepicker',
    'datepicker.zh-CN'
], function (common, $, DatatableModule, Utils) {
    'use strict';
    let varHolder = {};

    const DataCheck = {
        /**
         * 检查页面数据输入是否正确函数
         * @param {Array/Object} checkers 数据检查器
         */
        formDataChecker: function (checkers) {
            let failure = false;

            // checkers可以是数组也可以是对象
            if (!(checkers instanceof Array)) {
                checkers = [checkers];
            }

            // 检查checkers是否为空
            if (checkers.length === 0) {
                return failure;
            }

            for (let checker of checkers) {
                let input = $(checker.dom);
                let check = checker.checker;
                let data = input.val();

                let msg = check(data);
                if (msg) {
                    function clearBorder() {
                        $(this).removeClass('form-control-error');
                        $(this).unbind('click', clearBorder);
                        msgDom.remove();
                    }
                    let msgDom = $('<p style="color: red;font-size: 0.9rem;">' + msg + '</p>');
                    input.click(clearBorder);
                    input.addClass('form-control-error');
                    input.after(msgDom);
                    failure = true;
                }
            }
            return failure;
        },
    };

    const NavTab = {
        init: function (clickHook = () => { }, finishHook = () => { }, changeHook = () => { }) {
            // 处理导航标签相关的事情
            const tabCount = parseInt($('#mytab li:last-child a')
                .attr('aria-controls').replace(/[^0-9]/ig, ""));
            $('#nextBtn').click(() => {
                let curTab = $('.nav-link.active').attr('aria-controls');
                curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
                let nxtTab = curTab >= tabCount ? curTab : curTab + 1;
                let err = clickHook(curTab, nxtTab);
                if (!err) {
                    $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
                }
            });
            $('#backBtn').click(() => {
                let curTab = $('.nav-link.active').attr('aria-controls');
                curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
                let nxtTab = curTab > 1 ? curTab - 1 : curTab;
                let err = clickHook(curTab, nxtTab);
                if (!err) {
                    $('#mytab li:nth-child(' + nxtTab + ') a').tab('show');
                }
            });
            $('#finishBtn').click(() => {
                finishHook();
            });
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
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
            // 处理Tab标签页切换事件
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                let tarTab = $(e.target).attr('aria-controls');
                tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
                let lstTab = $(e.relatedTarget).attr('aria-controls');
                lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

                changeHook(lstTab, tarTab);

                if (tarTab === 1) {
                    $('#title h3').text('排班周期选择');
                    $('#title p').text('请选择三线排班的周期');
                } else if (tarTab === 2) { } else if (tarTab === 3) { }
            });
        }
    };

    const UserTable = {
        init: function () {
            if (!varHolder.userTable) {
                varHolder.userTable = new DatatableModule('#userTable');
                let colTitle = [{
                    title: '姓名'
                },
                {
                    title: '备注'
                },
                {
                    title: '规则'
                },
                {
                    name: "control",
                    searchable: false,
                    title: "操作",
                    orderable: false,
                    defaultContent: `<input type="button" value="❌" style="border-style: none;background: inherit;">`,
                    createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).on("click", "input", { rowIndex: rowIndex, rowData: rowData },
                            function (event) {
                                let rowNum = event.data.rowIndex;
                                let rowData = event.data.rowData;
                                Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据',
                                    () => {
                                        varHolder.userTable.table.row(rowNum).remove().draw();
                                    },
                                    'okDelRowBtn'
                                );
                            }
                        );
                    }
                }
                ];

                Utils.getJson({
                    url: common.tlinedata
                }, data => {
                    if (typeof (data) == 'String') {
                        data = JSON.parse(data);
                    }

                    varHolder.userTable.createTable(data, {
                        table: {
                            searching: false, // 禁止搜索
                            ordering: false, // 禁止排序
                            autoWidth: true,
                            paging: false,
                            columns: colTitle
                        }
                    });
                });
            }

            $('#usrTableAddBtn').click(() => {
                Utils.showModal('addModal', '排班规则设置', '',
                    () => {
                        let name = $('#usrAddName').val();
                        let comment = $('#usrAddComment').val();
                        let rule = { 0: new Set(), 1: new Set() };
                        $('#usrAddForm .ruleRow').each(function () {
                            let subRule = $(this).find('select').val();
                            let date = $(this).find('input').val().split(' ');
                            date.forEach(ele => {
                                rule[subRule].add(ele);
                            });
                        });
                        // 遍历数组将Set类型转换为Array
                        for (let i in rule) {
                            rule[i] = Array.from(rule[i]);
                        }
                        rule = JSON.stringify(rule);
                        let tabLength = varHolder.userTable.table.columns().header().length - 1;
                        let data = new Array(tabLength).fill('');
                        data[0] = name;
                        data[1] = comment;
                        data[2] = rule;
                        varHolder.userTable.table.row.add(data).draw();
                    },
                    'okAddBtn'
                );

                let initHtml = `<form id="usrAddForm"><div class="form-group row">
                        <label class="col-form-label col-sm-3">姓名</label>
                        <input type="text" class="form-control col-sm-7" id="usrAddName">
                    </div>
                    <div class="form-group row">
                        <label class="col-form-label col-sm-3">备注</label>
                        <input type="text" class="form-control col-sm-7" id="usrAddComment">
                    </div>
                    <div class="form-group row">
                        <label class="col-form-label col-sm-3">规则</label>
                    </div>
                    <div class="form-group row d-flex justify-content-center" id="usrAddIcon">
                        <i class="nc-icon nc-simple-add" style="font-size:25px;cursor:pointer;"></i></div>
                    </form>`;
                let ruleHtml = `<div class="form-group row align-items-center ruleRow">
                    <i class="nc-icon nc-simple-delete col-sm-1" style="font-size:20px;cursor:pointer;padding-right:20px;"></i>
                    <select class="form-control col-sm-3 custom-select">
                        <option value='1'>值</option>
                        <option value='0'>不值</option>
                    </select>
                    <input type="text" class="form-control col-sm-8">
                </div>`;
                $('#addModal .modal-body').append(initHtml);
                // 处理添加规则点击事件
                $('#usrAddIcon').click(() => {
                    $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml);
                    $('#usrAddForm .ruleRow i').click(function () {
                        $(this).parent().remove();
                    });
                });
            });
            $('#usrTableDelBtn').click(() => {
                Utils.showModal('delModal', '警告', '是否确定删除数据',
                    () => {
                        varHolder.userTable.updateData([]);
                        Utils.postJson({ url: common.tlinedata, data: JSON.stringify([]) },
                            () => common.showNotification('数据清楚成功', 'success'),
                            () => common.showNotification('数据清楚失败', 'error'));
                    },
                    'okDelBtn'
                );
            });
            $('#usrTableSaveBtn').click(() => {
                UserTable.postUserTable();
            });
        },
        postUserTable: function () {
            Utils.postJson({
                url: common.tlinedata,
                data: JSON.stringify(varHolder.userTable.table.data().toArray())
            },
                () => common.showNotification('数据保存成功', 'success'),
                () => common.showNotification('数据保存失败', 'error'));
        }
    };

    const PreAranTable = {
        init: function () {
            if (!varHolder.preTable) {
                varHolder.preTable = new DatatableModule('#preAranTable');
                let colTitle = [{
                    title: '姓名'
                },
                {
                    title: '日期'
                },
                {
                    name: "control",
                    searchable: false,
                    title: "操作",
                    orderable: false,
                    defaultContent: `<input type="button" value="❌" style="border-style: none;background: inherit;">`,
                    createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).on("click", "input", { rowIndex: rowIndex, rowData: rowData },
                            function (event) {
                                let rowNum = event.data.rowIndex;
                                let rowData = event.data.rowData;
                                Utils.showModal('delRowModal', '警告', '是否确定删除' + rowData[0] + '的数据',
                                    () => {
                                        varHolder.preTable.table.row(rowNum).remove().draw();
                                    },
                                    'okDelRowBtn'
                                );
                            }
                        );
                    }
                }
                ];

                Utils.getJson({
                    url: common.tlinePre
                }, data => {
                    if (typeof (data) == 'String') {
                        data = JSON.parse(data);
                    }

                    varHolder.preTable.createTable(data, {
                        table: {
                            searching: false, // 禁止搜索
                            ordering: false, // 禁止排序
                            autoWidth: true,
                            paging: false,
                            columns: colTitle
                        }
                    });
                });
            }

            $('#preTableAddBtn').click(() => {
                Utils.showModal('addModal', '添加排班日期', '',
                    () => {
                        let name = $('#usrAddName').val();
                        let date = [];
                        $('#usrAddForm .ruleRow').each(function () {
                            let curDate = $(this).find('input').val();
                            date.push(curDate);
                        });
                        date = JSON.stringify(date);
                        let tabLength = varHolder.preTable.table.columns().header().length - 1;
                        let data = new Array(tabLength).fill('');
                        data[0] = name;
                        data[1] = date;
                        varHolder.preTable.table.row.add(data).draw();
                    },
                    'okAddBtn'
                );

                let initHtml = `<form id="usrAddForm"><div class="form-group row">
                        <label class="col-form-label col-sm-3">姓名</label>
                        <input type="text" class="form-control col-sm-7" id="usrAddName">
                    </div>
                    <div class="form-group row">
                        <label class="col-form-label col-sm-3">值班日期</label>
                    </div>
                    <div class="form-group row d-flex justify-content-center" id="usrAddIcon">
                        <i class="nc-icon nc-simple-add" style="font-size:25px;cursor:pointer;"></i></div>
                    </form>`;
                let ruleHtml = `<div class="form-group row align-items-center ruleRow">
                    <i class="nc-icon nc-simple-delete col-sm-1" style="font-size:20px;cursor:pointer;padding-right:20px;"></i>
                    <div class="col-sm-1"></div>
                    <input id="addDatePicker" class="form-control col-sm-8">
                </div>`;
                $('#addModal .modal-body').append(initHtml);
                $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml);
                // 处理添加规则点击事件
                $('#usrAddIcon').click(() => {
                    $('#usrAddForm .row:nth-last-child(2)').after(ruleHtml);
                    $('#usrAddForm .ruleRow i').click(function () {
                        $(this).parent().remove();
                    });
                });
            });
            $('#preTableDelBtn').click(() => {
                Utils.showModal('delModal', '警告', '是否确定删除数据',
                    () => {
                        varHolder.preTable.updateData([]);
                        Utils.postJson({ url: common.tlinePre, data: JSON.stringify([]) },
                            () => common.showNotification('数据清楚成功', 'success'),
                            () => common.showNotification('数据清楚失败', 'error'));
                    },
                    'okDelBtn'
                );
            });
            $('#preTableSaveBtn').click(() => {
                PreAranTable.postTable();
            });
        },
        postTable: function () {
            Utils.postJson({
                url: common.tlinePre,
                data: JSON.stringify(varHolder.preTable.table.data().toArray())
            },
                () => common.showNotification('数据保存成功', 'success'),
                () => common.showNotification('数据保存失败', 'error'));
        }
    };

    const DateUtils = {
        format: function (date, fmt) { //author: meizz
            var o = {
                "M+": date.getMonth() + 1,                 //月份
                "d+": date.getDate(),                    //日
                "h+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        // 获取一个月有多少天
        getDaysInMonth: function (year, month) {
            let date = new Date(year, month, 0);
            return date.getDate();
        },
        // 获取起始日期和结束日期中的所有日期
        getDatesInRange: function (startDate, endDate) {
            let dates = [];
            let currentDate = startDate;
            let addDays = function (days) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + 1);
                return date;
            };

            while (currentDate <= endDate) {
                dates.push(currentDate);
                currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        }
    };

    const ResultTable = {
        showTable: function () {
            if (!varHolder.resultTable) {
                varHolder.resultTable = new DatatableModule('#resultTable');
                let colTitle = [{
                    title: '日期'
                },
                {
                    title: '姓名'
                },
                {
                    title: '值班次数'
                }
                ];
                varHolder.resultTable.createTable([], {
                    table: {
                        autoWidth: true,
                        dom: "<'row'<'col-md-6'l><'col-md-6 d-flex justify-content-end align-items-center'Bf>>" +
                            "<'row'<'col-md-12'tr>>" +
                            "<'row'<'col-md-5'i><'col-md-7'p>>",
                        buttons: [{
                            extend: 'excelHtml5',
                            filename: '三线排班表',
                            title: null
                        }],
                        columns: colTitle
                    }
                });
            }

            // 首先读取设置的起始日期和结束日期
            let startDate = varHolder.startDate.split('/').map(item => parseInt(item));
            startDate.push(1);
            let endDate = varHolder.endDate.split('/').map(item => parseInt(item));
            endDate.push(0);
            // 由于Date中的month的坑，需要处理month
            startDate[1]--;
            // 转换为Date对象
            startDate = new Date(...startDate);
            endDate = new Date(...endDate);
            // 获取起始日期与结束日期之间的所有日期Date对象
            let datesArr = DateUtils.getDatesInRange(startDate, endDate);

            // 根据Tab1和Tab2两个表格的信息生成一个人员信息的对象
            let peopleData = {};
            // 获取Usertable的所有人员信息
            let tableData = varHolder.userTable.table.data().toArray();
            tableData.forEach(ele => {
                peopleData[ele[0]] = { rule: JSON.parse(ele[2]), date: [] };
            });
            // 获取pretable的所有信息
            let preData = varHolder.preTable.table.data().toArray();
            // 将pretable中所有的日期信息转化为Date对象并存入到peopleData中
            preData.forEach(ele => {
                let datesObjArr = [];
                let dates = JSON.parse(ele[1]);
                for (let date of dates) {
                    let dateArr = date.split('.').map(item => parseInt(item));
                    dateArr[0] = 2000 + dateArr[0] % 100;
                    dateArr[1]--;
                    let dateObj = new Date(...dateArr);
                    datesObjArr.push(dateObj);
                }
                peopleData[ele[0]].date.push(...datesObjArr);
            });

            // 将所有的人名提取出来构造一个队列
            let names = Object.keys(peopleData);

            // 计算每人平均排班天数
            let avgDays = Math.ceil(datesArr.length / names.length);


            // 处理得到所有预排班的信息
            let preArrangeDates = [];
            let preArrangeNames = [];
            preData.forEach(ele => {
                let dates = JSON.parse(ele[1]);
                for (let date of dates) {
                    date = date.split('.');
                    date[0] = 2000 + date[0] % 100;
                    date[1]--;
                    date = (new Date(...date)).valueOf();
                    preArrangeDates.push(date);
                    preArrangeNames.push(ele[0]);
                }
            });

            // 新建一个用于存储结果的容器
            let resultData = [];
            // 遍历所有日期
            for (let date of datesArr) {
                // 如果该日期已经预排班则记录后直接进行下一次循环
                let idx = preArrangeDates.indexOf(date.valueOf());
                if (idx !== -1) {
                    resultData.push([DateUtils.format(date, 'yy-MM-dd'), preArrangeNames[idx]]);
                    continue;
                }
                let namesCopy = JSON.parse(JSON.stringify(names));
                // 遍历人员名单找出符合要求的人员
                for (let i = 0; i < namesCopy.length; i++) {
                    let name = namesCopy[i];
                    let rule = peopleData[name].rule;
                    let avaStat = isDateAvaiable(date, rule);
                    let mettStat = isDateMeetRule(date, peopleData[name].date, avgDays);
                    avaStat = avaStat && mettStat;

                    // 如果规则检查表示可以排班则直接排班
                    if (avaStat) {
                        // 将结果输出
                        resultData.push([DateUtils.format(date, 'yy-MM-dd'), name]);
                        // 更新人员历史记录
                        peopleData[name].date.push(date);
                        // 将指定位置的人员放到队尾
                        names.push(names.splice(i, 1)[0]);
                        // 跳出内层循环
                        break;
                    }

                    // 如果循环到最后一个仍未找到则直接取第一个人作为解决方案
                    if (i + 1 === namesCopy.length) {
                        // 将结果输出
                        resultData.push([DateUtils.format(date, 'yy-MM-dd'), namesCopy[0]]);
                        // 更新人员历史记录
                        peopleData[namesCopy[0]].date.push(date);
                        // 将指定位置的人员放到队尾
                        names.push(names.splice(0, 1)[0]);
                    }
                }
            }

            // 计算数组中某元素数据的次数
            const countOccurences = (arr, value) => arr.reduce(((a, v) => v === value ? a + 1 : a), 0);
            let namesArray = [];
            resultData.forEach(ele => namesArray.push(ele[1]));
            resultData = resultData.map(ele => { ele.push(countOccurences(namesArray, ele[1])); return ele; });

            // 更新resultTable即可
            varHolder.resultTable.updateData(resultData);

            /**
             * 判断目标日期是否满足规则函数
             * @param {Date} date 目标Date日期对象
             * @param {Array} history 历史日期对象数组
             * @param {Number} avgDays 平均每人值班数量
             */
            function isDateMeetRule(date, history, avgDays) {
                for (let hisDate of history) {
                    // 保证两次值班时间大于10天
                    let times = Math.abs(Math.round((date - hisDate) / (24 * 60 * 60 * 1000)));
                    // 如果值班间隔小于10天表示不满足条件
                    if (times < 10) {
                        return false;
                    }
                }

                // 如果此人已值班数量大于平均值班数则不满足条件
                if (history.length >= avgDays) {
                    return false;
                }

                return true;
            }

            /**
             * 判断指定日期是否可以排班
             * @param {Date} date 传入的Date实例对象
             * @param {Object} rule 对应人员的排班规则
             */
            function isDateAvaiable(date, rule) {
                function dateInSigRule(date, rule) {
                    // 只有一位考虑是星期规则
                    if (rule.length === 1 && parseInt(rule) <= 7) {
                        // 获取日期的星期
                        let day = date.getDay();
                        // 将星期日从0转化为7
                        day = day ? day : 7;
                        let ruleDay = parseInt(rule);

                        if (day === ruleDay) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {  // 否则考虑是日期规则
                        let ruleDate = rule.split('.');
                        ruleDate = ruleDate.map(item => parseInt(item));
                        if (ruleDate.length === 3) {
                            ruleDate[0] %= 100;
                        }

                        let dateArr = [date.getDate(), date.getMonth() + 1, date.getFullYear() % 100];

                        let equalFlag = true;
                        let subRuleDate = ruleDate.pop();
                        while (subRuleDate) {
                            let subdate = dateArr.splice(0, 1)[0];
                            if (subdate !== subRuleDate) {
                                equalFlag = false;
                            }
                            subRuleDate = ruleDate.pop();
                        }

                        if (equalFlag) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }

                function dateInRuleRange(date, rule) {
                    let rulesArr = rule.split('-');

                    // 只有一位考虑是星期规则
                    if (rulesArr[0].length === 1) {
                        // 获取日期的星期
                        let day = date.getDay();
                        // 将星期日从0转化为7
                        day = day ? day : 7;
                        let ruleStartDay = parseInt(rulesArr[0]);
                        let ruleEndDay = parseInt(rulesArr[1]);

                        if (day >= ruleStartDay && day <= ruleEndDay) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {  // 否则考虑是日期规则
                        // 如果规则是
                        let startRuleArr = rulesArr[0].split('.');
                        let endRuleArr = rulesArr[1].split('.');
                        // 如果规则只包含日期信息
                        if (startRuleArr.length === 1 && endRuleArr.length === 1) {
                            let dateDay = date.getDate();
                            let startRuleDay = parseInt(startRuleArr[0]);
                            let endRuleDay = parseInt(endRuleArr[0]);

                            if (dateDay >= startRuleDay && dateDay <= endRuleDay) {
                                return true;
                            } else {
                                return false;
                            }
                        } else if (startRuleArr.length === 2 && endRuleArr.length === 2) {
                            let dateDay = date.getDate();
                            let dateMonth = date.getMonth() + 1;
                            let dateDate = dateMonth * 100 + dateDay;

                            let startRuleDate = parseInt(rulesArr[0].replace(/\./g, ''));
                            let endRuleDate = parseInt(rulesArr[1].replace(/\./g, ''));

                            if (dateDate >= startRuleDate && dateDate <= endRuleDate) {
                                return true;
                            } else {
                                return false;
                            }

                        } else if (startRuleArr.length === 3 && endRuleArr.length === 3) {
                            let dateDay = date.getDate();
                            let dateMonth = date.getMonth() + 1;
                            let dateYear = date.getFullYear() % 100;
                            let dateDate = dateYear * 10000 + dateMonth * 100 + dateDay;

                            let startRuleDate = parseInt(rulesArr[0].replace(/\./g, ''));
                            let endRuleDate = parseInt(rulesArr[1].replace(/\./g, ''));

                            if (dateDate >= startRuleDate && dateDate <= endRuleDate) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                }

                function dateInRule(date, rule) {
                    // 按照'-'分割rule
                    let subRules = rule.split('-');
                    // 如果规则只有一位表明是指定值
                    if (subRules.length === 1) {
                        return dateInSigRule(date, rule);
                    } else {   // 否则就是一个范围
                        return dateInRuleRange(date, rule);
                    }
                }


                // 首先处理不可排班规则
                let ruleUnava = rule['0'];
                // 如果规则存在
                if (ruleUnava.length) {
                    // 遍历每隔子规则
                    for (let subRule of ruleUnava) {
                        let result = dateInRule(date, subRule);
                        // 如果目标日期在不可排班日期中则直接返回false表示不可排班
                        if (result) {
                            return false;
                        }
                    }
                }

                // 接下来遍历可排班规则
                let ruleAva = rule['1'];
                if (ruleAva.length) {
                    for (let subRule of ruleAva) {
                        let result = dateInRule(date, subRule);
                        // 如果目标日期指定的规则范围中则直接返回可以排班
                        if (result) {
                            return true;
                        }
                    }

                    // 如果遍历完成没有符合排班条件的直接返回不可排班
                    return false;
                }

                // 其他情况则表示可以排班
                return true;
            }
        }
    };

    const tabCheckers = {
        '1': [{
            dom: '#startMonth',
            checker: (d) => d ? null : '日期不能为空'
        },
        {
            dom: '#endMonth',
            checker: (val) => {
                if (!val) {
                    return '日期不能为空';
                }
                let startDate = parseInt($('#startMonth').val().replace('/', ''));
                let endDate = parseInt(val.replace('/', ''));
                if (endDate < startDate) {
                    return '请确保结束日期小于开始日期';
                }
                return null;
            }
        }
        ],
        '2': [],
        '3': [],
        '4': []
    };

    (function pageInit() {
        // 初始化所有的日期选择器
        // $('[data-toggle="datepicker"]').val('');
        $('[data-toggle="datepicker"]').datepicker({
            format: 'yyyy/mm',
            language: 'zh-CN'
        });

        // 初始化UserTable
        UserTable.init();
        PreAranTable.init();

        NavTab.init((t) => DataCheck.formDataChecker(
            tabCheckers[t]),
            () => {
                $('#resultTable_wrapper button').click();
            },
            (lst, tar) => {
                if (tar === 1) {
                    $('#title h3').text('排班周期选择');
                    $('#title p').text('请选择三线排班的周期');
                } else if (tar === 2) {
                    $('#title h3').text('人员信息维护');
                    $('#title p').text('请输出本次排班中的人员信息');
                } else if (tar === 3) {
                    $('#title h3').text('已排班信息');
                    $('#title p').text('请输入已经排好的节假日信息');
                } else if (tar === 4) {
                    $('#title h3').text('排班结果');
                    $('#title p').text('这里输出了排班的结果');
                    ResultTable.showTable();
                }

                // 处理从标签1切换到标签2事件
                if (lst === 1 && tar === 2) {
                    varHolder.startDate = $('#startMonth').val();
                    varHolder.endDate = $('#endMonth').val();
                }

                // 处理从标签页2切换走的事件
                if (lst === 2) {
                    // 上传用户数据到服务器
                    UserTable.postUserTable();
                } else if (lst === 3) {
                    PreAranTable.postTable();
                }
            }
        );
    })();
});
