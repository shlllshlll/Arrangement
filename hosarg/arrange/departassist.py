# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-19 22:48:59
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-20 21:31:21

from openpyxl import Workbook


class DepartAssist(object):
    """This class is an assistent for department arrangement."""

    def __init__(self, data, date):
        self._data = data
        date = str(date)
        date_datas = data['datedata']

        # 准备人员数据
        # 获取月份列表
        months_data = [i['date'] for i in date_datas]
        month_idx = months_data.index(date)
        date_data = date_datas[month_idx]
        # 获取本月排班人员的ID号和人数
        people_ids = date_data['people_id']
        # people_num = date_data['num']
        # 获取本月有排班人员的数据列表
        people_cur_data = self._find_people(people_ids, data['peopledata'])
        self._create_table(data['departid'], people_cur_data)

    def _find_people(self, id_list, people_data):
        """根据指定id列表查找对应的人员数据函数

        本函数接受一个人员id列表，遍历列表，
        返回对应id号人员的所有信息

        Args:
            id_list: 人员id号列表

        Returns:
            返回找打的人员数据
            返回list列表
        """
        people_ids = [i['id'] for i in people_data]
        person_data = []
        for id in id_list:
            idx = people_ids.index(id)
            person_data.append(people_data[idx])
        return person_data

    def _create_table(self, depart_id, people_data, file_name='科室信息表.xlsx'):
        wb = Workbook()
        ws = wb.active

        # 首先添加列名称
        col_name = ['人员姓名'] + [depart_id[x] for x in sorted(depart_id)]
        ws.append(col_name)

        # 接着添加人员信息
        for person in people_data:
            row_msg = [person['name']] + ['未值班' for x in range(len(depart_id))]
            for pos in person['history']:
                row_msg[pos] = '已值'
            ws.append(row_msg)
        wb.save(self._data['base_path'] + 'result/' + file_name)
