# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-16 13:40:16
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-20 11:50:56

from . import datapreprocess


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
