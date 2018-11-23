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

    function showUserTable() {
        if (!varHolder.userTable) {
            varHolder.userTable = new DatatableModule('#userTable');
            let colTitle = [
                { title: '姓名' },
                { title: '备注' },
                { title: '规则' }
            ];

            Utils.getJson({ url: common.tlinedata }, data => {
                if (typeof (data) == 'String') {
                    data = JSON.parse(data);
                }

                varHolder.userTable.createTable(data, {
                    table: {
                        searching: false, // 禁止搜索
                        ordering: false,  // 禁止排序
                        autoWidth: true,
                        paging: false,
                        columns: colTitle
                    }
                });
            });

        }

        $.ajax({
            type: "GET",
            url: common.tlinedata,
            dataType: 'json',
            xhrFields: { 'Access-Control-Allow-Origin': '*' }
        }).done(data => {
            if (typeof (data) == 'String') {
                data = JSON.parse(data);
            }
            freshTable(data.peopledata);
        }).fail(() => common.showNotification('获取数据失败，请检查服务器连接！', 'danger'));
    }

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

        NavTab.init((t) => DataCheck.formDataChecker(
            tabCheckers[t]),
            () => { },
            (lst, tar) => {
                // 处理标签2显示事件
                if (tar === 2) {
                    showUserTable();
                    // 处理从标签1切换到标签2事件
                    if (lst === 1) {
                        varHolder.startDate = parseInt($('#startMonth').val().replace('/', ''));
                        varHolder.endDate = parseInt(val.replace('/', ''));
                    }
                }
            }
        );
    })();
});
