/*
 * @Author: SHLLL
 * @Date:   2018-10-01 22:35:29
 * @Email:  shlll7347@gmail.com
 * @License MIT LICENSE
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-09 10:18:13
 */

define(["jquery", "datatables"], function($) {
    "use strict";

    /**
     * Datatables api pulgin: get the tile of a column.
     * @param  {String} 'column().title()' Function name.
     * @param  {Function} ()               Function body.
     * @return {String}                    The title.
     */
    $.fn.dataTable.Api.register('column().title()', function(){
        let colheader = this.header();
        return $(colheader).text().trim();
    });

    /**
     * DataTable module constructor function.
     * @param {String} dom  The Css selector to build datatable.
     * @param {Array} data The data to insert into datatable.
     * @param {Object} opts The options of the datatable.
     */
    function DataTableModule(dom) {
        if (!(this instanceof DataTableModule)) {
            throw new TypeError("DataTableModule不能被用作函数调用");
        }

        this._dom = dom;
    }


    /**
     * Static private defalut options for datatable.
     * @type {Object}
     */
    const DEFAULTOPTS = {
        language: {
            "sProcessing": "处理中...",
            "sLengthMenu": "显示 _MENU_ 项结果",
            "sZeroRecords": "没有匹配结果",
            "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix": "",
            "sSearch": "搜索:",
            "sUrl": "",
            "sEmptyTable": "表中数据为空",
            "sLoadingRecords": "载入中...",
            "sInfoThousands": ",",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "上页",
                "sNext": "下页",
                "sLast": "末页"
            },
            "oAria": {
                "sSortAscending": ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        }
    };


    /**
     * Replace ths defualt object prototype.
     * @type {Object}
     */
    DataTableModule.prototype = {
        /**
         * Repoint the base constructor back at the
         * original constructor function.
         * @type {Class Constructor}
         */
        constructor: DataTableModule,
        /**
         * Create a datatable use the param.
         * @param  {Array} data The data to insert into the table.
         * @param  {Object} opts The table options object.
         * @return {null}      null.
         */
        createTable: function(data, opts) {
            let tableOpts = Object.assign({}, DEFAULTOPTS, opts.table);
            tableOpts.data = data;
            let dom = this._dom;

            if (!$.fn.DataTable.isDataTable(dom)) {
                this.table = $(dom).DataTable(tableOpts);
                // If celledit options is true.
                if(opts.cellEditable === true && opts.cellEdit) {
                    this.table.MakeCellsEditable(opts.cellEdit);
                }
            }
        },
        /**
         * Clear the table data.
         * @return {null}     null.
         */
        clearTable: function() {
            // Get a datatable API instance
            table = this.table;
            table.clear();
            table.draw();
        },
        /**
         * Update table's data.
         * @param  {Array} data New table data array.
         * @return {null}      null.
         */
        updateData: function(data) {
            table = this.table;
            table.clear();
            table.rows.add(data).draw();
        }
    };

    return DataTableModule;
});
