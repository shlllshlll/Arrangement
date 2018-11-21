# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-16 13:40:16
# @License: MIT LICENSE
# @Last Modified by:   SHLLL
# @Last Modified time: 2018-10-11 10:58:02

from . import datapreprocess
from . import json


class DataPerpare(object):
    """Prepare data for arrangement."""

    def __init__(self, type):
        # 数据预处理类
        self.data = {}
        self.data['base_path'] = 'hosarg/data/'

        # 获取人员数据
        person_data_cls = datapreprocess.PersonData(self.data)
        person_data_cls.working(type)

        # 获取科室数据
        datapreprocess.DepartData(self.data)


def backup_set_data(all_data, data, path='json/BackupData.json'):
    json.write_json(data, all_data['base_path'] + path)


def backup_get_data(all_data, path='json/BackupData.json'):
    return json.read_json(all_data['base_path'] + path)
