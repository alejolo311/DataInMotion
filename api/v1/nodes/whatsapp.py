#!/usr/bin/python3
"""
Index route for nodes api
"""

import sys
sys.path.append('/usr/src/app')
from api.v1.nodes import app_nodes
from api.v1.auth import token_required
from api.v1.nodes.crontab_manager import updateCronTab
from api.v1.auth import send_email
from models import storage
from flask import jsonify, Response, request, render_template, send_file
from models.custom import CustomNode
from models.board import Board
from models.logger import Logger
from models.whatsapp_web import WebWhastapp
from models.user import User
from models.node_flow_test import instancedNode
import traceback
import json
import os
import time
from threading import Thread
from multiprocessing import Process
import multiprocessing
import threading
import uuid
import shutil
from selenium import webdriver
from PIL import Image
from io import BytesIO


browsers = {}

@app_nodes.route('/whatsapp_register')
@token_required
def start_register():
    """
    Create an instanced node
    initializes a selenium browser and stores the cookies and LocalStorage
    """
    instance_id = str(uuid.uuid4())
    instance = instancedNode({'id': instance_id}, instance_id)
    web_whatsapp = WebWhastapp(instance.id, {}, instance)
    web_whatsapp.start_browser()
    print("Browser started")
    QRUrl = web_whatsapp.auth()
    print("Auth passed")
    browsers[instance_id] = web_whatsapp
    return jsonify(url=QRUrl, instance_id=instance_id)
    # registered_user = self.wait_registration(self, url)

@app_nodes.route('/session_status',
                methods=['POST'],
                strict_slashes=False)
@token_required
def check_register_status():
    """
    Create an instanced node
    Check if the session is saved or not
    """
    instance_id = request.get_json()['instance_id']
    instance = instancedNode({'id': instance_id}, instance_id)
    with open('./api/running/{}.session'.format(instance_id), 'r') as session_file:
        # 'session_id'
        # 'url'
        session_data = json.loads(session_file.read())
    state = browsers[instance_id].wait_registration()
    path = f'./api/browsers/table'
    with open(path, 'r+') as table:
        tb = json.loads(table.read())
        tb[request.user] = instance_id
        table.seek(0)
        table.write(json.dumps(tb))
        table.truncate()
    time.sleep(4)
    browsers[instance_id].close()
    del browsers[instance_id]
    return jsonify(state=state, instance_id=instance_id)

@app_nodes.route('/whatsapp_sessions',
                methods=['GET'],
                strict_slashes=False)
@token_required
def check_session():
    """
    """
    path = '/usr/src/app/api/browsers'
    with open(f'{path}/table', 'r') as table_file:
        tb = json.loads(table_file.read())
        if request.user in tb.keys():
            return jsonify(state='true', session_id=tb[request.user].split('-')[0], os='Linux')
        else:
            return jsonify(state='false')

@app_nodes.route('/whatsapp_session',
                methods=['DELETE'],
                strict_slashes=False)
@token_required
def remove_session():
    """
    """
    path = '/usr/src/app/api/browsers'
    with open(f'{path}/table', 'r') as table_file:
        tb = json.loads(table_file.read())
        if request.user in tb.keys():
            session_id = tb[request.user]
            try:
                shutil.rmtree(f'{path}/{session_id}.selenium', ignore_errors=True)
                del tb[request.user]
            except Exception as e:
                print(e)
                return jsonify(error=e.args), 500
    with open(f'{path}/table', 'w') as new_table_file:
        new_table_file.write(json.dumps(tb))
    return jsonify(message='session deleted')

@app_nodes.route('/test_whatsapp_service',
                methods=['POST'],
                strict_slashes=False)
@token_required
def test_whatsapp():
    """
    """
    instance_id = request.get_json()['instance_id']
    phone_number = request.get_json()['phone']
    instance = instancedNode({'id': instance_id}, instance_id)
    web_whatsapp = WebWhastapp(instance_id, {}, instance)
    web_whatsapp.start_browser()
    if web_whatsapp.open_whatsapp_web() == 'failed':
        # remove_session()
        web_whatsapp.remove_session(request.user)
        web_whatsapp.close()
        return jsonify(error='failed to store the session')
    web_whatsapp.search_contact(phone_number)
    web_whatsapp.send_whatsapp_message('*You are now registered to DataInMotion WhatsApp Service*')
    web_whatsapp.close()
    return jsonify(message='your message was sent')
