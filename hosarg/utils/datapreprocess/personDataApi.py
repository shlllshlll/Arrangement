# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-25 14:58:34
# @License: MIT LICENSE
# @Last Modified by:   SHLLL
# @Last Modified time: 2018-10-09 22:11:01

from .. import json


class PersonDataApi(object):
    def __init__(self, data):
        self._data = data
        self._base_path = data['base_path']

    def clear_2_json(self):
        self._data['peopledata'] = []
        json.write_json(self._data['peopledata'], self._base_path + 'json/PeopleData.json')

    def write_2_json(self, json_data):
        """合并数据函数

        将从API传入的Json数据与已有的Json数据合并

        Args:
            json_data: 传入的Json数据
        """
        # 取出当前系统已有的数据
        old_data = self._data['peopledata']
        # 获取当前以后数据的人名构建一个list
        name_list = [i['name'] for i in old_data]

        # 取出传入的每一个数据
        for item in json_data:
            # 取出该数据项的姓名
            name = item['name']
            # 查找姓名是否存在
            try:
                idx = name_list.index(name)
            # 如果姓名在已有数据中不存在
            except ValueError:
                # 则新建一个数据项
                new_data_item = {}
                new_data_item['name'] = item['name']
                new_data_item['times'] = len(item['month'])
                new_data_item['month'] = item['month']
                new_data_item['history'] = []
                new_data_item['type'] = ''
                old_data.append(new_data_item)
            # 否则则是旧的数据
            else:
                # 合并前后两次数据的值班月份和数量等数据
                new_month = list(set(old_data[idx]['month'] + item['month']))
                old_data[idx]['month'] = new_month
                old_data[idx]['times'] = len(new_month)
            # 最后将数据写入Json文件中
            finally:
                json.write_json(old_data, self._base_path + 'json/PeopleData.json')
