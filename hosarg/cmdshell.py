# -*- coding: utf-8 -*-
# @Author:  SHLLL
# @email:   shlll7347@gmail.com
# @Date:    2018-09-17 17:21:51
# @License: MIT LICENSE
# @Last Modified by:   Mr.Shi
# @Last Modified time: 2018-09-24 21:27:00

import cmd
from colorama import init, Fore, Back, Style
from .utils import DataPerpare
from hosarg.arrange import DepartArrange, DepartAssist, WardArrange


class Shell(cmd.Cmd):
    """Interactive command line interface for project."""
    intro = '欢迎使用智能排班系统 输入help显示命令列表 \
输入help tutorial显示操作指南 输入quit退出系统\n'
    prompt = '> '

    def __init__(self):
        super().__init__()
        # 初始化colorama
        init()
        # 初始化一些变量
        self._data = None

    def _parse(self, arg):
        'Convert a series of zero or more numbers to an argument tuple'
        return tuple(map(int, arg.split()))

    def do_quit(self, arg):
        '退出系统命令'
        print('系统正在退出...')
        return True

    def do_dataprepare(self, arg):
        '准备读取数据'
        arg = self._parse(arg)
        if(len(arg) != 1):
            print(Fore.RED + '***输入了错误的参数个数' + Style.RESET_ALL)
            return
        if not(arg[0] > 0 and arg[0] < 3):
            print(Fore.RED + '***输入了错误的参数' + Style.RESET_ALL)
            return
        self._data = DataPerpare(*arg).data
        print('初始化数据成功')

    def do_departarrange(self, arg):
        '对科室数据进行排班'
        if not self._data:
            self._data = DataPerpare(2).data
        arg = self._parse(arg)
        if(len(arg) != 1):
            print(Fore.RED + '***输入了错误的参数个数' + Style.RESET_ALL)
            return
        DepartArrange(self._data, arg[0])

    def do_departassist(self, arg):
        '执行科室分组助手'
        if not self._data:
            self._data = DataPerpare(2).data
        arg = self._parse(arg)
        if(len(arg) != 1):
            print(Fore.RED + '***输入了错误的参数个数' + Style.RESET_ALL)
            return
        DepartAssist(self._data, arg[0])
        print(Fore.GREEN + '执行完毕！' + Style.RESET_ALL)

    def do_wardarrange(self, arg):
        '读取科室分组值班表'
        if not self._data:
            self._data = DataPerpare(2).data
        arg = self._parse(arg)
        if(len(arg) != 1):
            print(Fore.RED + '***输入了错误的参数个数' + Style.RESET_ALL)
            return
        WardArrange(self._data, arg[0])
        print(Fore.GREEN + '病房排班完毕！' + Style.RESET_ALL)

    def help_tutorial(self):
        print(Style.BRIGHT + '智能排课系统操作指南\n')
        print(Style.RESET_ALL + Fore.GREEN + '一、数据准备')
        print(Style.RESET_ALL + '当系统首次运行或需要更新人员数据时，可以执行"dataprepare 1",\
如无人员数据更新，则可以执行"dataprepare 2"，读取系统中已存储的数据')
        print(Style.RESET_ALL + Fore.GREEN + '二、科室分组')
        print(Style.RESET_ALL + '1.执行"departarrange+排班月份"即可执行排班排课操作，如\
"departassist 1810"，但是由于历史值班数据的缺失，会导致排班结果不正确，因此暂时停用')
        print('2.执行departassist+排班月份，如"departassist 1810"会输出一个指定月份的排班人员\
和该人员已排班的信息表')
        print(Style.RESET_ALL + Fore.GREEN + '三、病房排班')
        print(Style.RESET_ALL + '首先将排好的科室分组表命名为"科室分组.xlsx"以及请假信息存入\
xlsx中 ，然后执行"wardarrange 1810"会自动读入数据并进行病房分组')
