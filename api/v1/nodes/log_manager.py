#!/usr/bin/python3
"""
Logger instances manager
"""

import json
import glob
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


def remove_run(board_id, instance_id):
    """
    Removes an instance id from the table
    """
    with open('/usr/src/app/api/logs/table', 'r') as logs_file:
        tb = json.loads(logs_file.read())
        if not board_id in tb:
            tb[board_id] = []
        tb[board_id].append(instance_id)
    try:
        del tb[board_id][tb[board_id].index(instance_id)]
        os.remove(f'/usr/src/app/api/running/{instance_id}.test')
    except Exception as e:
        print(e)
    with open('/usr/src/app/api/logs/table', 'w') as logs_file:
        logs_file.write(json.dumps(tb))

def keep_runs_limit(board_id):
    """
    Check the latest created files
    and delete the extras to keep it in 5 logs
    """
    with open('/usr/src/app/api/logs/table', 'r') as logs_file:
        tb = json.loads(logs_file.read())
        if not board_id in tb:
            tb[board_id] = []
    # check the creating date
    files = glob.glob('/usr/src/app/api/running/*.test')
    files.sort(key=os.path.getmtime)
    try:
        print('logs files:')
        print([file for file in files])
        print(tb[board_id])
        log_path = f'/usr/src/app/api/running'
        indexes = [files.index(f'{log_path}/{log}.test') for log in tb[board_id]]
        indexes.sort()
        print(indexes)
        test_files = [files[index] for index in indexes]
        print(test_files)
        print(test_files[-5:-1])
        test_files.reverse()
        tb[board_id] = [fil.split('.')[0].split('/')[-1] for fil in test_files[:5]]
        for fil in test_files[5:]:
            remove_run(board_id, fil.split('.')[0].split('/')[-1])
    except Exception as e:
        print(e)
    with open('/usr/src/app/api/logs/table', 'w') as logs_file:
        logs_file.write(json.dumps(tb))

def get_runs(board_id, sync_date):
    """
    Get all the run for the board selected
    """
    keep_runs_limit(board_id)
    sync_date = [int(data) for data in sync_date.split(',')]
    with open('/usr/src/app/api/logs/table', 'r') as logs_file:
        tb = json.loads(logs_file.read())
        if not board_id in tb:
            tb[board_id] = []
        runs = []
        for run in tb[board_id]:
            with open(f'/usr/src/app/api/running/{run}.test', 'r') as log:
                logger = json.loads(log.read())
                name = logger['node_name']
                if type(name) == list:
                    name = name[0]
                
                sys_time = datetime.now()
                # check if the time to save is before the actual
                print(datetime(*logger['date']))
                if datetime(*logger['date']) < sys_time:
                    print('You are saving a date before the actual')
                month_diff = sys_time.month - sync_date[1]
                day_diff = sys_time.day - sync_date[2]
                hour_diff = sys_time.hour - sync_date[3]
                def_time = datetime(*logger['date']) - \
                        timedelta(days=day_diff, hours=hour_diff) - \
                        relativedelta(months=month_diff)
                runs.append({
                    'name': name,
                    'id': run,
                    'state': logger['status'],
                    'date': str(def_time)
                })
        return runs

def get_log(instance_id):
    """
    Get the logg object for the instance_id
    """
    with open(f'/usr/src/app/api/running/{instance_id}.test') as log_file:
        log = json.loads(log_file.read())
        return log