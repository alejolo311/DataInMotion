#!/usr/bin/python3
"""
Index route por nodes api
"""

from api.v1.nodes import app_nodes
from flask import jsonify, request, render_template, Response
import base64
import json
import os
import time


@app_nodes.route('/status', methods=['GET'], strict_slashes=False)
def status():
    """
    Returns OK status
    """
    return jsonify(status='OK'), 200


@app_nodes.route('/web_whatsapp_verify', methods=['GET'], strict_slashes=False)
def get_qrcode():
    """
    show the qrcode
    """
    _id = request.args.to_dict()['id']
    # img_str = ''
    count = 0
    while True:
        try:
            with open('/usr/src/app/api/verification_images/{}.png'
                      .format(_id), 'rb') as image:
                img_str = base64.b64encode(image.read())
                img_str = img_str.decode('utf-8')
                return render_template('shot.html', data=img_str)
        except Exception as e:
            if count == 6:
                return 'Failed'
            else:
                time.sleep(4)
                count += 1
                pass


@app_nodes.route('/gifs', methods=['GET'], strict_slashes=False)
def gifs():
    """
    list of gifs
    """
    with open('./api/verification_images/{}.json'
              .format('test'), 'r') as image:
        urls = json.loads(image.read())
    return Response(json.dumps(urls), mimetype='application/json')


@app_nodes.route('/choose_gif',
                 methods=['GET'],
                 strict_slashes=False)
def choose_gif():
    """
    show the qrcode
    """
    _id = request.args.to_dict()['id']
    # img_str = ''
    with open('./api/verification_images/{}.json'.format(_id), 'r') as image:
        urls = json.loads(image.read())
        with open('./api/verification_images/{}.json'
                  .format('test'), 'w') as test:
            test.write(json.dumps(urls))
        return render_template('choose_gif.html', gifs=urls, id=_id)


@app_nodes.route('/gif_selection', methods=['GET'], strict_slashes=False)
def selected_gif():
    """
    select a gif an save the selection in conf by id
    """
    _id = request.args.to_dict()['id']
    pos = request.args.to_dict()['pos']
    with open('./api/verification_images/{}.conf'.format(_id), 'w') as conf:
        print('saving', json.dumps({'id': _id, 'pos': pos}))
        conf.write(json.dumps({'id': _id, 'pos': pos}))
        return 'success'


@app_nodes.route('/source', methods=['GET'], strict_slashes=False)
def source():
    """
    Debug source html
    """
    dirs = os.listdir('./api/screenshots')
    dirs = sorted(dirs)
    return render_template('screenshot.html', dirs=dirs)


@app_nodes.route('/screenshot', methods=['GET'], strict_slashes=False)
def shot():
    """
    Screenshot
    """
    file = request.args.to_dict()['file']
    with open('./api/screenshots/{}'.format(file), 'rb') as image:
        img_str = base64.b64encode(image.read())
        img_str = img_str.decode('utf-8')
        return render_template('shot.html', data=img_str)


@app_nodes.route('/check_response', methods=['GET'], strict_slashes=False)
def check_running_node():
    """
    check running status
    """
    # print(request.args)
    # print(request.get_json())
    node_id = request.args.to_dict()['id']
    try:
        with open('./api/running/{}.test'.format(node_id), 'r') as test:
            test_file = json.loads(test.read())
            if test_file['status'] == 'completed':
                os.remove('./api/running/{}.test'.format(node_id))
            return Response(json.dumps(test_file), mimetype='application/json')
    except Exception as e:
        print(e)
        return Response(
            json.dumps({'status': 'error'}),
            mimetype='application/json')
