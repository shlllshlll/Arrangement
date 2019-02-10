/*
 * @Author: Mr.Shi
 * @Date: 2019-01-31 15:19:50
 * @License: MIT License
 * @Email: shlll7347@gmail.com
 * @Modified by: Mr.Shi
 * @Last Modified time: 2019-01-31 15:20:00
 * @Description:
 */

define(["jquery"], function($) {
    "use strict";
    /**
     * NavTab constructor funcition
     * @param {string} selector Css selector for navtab
     */
    function NavTab(id, nxtBtn, bckBtn, finBtn, callBck, finBtnCabck, errCheckCallBack = () => {}) {
        if (!(this instanceof NavTab)) {
            throw TypeError("NavTab不能被用作函数调用");
        }

        this._id = id;

        // 禁用标签页点击事件
        $(id + ' a').on('click', e => e.stopPropagation());

        // 导航按钮功能初始化
        const tabCount = parseInt($(id + ' li:last-child a')
            .attr('aria-controls').replace(/[^0-9]/ig, ""));
        $(nxtBtn).click(() => {
            let curTab = $('.nav-link.active').attr('aria-controls');
            curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
            let nxtTab = curTab >= tabCount ? curTab : curTab + 1;
            let err = errCheckCallBack(curTab, nxtTab);
            if (!err) {
                $(id + ' li:nth-child(' + nxtTab + ') a').tab('show');
            }
        });
        $(bckBtn).click(() => {
            let curTab = $('.nav-link.active').attr('aria-controls');
            curTab = parseInt(curTab.replace(/[^0-9]/ig, ""));
            let nxtTab = curTab > 1 ? curTab - 1 : curTab;
            $(id + ' li:nth-child(' + nxtTab + ') a').tab('show');
        });
        $(finBtn).click(finBtnCabck);
        // 处理标签也切换事件和
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            let tarTab = $(e.target).attr('aria-controls');
            tarTab = parseInt(tarTab.replace(/[^0-9]/ig, ""));
            let lstTab = $(e.relatedTarget).attr('aria-controls');
            lstTab = parseInt(lstTab.replace(/[^0-9]/ig, ""));

            // 处理按键的显示与禁用关系
            if (tarTab === 1) {
                $(bckBtn).addClass('disabled');
            } else {
                $(bckBtn).removeClass('disabled');
            }

            if (tarTab === tabCount) {
                $(nxtBtn).css('display', 'none');
                $(finBtn).css('display', '');
            } else {
                $(nxtBtn).css('display', '');
                $(finBtn).css('display', 'none');
            }

            // 调用标签页处理回调函数
            callBck(lstTab, tarTab);
        });

    }

    NavTab.prototype = {
        /**
         * Repoint the base constructor back at the
         * original constructor function.
         * @type {Class Constructor}
         */
        constructor: NavTab
    };

    return NavTab;
});
