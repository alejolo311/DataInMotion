#!/usr/bin/python3

from models import storage
from models.custom import CustomNode
from models.board import Board
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from crontab import CronTab
import getpass
import json
import os

def updateCronTab(node, sync=None):
    """
    Uses crontab to manage the service triggers
    Found the job by Comment
    and update the values
    cal:
        - the date from the client
    sync:
        - the actual time from the client
    
    """
    cal = json.loads(node.analisis_params)['date']
    params = json.loads(node.analisis_params)
    sys_time = None
    if sync:
        sys_time = datetime.now()
        print('14: ', *cal, sync, sys_time)
        # check if the time to save is before the actual
        print(type(cal[0]))
        print(datetime(*cal))
        if datetime(*cal) < sys_time:
            print('You are saving a date before the actual')
        month_diff = sys_time.month - sync[1]
        day_diff = sys_time.day - sync[2]
        hour_diff = sys_time.hour - sync[3]
        def_time = datetime(*cal) + \
                   timedelta(days=day_diff, hours=hour_diff) + \
                   relativedelta(months=month_diff)
    else:
        try:
            print(params['def_date'].split('.')[0])
            def_time = datetime.strptime(params['def_date'].split('.')[0].replace('-','/'), '%Y/%m/%d %H:%M:%S')
        except Exception as e:
            print(e)
            print('def_date, not found in node')
            def_time = datetime(*cal)
    cmd = '/usr/bin/python3 {}/api/v1/nodes/job.py {} > /usr/src/app/date_test.txt 2>&1'
    cmd = cmd.format(os.getcwd(), node.id)
    cron = CronTab(user='root')
    exists = False
    print('Parameters for the Cron Job')
    print(json.dumps(params, indent=2))
    print('Definitive Time', def_time)
    print('System Time', sys_time)
    for job in cron:
        if job.comment == node.id:
            if 'active' not in params or params['active'] == False:
                print('desactive this cron job')
                cron.remove(job)
            else:
                job.setall(def_time)
                if 'frequency' in params:
                    print(params['frequency'])
                    if params['frequency'] == 'minute':
                        job.minute.every(10)
                        job.hour.every(1)
                        job.day.every(1)
                    elif params['frequency'] == 'hourly':
                        job.hour.every(1)
                        job.day.every(1)
                    elif params['frequency'] == 'daily':
                        job.day.every(1)
                        job.month.every(1)
                    elif params['frequency'] == 'weekly':
                        job.day.every(7)
                        job.month.every(1)
                    elif params['frequency'] == 'monthly':
                        job.month.every(1)
            exists = True
    if not exists and 'active' in params:
        job = cron.new(command=cmd, comment=node.id)
        job.setall(def_time)
        if 'frequency' in params:
            print(params['frequency'])
            if params['frequency'] == 'minute':
                job.minute.every(10)
                job.hour.every(1)
                job.day.every(1)
            elif params['frequency'] == 'hourly':
                job.hour.every(1)
                job.day.every(1)
            elif params['frequency'] == 'daily':
                job.day.every(1)
                job.month.every(1)
            elif params['frequency'] == 'weekly':
                job.day.every(7)
                job.month.every(1)
            elif params['frequency'] == 'monthly':
                job.month.every(1)
    cron.write()
    os.system('/etc/init.d/cron start')
    print(def_time)
    return str(def_time)

def deleteCronTab(node, sync=None):
    """
    update crontab to remove the node services
    """
    return True

def remove_orphan_jobs():
    """
    Check all service nodes and compares to the existing jobs in the system
    """
    cron = CronTab(user='root')
    service_nodes = storage.filter_by(CustomNode, 'type', 'service')
    print('All services')
    comments = [job.comment for job in cron]
    jobs = [node.id for node in service_nodes]
    for i, comment in enumerate(comments):
        if not comment in jobs:
            cron.remove(cron[i])
    # for service in services:
    #     board = storage.get(Board, service.board_id)
    #     print(service.name, service.id, board.name)
    


def list_cron_jobs():
    """
    List all cron jobs in the system
    """
    cron = CronTab(user='root')
    print('--------------------------')
    print('    Jobs in system for root\n')
    for job in cron:
        print('\t', job.comment)
    print('--------------------------')
    remove_orphan_jobs()