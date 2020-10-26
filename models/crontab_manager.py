#!/usr/bin/python3

from datetime import datetime, timedelta
from crontab import CronTab
import getpass
import json
import os

def get_next_job(node, sync=None):
    """
    Uses crontab to manage the service triggers
    Found the job by Comment
    and update the values
    """
    sync = sync.split(' ')
    sys_time = datetime.now()
    print(sys_time, sync)
    day_diff = sys_time.day - int(sync[2])
    hour_diff = sys_time.hour - int(sync[3])
    print(day_diff, hour_diff)
    params = json.loads(node.analisis_params)
    cron = CronTab(user='root')
    for job in cron:
        if job.comment == node.id:
            if 'active' in params and params['active']:
                print('the job will run in')
                schedule = job.schedule(date_from=datetime.now())
                next_time = schedule.get_next(datetime) - timedelta(days=day_diff, hours=hour_diff)
                print(next_time, type(next_time))
                return str(next_time)
    return None
