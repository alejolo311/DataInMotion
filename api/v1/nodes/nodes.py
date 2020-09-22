#!/usr/bin/python3
"""
Index route for nodes api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request, render_template, send_file
from models.custom import CustomNode
from models.board import Board
from models.logger import Logger
from models.user import User
from models.node_flow_test import instancedNode
import traceback
import json
import os
import sys
from threading import Thread
from multiprocessing import Process
import multiprocessing
import threading
import uuid
from selenium import webdriver
from PIL import Image
from io import BytesIO


THREADS = []


@app_nodes.route('/nodes/<node_id>',
                 methods=['GET'],
                 strict_slashes=False)
def nodes(node_id):
    """
    Returns list of nodes by user_id
    """
    node = storage.get(CustomNode, node_id)
    resp = node.to_dict()
    # resp = json.dumps(resp)
    return Response(resp, mimetype='application/json')

@app_nodes.route('/nodes/<node_id>/savecolor',
                 methods=['POST'], strict_slashes=False)
def nodes_savecolor(node_id):
    """
    Returns list of nodes by user_id
    """
    node = storage.get(CustomNode, node_id)
    node.color = request.get_json()['color']
    node.save()
    return Response(json.dumps({'status': 'saved'}),
                    mimetype='application/json', status=200)


@app_nodes.route('/nodes/<node_id>/save_analisis_params',
                 methods=['POST'], strict_slashes=False)
def save_analisis_data(node_id):
    """
    Saves the incoming object analisis data attribute of node_id to db
    """
    an_data = []
    try:
        an_data = request.get_json()['params']
    except Exception as e:
        # print(e)
        pass
    node = storage.get(CustomNode, node_id)
    if node:
        node.analisis_params = json.dumps(an_data)


def run_thread(node_id):
    """
    Run threaded node
    """
    print('Start Threaded process')
    try:
        node = storage.get(CustomNode, node_id)
        logger = Logger(node.user_id)
        test_file = {
            'status': 'started',
            'node_id': node_id,
            'messages': ['Starting flow']
        }
        with open('./api/running/{}.test'.format(node_id), 'w') as test:
            test.write(json.dumps(test_file))
        resp = node.run_node_task(({}, {}), logger, node_id)
        logger_content = str(logger)
        with open('./api/running/{}.test'.format(node_id), 'r') as test:
            test_file = json.loads(test.read())
        test_file['logger'] = dict(logger.json())
        test_file['status'] = 'completed'
        test_file['node_id'] = node_id
        with open('./api/running/{}.test'.format(node_id), 'w') as test:
            test.write(json.dumps(test_file))
        logger.reset()
        print('Finishing thread')
        # thre = threading.currentThread()
        storage.close()
        # threading.Event().set()
        # Thread.join(thre, None)
    except Exception as e:
        print('Thread Fail:\n\t', e)
        traceback.print_exc()
        # threading.currentThread().join()
    # dict(logger.json())

def create_node_instances(board_id, node_id):
    """
    Create JSON instances for the board and theri links
    and return the id for the caller node
    """
    board = storage.get(Board, board_id)
    nodes = {}
    nods = json.loads(board.nodes)
    instance_id = str(uuid.uuid4())
    for key in nods.keys():
        js = json.loads(storage.get(CustomNode, key).to_dict())
        nodes[key] = instancedNode(js, instance_id)
    return nodes, nodes[node_id]
    


def run_instanced_nodes(nodes, starter):
    """
    Test for running instanced nodes
    """
    try:
        logger = Logger(starter.id)
        resp = starter.run_node_task(({}, {}), logger, starter.id, nodes)
        test_file = {
            'status': 'started',
            'node_id': starter.id,
            'instance': starter.instance_id,
            'messages': []
            }
        with open('./api/running/{}.test'.format(starter.instance_id), 'w') as test:
            test.write(json.dumps(test_file))
        with open('./api/running/{}.test'.format(starter.instance_id), 'r') as test:
            test_file = json.loads(test.read())
        test_file['logger'] = dict(logger.json())
        test_file['status'] = 'completed'
        test_file['node_id'] = starter.id
        with open('./api/running/{}.test'.format(starter.instance_id), 'w') as test:
            test.write(json.dumps(test_file))
    except Exception as e:
        traceback.print_exc()
        test_file = {
            'status': 'completed',
            'node_id': '1234',
            'instance': '1234',
            'messages': ['failed']
            }
        with open('./api/running/{}.test'.format(starter.instance_id), 'w') as test:
            test.write(json.dumps(test_file))

@app_nodes.route('/nodes/<node_id>/run',
                 methods=['GET'], strict_slashes=False)
def run_node(node_id):
    """
    run the node proccesses and conections
    """
    node = storage.get(CustomNode, node_id)
    board_id = node.board_id
    nodes, starter = create_node_instances(board_id, node_id)
    # starter.run_node_task()
    # Thread(target=run_thread, args=(node_id, )).start()
    print('*****************')
    print('Threadings Count:')
    # print('\t', multiprocessing.activeCount())
    print('*****************')
    Process(name=starter.instance_id, target=run_instanced_nodes, args=(nodes, starter)).start()
    for thread in multiprocessing.active_children():
        print(thread.name)
    return Response(json.dumps({
        'status': 'started',
        'nodeId': starter.id,
        'instance': starter.instance_id
        }), mimetype='application/json',
            status=200)

class SessionRemote(webdriver.Remote):
    """
    Session Handler for Firefox drivers
    """
    def start_session(
        self, desired_capabilities,
        browser_profile=None):
        """
        Set minimun attributes
        """
        self.w3c = True


@app_nodes.route('/test/<test_id>/stop',
                 methods=['GET'], strict_slashes=False)
def stop_thread(test_id):
    """
    run the node proccesses and conections
    """
    import time
    print('*****************')
    print('Stoping Thread:', test_id)
    # print('\t', multiprocessing.activeCount())
    print('*****************')
    for thread in multiprocessing.active_children():
        print(thread.name)
        if thread.name == test_id:
            thread.terminate()
            # thread.close()
            thread.join()
            time.sleep(3)
            try:
                print('Alive?', str(thread.is_alive()))
            except Exception as e:
                print(e)
    try:
        with open(
            './api/running/{}.session'.format(
                test_id), 'r') as session_file:
            conf = json.loads(session_file.read())
            print('getting selenium unclosed session')
            driver = SessionRemote(
                command_executor=conf['url'],
                desired_capabilities={})
            driver.session_id = conf['session_id']
            # print(dir(driver))
            # print(json.dumps(dict(driver.__dict__), indent=2))
            # print('PID: ', driver.service.process.pid)
            png = driver.get_screenshot_as_png()
            im = Image.open(BytesIO(png))
            #   im.save('./api/screenshots/stop_result.png')
            driver.close()
            # driver.quit()
    except Exception as e:
        traceback.print_exc()
        print('Session closing failed:', e)
    try:
        file_src = './api/running/media/'
        list_dir = os.listdir(file_src)
        for direct in list_dir:
            if test_id in direct:
                try:
                    os.remove('{}/{}'.format(file_src, direct))
                    print('media removed')
                except Exception as e:
                    pass
                    #print("Can't remove png file {}".format(test_id), e)
    except Exception as e:
        print(e)
    print('*****************')
    print('Threadings Count:')
    # print('\t', threading.activeCount())
    print('*****************')
    for thread in multiprocessing.active_children():
        print(thread.name)
    return 'success'
    

@app_nodes.route('/nodes/<node_id>/add_connection',
                 methods=['POST'], strict_slashes=False)
def add_connection(node_id):
    """
    Add a connection to the given id
    """
    node = storage.get(CustomNode, node_id)
    new_connection = request.get_json()['con_id']
    typ = request.get_json()['type']
    if typ == 'out':
        outnodes = json.loads(node.outnodes)
        if new_connection not in outnodes:
            outnodes.append(new_connection)
        node.outnodes = json.dumps(outnodes)
    else:
        innodes = json.loads(node.innodes)
        if new_connection not in innodes:
            innodes.append(new_connection)
        node.innodes = json.dumps(innodes)
    node.save()
    return Response({'success': 'OK'}, status=200)


@app_nodes.route('/nodes/<node_id>/del_connection',
                 methods=['DELETE'], strict_slashes=False)
def del_connection(node_id):
    """
    Delete the out
    """
    typ = request.get_json()['type']
    conn = request.get_json()['con_id']
    node = storage.get(CustomNode, node_id)
    # print(typ, conn, node.id)
    if typ == 'out':
        # print('')
        outnodes = json.loads(node.outnodes)
        if conn in outnodes:
            # print('remove', conn)
            del outnodes[outnodes.index(conn)]
        node.outnodes = json.dumps(outnodes)
    if typ == 'in':
        # print('')
        innodes = json.loads(node.innodes)
        if conn in innodes:
            # print('remove', conn)
            del innodes[innodes.index(conn)]
        node.innodes = json.dumps(innodes)
    node.save()
    return Response({'state': 'Connection removed'}, status=200)


def load_templates():
    """
    load templates from .dim template file
    """
    with open('./api/node_templates/templates.dim', 'r') as templates:
        temps = json.loads(templates.read())
        return temps


def copy_node(board, node, data=None, complete=False):
    """
    Copy a node
    """
    new_node = CustomNode()
    in_node = node
    # print(in_node)
    del in_node['id']
    sample_keys = in_node.keys()
    for key in sample_keys:
        val = in_node[key]
        if type(val) == dict or type(val) == list:
            val = json.dumps(val)
        setattr(new_node, key, val)
    if complete:
        new_node.innodes = json.dumps(node['innodes'])
        new_node.outnodes = json.dumps(node['outnodes'])
    else:
        new_node.innodes = json.dumps([])
        new_node.outnodes = json.dumps([])
    if data:
        new_node.data = json.dumps(data)
    new_node.analisis_mode = node['analisis_mode']
    new_node.board_id = board.id
    new_node.user_id = board.user_id
    new_node.save()
    nodes = json.loads(board.nodes)
    nodes[new_node.id] = {'x': 20, 'y': 50}
    board.nodes = json.dumps(nodes)
    board.save()
    return new_node


@app_nodes.route('/boards/<board_id>/create_node', methods=['POST'],
                 strict_slashes=False)
def creates_new_node(board_id):
    """
    Creates a new node an likit to board id and user id
    """
    typo = request.get_json()['type']
    board = storage.get(Board, board_id)
    user_id = board.user_id
    # print(user_id)
    nodes = load_templates()
    if typo in nodes['nodes'].keys():
        js = request.get_json()
        if 'data' in js.keys():
            n_node = copy_node(board, nodes['nodes'][typo], js['data'])
        else:
            n_node = copy_node(board, nodes['nodes'][typo])
        return Response(
            json.dumps(json.loads(n_node.to_dict())),
            mimetype='application/json', status=200)
    new_node = CustomNode()
    new_node.name = 'New'
    new_node.user_id = user_id
    new_node.board_id = board_id
    if 'whatsapp' in typo:
        new_node.work_type = 'sender'
        new_node.name = typo
    new_node.save()
    nodes = json.loads(board.nodes)
    nodes[new_node.id] = {'x': 20, 'y': 60}
    board.nodes = json.dumps(nodes)
    board.save()
    # template = render_template('node.html',
    # nodes=[json.loads(new_node.to_dict())], )
    return Response(json.dumps(json.loads(new_node.to_dict())),
                    mimetype='application/json', status=200)


@app_nodes.route('/nodes/<node_id>', methods=['DELETE'], strict_slashes=False)
def delete_node(node_id):
    """
    Delete a node instance, recursively
    and all references in any node at the board
    """
    try:
        node = storage.get(CustomNode, node_id)
        board = storage.get(Board, node.board_id)
        nodes = json.loads(board.nodes)
        for n_id in nodes:
            nod = storage.get(CustomNode, n_id)
            nod_inns = json.loads(nod.innodes)
            if node.id in nod_inns:
                del nod_inns[nod_inns.index(node.id)]
            nod_outs = json.loads(nod.outnodes)
            if node.id in nod_outs:
                del nod_outs[nod_outs.index(node.id)]
            nod.innodes = json.dumps(nod_inns)
            nod.outnodes = json.dumps(nod_outs)
            nod.save()
        if node_id in nodes:
            del nodes[node_id]
        board.nodes = json.dumps(nodes)
        board.save()
        storage.delete(node)
        return Response('deleted', status=200)
    except Exception as e:
        return Response(str(e), status=500)


@app_nodes.route('/nodes/<node_id>/save', methods=['POST'],
                 strict_slashes=False)
def save_entire_node(node_id):
    """
    saves the entire node object
    """
    in_node = request.get_json()
    node = storage.get(CustomNode, node_id)
    sample_keys = json.loads(node.to_dict()).keys()
    # print(in_node)
    if 'type' not in in_node:
        node.type = 'custom'
    for key in sample_keys:
        if key == 'analisis_mode':
            if key not in in_node:
                setattr(node, key, '')
        if key not in in_node:
            # print('excluding', key)
            continue
        val = in_node[key]
        if type(val) == dict or type(val) == list:
            val = json.dumps(val)
        setattr(node, key, val)
    print('Saved node\n', node.to_dict())
    node.save()
    return Response(json.dumps({'id': node_id}), status=200,
                    mimetype='application/json')


@app_nodes.route('/users/<board_id>/boards_nodes', methods=['GET'],
                 strict_slashes=False)
def get_boards_nodes(board_id):
    """
    return a list ob boards an their node ids
    """
    board = storage.get(Board, board_id)
    user = storage.get(User, board.user_id)
    boards = storage.all(Board)
    bs = {}
    for b in boards.values():
        # print(b)
        if b.user_id == user.id:
            bs[b.id] = {}
            bs[b.id]['nodes'] = []
            # print(b.nodes)
            for node in json.loads(b.nodes).keys():
                print(node)
                n = storage.get(CustomNode, node)
                if n is not None:
                    bs[b.id]['nodes'].append({'name': n.name, 'id': n.id})
            bs[b.id]['name'] = b.name
    # print(bs)
    return Response(json.dumps(bs), mimetype='application/json', status=200)


@app_nodes.route('/nodes/<node_id>/copy_to/<board_id>', methods=['GET'],
                 strict_slashes=False)
def copy_node_to_board(node_id, board_id):
    """
    create a new node based on an existin one from other board
    """
    node = storage.get(CustomNode, node_id)
    new_node = CustomNode()
    in_node = json.loads(node.to_dict())
    sample_keys = json.loads(node.to_dict()).keys()
    # print(in_node)
    del in_node['id']
    for key in sample_keys:
        if key in in_node:
            val = in_node[key]
            if type(val) == dict or type(val) == list:
                val = json.dumps(val)
            setattr(new_node, key, val)
    new_node.api_url = in_node['api_url']
    new_node.innodes = json.dumps([])
    new_node.outnodes = json.dumps([])
    new_node.board_id = board_id
    new_node.save()
    board = storage.get(Board, board_id)
    nodes = json.loads(board.nodes)
    nodes[new_node.id] = {'x': 20, 'y': 50}
    board.nodes = json.dumps(nodes)
    board.save()
    return Response('success', status=200)
