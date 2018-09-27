/*
 * @Author: SHLLL
 * @Date:   2018-09-25 16:45:45
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-09-25 21:20:07
 */
(function() {
    'use strict';
    let peopledata = null;

    $.ajax({
        type: "GET",
        url: common.dataUrl,
        dataType: 'json',
        xhrFields: { 'Access-Control-Allow-Origin': '*' }
    }).done(data => {
        if (typeof(data) == 'String') {
            data = JSON.parse(data);
        }
        peopledata = data.peopledata;
        window.data = data;
        console.log(peopledata);

        // 下面找出了本月应值班的所有人员的index
        const curMonth = '1810';
        let peopleIdxCurMonth = [];
        for(let i = 0; i < peopledata.length; i++) {

            if(peopledata[i].month.indexOf(curMonth) !== -1) {
                peopleIdxCurMonth.push(i);
            }
        }
        // 然后构建数组的每一行
        let tableData = [];
        // 遍历每一个人
        for(let i of peopleIdxCurMonth) {
            // 构建一个初始化的数组
            let tampArray = [peopledata[i].name];
            for(let j of data.departid) {
                tampArray.push('');
            }
            // 遍历每一个人的值班历史
            for(let j of peopledata[i].history) {
                tampArray[j] = '--';
            }
        }

        // 构建表格的列标题
        tableColumn = [{title:'姓名'}];
        for(let key in data.departid) {
            tableColumn.push({title: data.departid[key]});
        }

        console.log(peopleIdxCurMonth);


    }).fail(() => common.showNotification('获取数据失败，请检查服务器连接！', 'danger'));
})();
