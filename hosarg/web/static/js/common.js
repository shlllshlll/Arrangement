/*
 * @Author: SHLLL
 * @Date:   2018-09-23 21:36:44
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-03 17:05:43
 */
define("common", [], function() {
    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    common = {};
    common.basePath = '//127.0.0.1:8080/api/';
    common.dataUrl = common.basePath + 'peopledata';
    common.departUrl = common.basePath + 'departdata';
    common.wardUrl = common.basePath + 'warddata';
    common.uploadUrl = common.basePath + 'uploadData';
    common.clearUrl = common.basePath + 'clearData';

    // 检查字符串是否是纯数字函数
    common.checkNumber = theObj => {
        let reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    };

    common.showNotification = (msg, color = 'primary') => {
        $.notify({
            icon: "nc-icon nc-app",
            message: msg

        }, {
            // 'primary', 'info', 'success', 'warning', 'danger'
            type: color,
            timer: 500,
            // placement: {
            //     from: from,
            //     align: align
            // }
        });
    };

    return common;
});

/*
Define datatables dependencies.
 */
define("datatables", ["datatables.net",
    "datatables.net-bs4",
    "datatables.net-buttons",
    "datatables.net-buttons-bs4",
    "datatables.net-buttons-html5",
    "datatables.celledit"
]);
