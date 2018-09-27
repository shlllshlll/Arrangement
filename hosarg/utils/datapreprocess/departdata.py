# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-16 13:58:57
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-20 11:54:28

from .. import json


class DepartData(object):
    """docstring for DepartData"""

    def __init__(self, data):
        depart_id = json.read_json(data['base_path'] + 'json/DepartmentID.json')
        data['departid'] = {x['id']: x['name'] for x in depart_id}

        data['departrule'] = json.read_json(data['base_path'] + 'json/DepartData.json')
