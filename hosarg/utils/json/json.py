# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-14 23:27:39
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-15 11:32:29

import json
import os


def read_json(file_path):
    if not os.path.exists(file_path):
        with open(file_path, 'w+', encoding='UTF-8') as f:
            f.write('{}')

    data = None
    with open(file_path, 'r', encoding='UTF-8') as f:
        data = json.load(f)
    return data


def write_json(data, file_path):
    with open(file_path, 'w', encoding='UTF-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
