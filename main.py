# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-23 17:24:50
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-27 11:52:13

import web
import json
from hosarg.utils import DataPerpare
from hosarg.utils.datapreprocess import PersonData
from hosarg.arrange.wardarrangeAPI import WardArrangeAPI
from hosarg.utils.datapreprocess.personDataApi import PersonDataApi

urls = (
    '/', 'Index',
    '/index.html', 'Index',
    '/user.html', 'User',
    '/depart.html', 'Depart',
    '/ward.html', 'Ward',
    '/api/peopledata', 'APIPeopledata',
    '/api/departdata', "APIDepartdata",
    '/api/warddata', 'APIWard',
    '/api/uploadData', 'APIUpload',
    '/api/clearData', 'APIClear'
)

app = web.application(urls, globals())
render = web.template.render("templete/")
# 直接从Json数据库中读取数据
data_struct = {'data': DataPerpare(2).data}


class Index(object):
    def GET(self):
        return render.index()


class User(object):
    def GET(self):
        return render.user()


class Depart(object):
    def GET(self):
        return render.depart()


class Ward(object):
    def GET(self):
        return render.ward()


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
        data_struct['slice'] = WardArrangeAPI(
            data_struct['data']).slice_people(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        return json.dumps(data_struct['slice'])


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


application = app.wsgifunc()

if __name__ == "__main__":
    app.run()
