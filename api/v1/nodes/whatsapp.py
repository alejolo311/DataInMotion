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
from threading import Thread
from multiprocessing import Process
import multiprocessing
import threading
import uuid
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
    initializes a selenium browser and stores the cookies and LocalStorage
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
    browsers[instance_id].close()
    return jsonify(state=state, instance_id=instance_id)

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
    web_whatsapp.open_whatsapp_web()
    web_whatsapp.search_contact('3176923716')
    web_whatsapp.send_whatsapp_message('You are now registered to DataInMotion WhatsApp Service')
    web_whatsapp.close()
    return jsonify(message='your message was sent')
