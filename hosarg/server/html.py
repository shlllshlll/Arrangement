'''
@Author: Mr.Shi
@Date: 2019-02-11 10:25:00
@License: MIT License
@Email: shlll7347@gmail.com
@Modified by: Mr.Shi
@Last Modified time: 2019-02-11 10:25:13
@Description:
'''


import web
import json
from ..utils import DataPerpare
from ..utils import dataprepare
from ..utils.datapreprocess import PersonData
from ..utils.datapreprocess.personDataApi import PersonDataApi
from ..arrange.wardarrangeAPI import WardArrangeAPI

data_struct = {'data': DataPerpare(2).data}
from .api import app_api

urls = (
    '/', 'Index',
    '/login', 'Login',
    '/logout', 'Logout',
    '/index.html', 'Index',
    '/user.html', 'User',
    '/depart.html', 'Depart',
    '/ward.html', 'Ward',
    '/tarrange.html', 'TArrange',
    '/api', app_api
)

app = web.application(urls, locals())
render = web.template.render("templete/")


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


class TArrange(object):
    def GET(self):
        if logged():
            return render.tarrange()
        else:
            raise web.seeother('/login')
