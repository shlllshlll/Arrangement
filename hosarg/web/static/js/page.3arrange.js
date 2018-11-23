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
                        let rule = { 0: { w: new Set(), d: new Set() }, 1: { w: new Set(), d: new Set() } };
                        $('#usrAddForm .ruleRow').each(function () {
                            let subRule = $(this).find('select').val();
                            let date = $(this).find('input').val().split(' ');
                            date.forEach(ele => {
                                if (ele.split('-')[0].length === 1) {
                                    rule[subRule].w.add(ele);
                                } else {
                                    rule[subRule].d.add(ele);
                                }
                            });
                        });
                        // 遍历数组将Set类型转换为Array
                        for (let i in rule) {
                            for (let j in rule[i]) {
                                rule[i][j] = Array.from(rule[i][j]);
                            }
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

    const ResultTable = {
        showTable: function () {
            if (!varHolder.resultTable) {
                varHolder.resultTable = new DatatableModule('#resultTable');
                let colTitle = [{
                    title: '日期'
                },
                {
                    title: '姓名'
                }];
                varHolder.resultTable.createTable([], {
                    table: {
                        autoWidth: true,
                        columns: colTitle
                    }
                });
            }

            // Returns an array of dates between the two dates
            const getDates = function (startDate, endDate) {
                let dates = [],
                    currentDate = startDate,
                    addDays = function (days) {
                        let date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    };
                while (currentDate <= endDate) {
                    dates.push(currentDate);
                    currentDate = addDays.call(currentDate, 1);
                }
                return dates;
            };

            // // Usage
            // var dates = getDates(new Date(2013, 10, 22), new Date(2013, 11, 25));
            // dates.forEach(function (date) {
            //     console.log(date);
            // });
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
            format: 'yy/mm',
            language: 'zh-CN'
        });

        // 初始化UserTable
        UserTable.init();
        PreAranTable.init();

        NavTab.init((t) => DataCheck.formDataChecker(
            tabCheckers[t]),
            () => { },
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
                    varHolder.startDate = parseInt($('#startMonth').val().replace('/', ''));
                    varHolder.endDate = parseInt($('#endMonth').val().replace('/', ''));
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
