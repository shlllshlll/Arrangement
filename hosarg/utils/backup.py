'''
@Author: SHLLL
@Date: 2019-02-11 11:04:14
@License: MIT License
@Email: shlll7347@gmail.com
@Modified by: SHLLL
@Last Modified time: 2019-02-11 11:04:17
@Description: Data backup module
'''

import json
import time
import os


class BackUp(object):

    def __init__(self, base_path, max_len=20):
        print('Backup module initialize.')
        # 检测备份文件夹是否存在
        self.backup_base_path = os.path.join(base_path, 'backup')
        if not os.path.exists(self.backup_base_path):
            os.mkdir(self.backup_base_path)

        self.max_len = max_len

        # 初始化备份文件列表字典
        self.backup_dict = {}

        # 遍历备份文件夹下的所有子文件夹
        for folder in os.listdir(self.backup_base_path):
            folder_path = os.path.join(self.backup_base_path, folder)
            if not os.path.isdir(folder_path):
                continue
            self.backup_dict[folder] = []
            dict_temp = {}
            for filename in os.listdir(folder_path):
                file_path = os.path.join(folder_path, filename)
                with open(file_path, 'r', encoding='UTF-8') as f:
                    data = json.load(f)
                    timestamp = data['timestamp']
                    dict_temp[timestamp] = os.path.splitext(filename)[0]
            # 对时间戳进行排序
            dict_keys = list(dict_temp.keys())
            dict_keys.sort()
            # 然后按照次序存入不包含扩展名的备份文件
            for key in dict_keys:
                self.backup_dict[folder].append(dict_temp[key])

    def _response(self, status, message, item, id, data):
        return {'status': status, 'message': message, 'item': item, 'id': id, 'data': data}

    def get_backup_data(self, item, id):
        item_path = os.path.join(self.backup_base_path, item)
        id_path = os.path.join(item_path, id+'.json')

        # 如果请求的文件不存在
        if not os.path.exists(item_path) or not os.path.exists(id_path):
            return self._response('nofile', 'Request file not exist.', item, id, '')

        # 读取文件
        with open(id_path, 'r', encoding='UTF-8') as f:
            data = json.load(f)

        return self._response('success', 'Success get data', item, id, data)

    def set_backup_data(self, item, id, data):
        item_path = os.path.join(self.backup_base_path, item)
        id_path = os.path.join(item_path, id+'.json')

        if not os.path.exists(item_path):
            os.mkdir(item_path)

        # 写入数据
        with open(id_path, 'w', encoding='UTF-8') as f:
            data = {'timestamp': int(time.time()), 'data': data}
            json.dump(data, f, indent=4, ensure_ascii=False)

        # 维护所有的备份数据
        if item not in self.backup_dict:
            self.backup_dict[item] = [id]
        else:
            if id in self.backup_dict[item]:
                self.backup_dict[item].remove(id)
                self.backup_dict[item].append(id)
            else:
                self.backup_dict[item].append(id)

        if len(self.backup_dict[item]) > self.max_len:
            lst_id = self.backup_dict[item].pop(0)
            lst_id_path = os.path.join(item_path, lst_id+'.json')
            os.remove(lst_id_path)

        return self._response('success', 'Success set data', item, id, '')

    def remove_backup_data(self, item, id):
        item_path = os.path.join(self.backup_base_path, item)
        id_path = os.path.join(item_path, id+'.json')

        if not os.listdir(item_path):
            os.rmdir(item_path)

        if not os.path.exists(id_path):

            return self._response('nofile', 'No backup data', item, id, '')

        os.remove(id_path)
        return self._response('success', 'Success remove data', item, id, '')
