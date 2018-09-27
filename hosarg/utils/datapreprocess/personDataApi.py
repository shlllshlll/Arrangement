# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-25 14:58:34
# @License: MIT LICENSE
# @Last Modified by:   shlll
# @Last Modified time: 2018-09-25 16:11:39

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
        old_data = self._data['peopledata']

        try:
            last_id = old_data[-1]['id']
        except IndexError:
            last_id = 0
            name_list = []
        else:
            name_list = [i['name'] for i in old_data]

        for item in json_data:
            name = item['name']
            try:
                idx = name_list.index(name)

            except ValueError:
                new_data_item = {}
                last_id += 1
                new_data_item['name'] = item['name']
                new_data_item['id'] = last_id
                new_data_item['times'] = len(item['month'])
                new_data_item['month'] = item['month']
                new_data_item['history'] = []
                new_data_item['avliable'] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
                old_data.append(new_data_item)
            else:
                new_month = list(set(old_data[idx]['month'] + item['month']))
                old_data[idx]['month'] = new_month
            finally:
                json.write_json(old_data, self._base_path + 'json/PeopleData.json')
