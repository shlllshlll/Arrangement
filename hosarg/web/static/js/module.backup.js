/*
 * @Author: Mr.Shi
 * @Date: 2019-01-31 22:58:03
 * @License: MIT License
 * @Email: shlll7347@gmail.com
 * @Modified by: Mr.Shi
 * @Last Modified time: 2019-01-31 22:58:08
 * @Description: The data backup module.
 */

define([
    'require',
    'common',
    'module.utils'
], function(require, common, Utils) {
    'use strict';

    function BackUp(bckUrl, backupTime, dataCallBck, getDataCallBck) {
        if (!(this instanceof BackUp)) {
            throw TypeError("BackUp不能被用作函数调用");
        }

        this.bckUrl = bckUrl;
        this.backupTime = backupTime;
        this.backupInterval = null;
        this.dataCallBck = dataCallBck;
        this.getDataCallBck = getDataCallBck;
    }

    /**
     * Replace ths defualt object prototype.
     * @type {Object}
     */
    BackUp.prototype = {
        /**
         * Repoint the base constructor back at the
         * original constructor function.
         * @type {Class Constructor}
         */
        constructor: BackUp,
        sendData: function() {
            let jsonData = this.dataCallBck();
            Utils.postJson({
                    url: this.bckUrl,
                    data: JSON.stringify(jsonData)
                }, () => common.showNotification('备份成功！', 'success'),
                () => common.showNotification('备份失败，请检查服务器连接！', 'danger'));
        },
        startBackup: function() {
            if (this.backupInterval) {
                return;
            }
            this.backupInterval = setInterval(this.sendData.bind(this), this.backupTime * 1000);
            common.showNotification('数据备份已开启，每' + this.backupTime + 's备份一次', 'info');
        },
        stopBackup: function() {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
            common.showNotification('数据备份已关闭', 'info');
        },
        getData: function() {
            Utils.getJson({
                url: common.backUpUrl
            }, data => {
                if (typeof(data) == 'String') {
                    data = JSON.parse(data);
                }

                this.getDataCallBck(data);
                this.startBackup();
            }, () => common.showNotification('恢复失败，请检查服务器连接！', 'danger'));
        }
    };

    return BackUp;
});
