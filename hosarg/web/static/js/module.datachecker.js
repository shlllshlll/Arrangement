/*
 * @Author: Mr.Shi
 * @Date: 2019-02-09 16:39:58
 * @License: MIT License
 * @Email: shlll7347@gmail.com
 * @Modified by: Mr.Shi
 * @Last Modified time: 2019-02-09 16:40:34
 * @Description:
 */

define([
    'require',
    'jquery'
], function(require, $) {
    'use strict';

    function DataChecker() {
        if (!(this instanceof DataChecker)) {
            throw TypeError("DataChecker不能被用作函数调用");
        }
    }

    DataChecker.prototype = {
        /**
         * Repoint the base constructor back at the
         * original constructor function.
         * @type {Class Constructor}
         */
        constructor: DataChecker,
        formDataChecker: function(checkers) {
            // checkers可以是数组也可以是对象
            if (!(checkers instanceof Array)) {
                checkers = [checkers];
            }

            // 检查checkers是否为空
            if (checkers.length === 0) {
                return false;
            }

            for (let checker of checkers) {
                let input = $(checker.dom);
                let check = checker.checker;
                let data = input.val();

                let msg = check(data);
                if (msg) {
                    function clearBorder() {
                        $(this).removeClass('form-control-error');
                        $(this).unbind('click');
                        $(this).parent().find('p').remove();
                    }
                    input.unbind('click');
                    input.parent().find('p').remove();
                    let msgDom = $('<p style="color: red;font-size: 0.9rem;">' + msg + '</p>');
                    input.click(clearBorder);
                    input.addClass('form-control-error');
                    input.after(msgDom);
                    return true;
                }
            }
            return false;
        }
    };

    return DataChecker;
});
