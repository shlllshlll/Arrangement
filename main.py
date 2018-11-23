# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-23 17:24:50
# @License: MIT LICENSE
# @Last Modified by:   SHLLL
# @Last Modified time: 2018-10-14 17:26:12

import web
import json
import hosarg
from hosarg.utils import DataPerpare
from hosarg.utils import dataprepare
from hosarg.utils.datapreprocess import PersonData
from hosarg.arrange.wardarrangeAPI import WardArrangeAPI
from hosarg.utils.datapreprocess.personDataApi import PersonDataApi

urls = (
    '/', 'Index',
    '/login', 'Login',
    '/logout', 'Logout',
    '/index.html', 'Index',
    '/user.html', 'User',
    '/depart.html', 'Depart',
    '/ward.html', 'Ward',
    '/api/peopledata', 'APIPeopledata',
    '/api/departdata', "APIDepartdata",
    '/api/warddata', 'APIWard',
    '/api/uploadData', 'APIUpload',
    '/api/clearData', 'APIClear',
    '/api/backupData', 'APIBackup',
    '/api/backupWard', 'APIBkWard',
    '/api/tlineData', 'TLineData',
    '/api/tlinePre', 'TLinePre'
)

app = web.application(urls, globals())
render = web.template.render("templete/")
# 直接从Json数据库中读取数据
data_struct = {'data': DataPerpare(2).data}


# Store the session someplace we can access from anywhere
# This fixes the problem caused by the server refreshing,
# which arose due to webpy default debug mode.
web.config.session_parameters['timeout'] = 3600  # cookie timeout for 3600s
if not web.config.get('session'):
    # Define the initial session
    # Store the data in the directory './sessions'
    store = web.session.DiskStore('hosarg/data/sessions')
    session = web.session.Session(app, store, initializer={'login': 0})

    # Store it somewhere we can access
    web.config.session = session
else:
    # If it is already created, just use the old one
    session = web.config.session


def logged():
    '''判断是否已经登录'''
    if session.login == 1:
        return True
    else:
        return False


class Login(object):
    def GET(self):
        if logged():
            raise web.seeother('/index.html')
        else:
            return render.login('')

    def POST(self):
        name, passwd = web.input().name, web.input().passwd

        if name == 'arrange' and passwd == 'zxcdsaqwe321':
            session.login = 1
            return web.seeother('/index.html')
        else:
            session.login = 0
            return render.login('账号密码错误，请重试')


class Logout(object):
    def GET(self):
        session.kill()    # 清除session
        raise web.seeother('/login')


class Index(object):
    def GET(self):
        if logged():
            return render.index()
        else:
            raise web.seeother('/login')


class User(object):
    def GET(self):
        if logged():
            return render.user()
        else:
            raise web.seeother('/login')


class Depart(object):
    def GET(self):
        if logged():
            return render.depart()
        else:
            raise web.seeother('/login')


class Ward(object):
    def GET(self):
        if logged():
            return render.ward()
        else:
            raise web.seeother('/login')


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
            data_struct['data']).slice_people(data['data'])
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


class APIBackup(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        data = dataprepare.backup_get_data(data_struct['data'])
        return json.dumps(data)

    def POST(self):
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        dataprepare.backup_set_data(data_struct['data'], data)
        return json.dumps({'status': 'ok'})


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
        data = hosarg.utils.json.read_json(file_path)
        return json.dumps(data)

    def POST(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLineData.json'
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        hosarg.utils.json.write_json(data, file_path)
        return json.dumps({'status': 'ok'})


class TLinePre(object):
    def GET(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLinePre.json'
        data = hosarg.utils.json.read_json(file_path)
        return json.dumps(data)

    def POST(self):
        web.header('Content-Type', 'application/json')
        web.header('Access-Control-Allow-Origin', '*')
        base_path = data_struct['data']['base_path']
        file_path = base_path + 'json/TLinePre.json'
        data = str(web.data(), encoding='utf-8')
        data = json.loads(data)
        hosarg.utils.json.write_json(data, file_path)
        return json.dumps({'status': 'ok'})


application = app.wsgifunc()

if __name__ == "__main__":
    app.run()
