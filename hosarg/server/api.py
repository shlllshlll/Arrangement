'''
@Author: SHLLL
@Date: 2019-02-10 22:58:06
@License: MIT License
@Email: shlll7347@gmail.com
@Modified by: SHLLL
@Last Modified time: 2019-02-11 15:02:48
@Description:
'''

import json
import web
from .html import data_struct
from .. import utils
from ..utils import DataPerpare
from ..utils import dataprepare
from ..utils.datapreprocess import PersonData
from ..arrange.wardarrangeAPI import WardArrangeAPI
from ..utils.datapreprocess.personDataApi import PersonDataApi
from ..utils.backup import BackUp

urls = (
    '/peopledata', 'APIPeopledata',
    '/departdata', "APIDepartdata",
    '/warddata', 'APIWard',
    '/uploadData', 'APIUpload',
    '/clearData', 'APIClear',
    '/backupData', 'APIBackup',
    '/backupWard', 'APIBkWard',
    '/tlineData', 'TLineData',
    '/tlinePre', 'TLinePre'
)

app_api = web.application(urls, locals())


class APIPeopledata(object):
    def GET(self):
        data_struct['data'] = DataPerpare(2).data
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps(data_struct['data'])

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        data_struct['data'] = data
        PersonData(data).working(3)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'ok'})


class APIDepartdata(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'error'})

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        data_struct['depart'] = data
        WardArrangeAPI(data_struct['data']).update_person_data(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'ok'})


class APIWard(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'error'})

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        depart_data = data['people']
        date_data = data['range']
        data_struct['depart'] = depart_data
        data_struct['ward'] = WardArrangeAPI(data_struct['data'])\
            .arrange_ward(
                depart_data,
                date_data['month'],
                date_data['startday'],
                date_data['endday'],
                date_data['data']
        )
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps(data_struct['ward'])


class APIUpload(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'error'})

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        PersonDataApi(data_struct['data']).write_2_json(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'ok'})


class APIClear(object):
    def GET(self):
        PersonDataApi(data_struct['data']).clear_2_json()
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'ok'})

    def POST(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'error'})


class APIBackup(object):
    backup = BackUp(data_struct['data']['base_path'])

    def GET(self):
        # web.header('Content-Type', 'application/json')
        # web.header('Access-Control-Allow-Origin', '*')
        # data = dataprepare.backup_get_data(data_struct['data'])
        # return json.dumps(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps({'status': 'error'})

    def POST(self):
        req_data = str(web.data(), encoding='utf-8')
        req_data = json.loads(req_data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        req_type = req_data['type']
        # dataprepare.backup_set_data(data_struct['data'], data)
        if req_type == 'get':
            req_item = req_data['item']
            req_id = req_data['id']
            response = self.backup.get_backup_data(req_item, req_id)
        elif req_type == 'set':
            req_item = req_data['item']
            req_id = req_data['id']
            data = req_data['data']
            response = self.backup.set_backup_data(req_item, req_id, data)
        elif req_type == 'remove':
            req_item = req_data['item']
            req_id = req_data['id']
            response = self.backup.remove_backup_data(req_item, req_id)
        else:
            response = self.backup._response(
                'error', 'Error {} method not supported'.format(req_type), '', '', '')

        return json.dumps(response)


class APIBkWard(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        data = dataprepare.backup_get_data(
            data_struct['data'], path='json/WardbkData.json')
        return json.dumps(data)

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        dataprepare.backup_set_data(
            data_struct['data'], data, path='json/WardbkData.json')
        return json.dumps({'status': 'ok'})


class TLineData(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLineData.json'
        data = utils.json.read_json(file_path)
        return json.dumps(data)

    def POST(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLineData.json'
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        utils.json.write_json(data, file_path)
        return json.dumps({'status': 'ok'})


class TLinePre(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLinePre.json'
        data = utils.json.read_json(file_path)
        return json.dumps(data)

    def POST(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLinePre.json'
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        utils.json.write_json(data, file_path)
        return json.dumps({'status': 'ok'})
