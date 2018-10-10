# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-20 14:48:44
# @License: MIT LICENSE
# @Last Modified by:   SHLLL
# @Last Modified time: 2018-10-10 18:54:05

import math
import datetime
import calendar
from random import shuffle
from openpyxl import Workbook
from hosarg.utils.datapreprocess import PersonData


class WardArrangeAPI(object):

    def __init__(self, data):
        self._data = data

    def update_person_data(self, data):
        departData = data['data']
        month = data['month']
        title = data['title']
        for idx, people in enumerate(departData):
            for val in people:
                # 读取排班人员
                val = val.replace('*', '').\
                    replace('#', '').replace('^', '')
                self._fresh_person_history(val, idx + 1, month, title[idx])
        PersonData(self._data).working(3)

    def slice_people(self, departs):
        wards = []

        # 预处理数据
        shuffle(departs[0])
        shuffle(departs[1])
        shuffle(departs[2])
        shuffle(departs[3])
        shuffle(departs[4])
        shuffle(departs[5])
        luzhui = departs[0]
        jingzhui = departs[1]
        guanjie = departs[2]
        chuangshang = departs[3]
        jizhui = departs[4]
        yaozhui = departs[5]

        # 首先分配骨1病房
        ward1 = []
        ward1.extend(jingzhui[:2])
        ward1.extend(guanjie[:math.floor(len(guanjie) / 2)])
        ward1.extend(jizhui[:math.floor(len(jizhui) / 2)])
        wards.append(ward1)

        # 分配骨2病房
        ward2 = []
        ward2.extend(jizhui[math.floor(len(jizhui) / 2):])
        ward2.extend(yaozhui)
        wards.append(ward2)

        # 分配骨3病房
        ward3 = []
        ward3.extend(guanjie[math.floor(len(guanjie) / 2):])
        ward3.extend(chuangshang)
        wards.append(ward3)

        # 分配骨4病房
        ward4 = []
        ward4.extend(luzhui)
        ward4.extend(jingzhui[2:])
        wards.append(ward4)

        # print(ward1)
        # print(ward2)
        # print(ward3)
        # print(ward4)

        return wards

    def arrange_ward(self, wards, date, startDay, endDay, leaveData):
        # 首先对时间进行处理
        date = int(date)
        if startDay == '':
            startDay = None
        if endDay == '':
            endDay = None
        # 分离获取年月
        year = 2000 + int(date / 100)
        month = date % 100

        # 获取请假人员的名单
        leavePeopleData = []
        for item in leaveData:
            leavePeopleData.append(item['name'])

        if startDay and endDay:
            month_range = [i for i in range(int(startDay), int(endDay) + 1)]
        else:
            # 获取本月有多少天
            month_range = calendar.monthrange(year, month)[1]
            month_range = [i for i in range(1, month_range + 1)]

        # print('-----------')
        people_in_wards = [month_range]
        # 取出每一个病房中的人员名单
        for ward in wards:
            people_in_ward = []
            people_dict = []
            people_leave = []
            # 将人员名单转换为一个dict
            for person in ward:
                people_dict.append(
                    {'name': person, 'history': [], 'weekday': []})
            # print('++++++++')
            # print('/'.join([i['name'] for i in people_dict]))
            # 遍历本月的每一天
            for day in month_range:
                cur_date = datetime.date(year, month, day)
                # 获取当前是周几
                wkd = cur_date.isoweekday()
                is_weekdat = 1 if wkd < 6 else 0
                person = self._get_a_person(
                    day,
                    is_weekdat,
                    people_dict,
                    leavePeopleData,
                    leaveData,
                    people_leave
                )
                people_in_ward.append(person)
            # print(people_in_ward)
            people_in_wards.append(people_in_ward)

        return people_in_wards

    def _fresh_person_history(self, name, depart_id, month, title):
        # 首先获取当前系统的人员数据表
        people_data = self._data['peopledata']
        # 从人员数据表中提取人员名单构成list
        name_list = [i['name'] for i in people_data]
        try:
            # 判断名字是否在数据库中
            person_idx = name_list.index(name)
        except ValueError:
            # 不在直接退出
            return
        else:
            person = people_data[person_idx]
            flag = False
            # 遍历history中记录的科室
            for idx, history in enumerate(person['history']):
                # 如果发现科室已经被记录到历史中
                if history['id'] == depart_id:
                    try:
                        history['month'].index(month)
                    except ValueError:
                        return
                    else:
                        history['month'].append(month)
                        flag = True
                        break
            if flag is False:
                person['history'].append(
                    {'month': [month], 'id': depart_id, 'name': title})

    def _find_a_person_in_leave(self, name, day, leaveNameList, leaveData):
        # 判断一个人是否在假期之中
        try:
            idx = leaveNameList.index(name)
        except ValueError:
            return False
        else:
            startDay = int(leaveData[idx]['start'])
            endDay = int(leaveData[idx]['end'])
            if (day >= startDay) and (day <= endDay):
                return True
            else:
                return False

    def _get_a_person(self, day, weekday, people,
                      leaveNameList, leaveData, leaveTemp):

        # 维护请假列表
        for idx, item in enumerate(leaveTemp):
            name = item['name']
            res = self._find_a_person_in_leave(
                name,
                day,
                leaveNameList,
                leaveData
            )
            if res is False:
                item = leaveTemp.pop(idx)
                people.insert(0, item)

        result = None
        for idx, person in enumerate(people):
            # 如果当前的人在请假列表里
            res = self._find_a_person_in_leave(
                person['name'],
                day,
                leaveNameList,
                leaveData
            )
            if res is True:
                item = people.pop(idx)
                leaveTemp.append(item)
                continue

            # 如果尚未值过班
            if not person['history']:
                result = person['name']
                person['history'].append(day)
                person['weekday'].append(weekday)
                item = people.pop(idx)
                people.append(item)
                break
                # else:
                #     item = people.pop(idx)
                #     people.append(item)
            else:
                lst_day = person['history'][-1]
                lst_wkd = person['weekday'][-1]
                if ((day - lst_day > 5) and (weekday - lst_wkd != 0)):
                    result = person['name']
                    person['history'].append(day)
                    person['weekday'].append(weekday)
                    item = people.pop(idx)
                    people.append(item)
                    break

        # 如果找了一圈都没有满足条件的指定为第一个
        if not result:
            item = people.pop(0)
            people.append(item)
            result = item['name']

        return result

    def _save_to_xslx(self, data, file_name='病房排班表.xlsx'):
        wb = Workbook()
        ws = wb.active

        # 首先添加列名称
        col_name = ['日期', '骨1', '骨2', '骨3', '骨4']
        ws.append(col_name)

        # 接着添加人员信息
        for day in range(0, len(data[0])):
            ws.append([day + 1, data[0][day], data[1][day],
                       data[2][day], data[3][day]])
        wb.save(self._data['base_path'] + 'result/' + file_name)
