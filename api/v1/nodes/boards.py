#!/usr/bin/python3
"""
Index route for boards api
"""

from api.v1.nodes import app_nodes
from api.v1.nodes.log_manager import get_runs, get_log
from models import storage
from flask import jsonify, Response, request, render_template
from models.custom import CustomNode
from models.user import User
from models.board import Board
from api.v1.auth import token_required
from api.v1.auth.auth import send_email
from api.v1.nodes.nodes import copy_node
import json


@app_nodes.route('/boards/<board_id>', methods=['GET'], strict_slashes=False)
def return_board(board_id):
    board = {}
    try:
        board = json.loads(storage.get(Board, board_id).to_dict())
        # with open('boards/Board.' + board_id, 'r') as bo:
        #     board = json.loads(bo.read())
    except Exception as e:
        print(e)
    return Response(json.dumps(board), mimetype='application/json')

@app_nodes.route('/boards/<board_id>/', methods=['POST'], strict_slashes=False)
def boards(board_id):
    """
    Returns list of nodes by user_id
    """
    # # print(request.data)
    try:
        # print(request.get_json())
        board = storage.get(Board, board_id)
        board.nodes = json.dumps(request.get_json()['nodes'])
        board.save()
        # with open('boards/Board.' + board_id, 'w') as board:
        #     board.write(json.dumps(request.get_json()));
        # # print(dir(request))
    except Exception as e:
        print(e)
    return Response({'ok': 'yes'}, mimetype='application/json')


@app_nodes.route('/boards/<board_id>/save_name',
                 methods=['POST'],
                 strict_slashes=False)
def save_name(board_id):
    """
    Saves the name for the board
    """
    board = storage.get(Board, board_id)
    board.name = request.get_json()['name']
    board.save()
    return Response(board.to_dict(), status=200)


@app_nodes.route('/boards/<board_id>/delete',
                 methods=['GET'],
                 strict_slashes=False)
def nodes_board(board_id):
    board = storage.get(Board, board_id)
    print('deleting', board)
    storage.delete(board)
    storage.save()
    return Response('a todo dar wey', status=200)

@app_nodes.route('/boards/<board_id>/nodes/view',
                 methods=['GET'],
                 strict_slashes=False)
@token_required
def nodes_views(board_id):
    """
    """
    nodes = []
    boar = json.loads(storage.get(Board, board_id).to_dict())
    for key in boar['nodes']:
        node = storage.get(CustomNode, key)
        nodes.append(node)
    print('clossing , Boards.', board_id)
    # THIS BEHAVIOR SHOULD BE REMOVED FOR SECURITY REASONS
    # IT JUST VALID FOR DEVELOPING PURPOSE
    parsed = []
    for node in nodes:
        nd = json.loads(node.to_dict())
        if node.type == 'service':
            nd['elapsed'] = node.get_next_job()
            print('Elapsed Time', nd['elapsed'])
        nd['connections'] = []
        for n in nodes:
            for inp in json.loads(n.innodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'in'))
            for inp in json.loads(n.outnodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'out'))
        parsed.append(nd)
    cols = ['#9dff00', '#7dcc00', '#6db200', '#5e9900',
            '#3e6600', '#a6ff19', '#baff4c', '#b07fff']
    cols.extend(['#fff200', '#e5d900', '#ccc100', '#b2a900',
                 '#999100', '#fff766', '#fffbb2', '#00fff2', '#00bfa5'])
    cols.extend(['#ff5724', '#ff784f', '#ff8965', '#ff9a7b',
                 '#ffbba7', '#ff4f7e', '#ffe4db', '#4fff78'])
    cols.extend(['#69c5fa', '#5eb1e1', '#549dc8', '#4989af',
                 '#3f7696', '#96d6fb', '#c3e7fd', '	#fa9e69'])
    # print('Is Lite', dict(request.__dict__)['environ']['QUERY_STRING'])
    if 'lite' in dict(request.__dict__)['environ']['QUERY_STRING']:
        cols = ['#fff200', '#e5d900', '#ccc100', '#b2a900',
                 '#999100', '#fff766', '#fffbb2', '#00fff2', '#00bfa5']
        nods = []
        connections = {}
        for nod in parsed:
            connections[nod['id']] = {}
            connections[nod['id']]['innodes'] = nod['innodes']
            connections[nod['id']]['outnodes'] = nod['outnodes']
            connections[nod['id']]['type'] = nod['type'];
            # template = render_template('lite/node.html', node=nod,
            #                            id=str(uuid.uuid4()), colors=cols)
            # connections[nod['id']]['template'] = template
        return Response(json.dumps([nods, connections]), mimetype='application/json')
    else:
        return Response(json.dumps({'nodes': parsed}), mimetype='application/json')


@app_nodes.route('/boards/<board_id>/logs',
                methods=['GET'],
                strict_slashes=False)
def get_board_logs(board_id):
    """
    Get all stored logs for thie board
    """
    sync_date = request.args.to_dict()['sync_date']
    print(sync_date)
    logs = get_runs(board_id, sync_date)
    return jsonify(logs=logs)

@app_nodes.route('/logs/<log_id>',
                methods=['GET'],
                strict_slashes=False)
def get_instance_log(log_id):
    """
    Get all stored logs for thie board
    """
    log = get_log(log_id)
    return jsonify(log=log)

@app_nodes.route('/boards/<board_id>/nodes',
                 methods=['GET'],
                 strict_slashes=False)
@token_required
def get_board_nodes(board_id):
    """
    Return the nodes for the board id
    """
    sync_date = request.args.to_dict()
    if 'sync_date' in sync_date:
        sync_date = sync_date['sync_date']
    board = storage.get(Board, board_id)
    nodes = {}
    for node_id in json.loads(board.nodes):
        nodes[node_id] = json.loads(storage.get(CustomNode, node_id).to_dict())
        if nodes[node_id]['type'] == 'service':
            node = storage.get(CustomNode, node_id)
            elapsed = node.get_next_job(sync_date)
            nodes[node_id]['elapsed'] = str(elapsed)
    return Response(json.dumps(nodes), mimetype='application/json')


@app_nodes.route('/boards/<board_id>/add_node',
                 methods=['POST'],
                 strict_slashes=False)
def add_node(board_id):
    """
    Append Node from file one by one
    """
    board = storage.get(Board, board_id)
    in_nodes = request.get_json()
    for nod in in_nodes:
        new_node = CustomNode()
        sample_keys = json.loads(new_node.to_dict()).keys()
        try:
            print('the node from the file\n', nod)
        except Exception as e:
            print(e)
        del nod['id']
        for key in sample_keys:
            if key in nod:
                val = nod[key]
                if type(val) == dict or type(val) == list:
                    val = json.dumps(val)
                setattr(new_node, key, val)
        new_node.name = nod['name']
        new_node.color = nod['color']
        new_node.user_id = board.user_id
        new_node.innodes = json.dumps([])
        new_node.outnodes = json.dumps([])
        new_node.board_id = board_id
        new_node.data = json.dumps(nod['data'])
        new_node.work_type = nod['work_type']
        new_node.analisis_mode = nod['analisis_mode']
        new_node.headers = json.dumps(nod['headers'])
        new_node.save()
        nodes = json.loads(board.nodes)
        nodes[new_node.id] = {'x': 20, 'y': 50}
        board.nodes = json.dumps(nodes)
        board.save()
    return Response('success', status=200)


@app_nodes.route('/boards/<board_id>/complete_board',
                 methods=['POST'],
                 strict_slashes=False)
def add_complete_board(board_id):
    """
    Append Node from file one by one
    """
    board = storage.get(Board, board_id)
    imp_board = request.get_json()
    # print(imp_board)	let board;
    print(imp_board['data']['name'])
    # Create copies of all nodes and its connections
    connections_relations = {}
    for node in imp_board['nodes'].keys():
        try:
            print(node, imp_board['nodes'][node])
        except Exception as e:
            print(node, json.dumps(imp_board['nodes'][node]))
        copy = copy_node(board, imp_board['nodes'][node], complete=True)
        connections_relations[node] = copy
    for conn in connections_relations.keys():
        for nd in connections_relations.values():
            print('Conn:', conn)
            print('New node:', str(connections_relations[conn].id))
            print('\033[32m', nd.innodes)
            print('\033[34m', nd.outnodes, '\033[0m')
            nd.data = nd.data.replace(conn,
                                      str(connections_relations[conn].id))
            nd.innodes = nd.innodes.replace(
                conn, str(connections_relations[conn].id))
            nd.outnodes = nd.outnodes.replace(
                conn, str(connections_relations[conn].id))
            nd.save()
            print('----\033[31m', nd.innodes, '-----')
            print('----\033[33m', nd.outnodes, '\033[0m----')
    nodes_pos = json.loads(board.nodes)
    for nod in imp_board['data']['nodes'].keys():
        _id = str(connections_relations[nod].id)
        nodes_pos[_id] = imp_board['data']['nodes'][nod]
    board.nodes = json.dumps(nodes_pos)
    board.save()
    return Response('success', status=200)


@app_nodes.route('/boards/<boardId>/contacts_list',
                 methods=['GET'],
                 strict_slashes=False)
def get_contacts_lists(boardId):
    """
    Get all contacts on board
    """
    board = storage.get(Board, boardId)
    nodes_id = json.loads(board.nodes).keys()
    resp = []
    for node in nodes_id:
        nod = storage.get(CustomNode, node)
        if nod.analisis_mode == 'contacts_list':
            resp.append(json.loads(nod.to_dict()))
    return Response(json.dumps(resp), mimetype='application/json')

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

@app_nodes.route('/boards/users',
                methods=['POST'],
                strict_slashes=False)
@token_required
def add_user_to_board():
    """
    Add a new user to the board users list
    """
    data = request.get_json()
    email = data['email']
    board_id = data['board']
    board = storage.get(Board, board_id)
    users = board.get_users
    us = storage.get(User, request.user)
    if board.user_id != request.user:
        if us.email not in users:
            return jsonify(message="You are not the owner"), 403
    # if email not in users:
    if True:
        users.append(email)
        board.set_users(users)
        subject = us.email.split('@')[0] + ' is inviting you to edit a board'
        url = ':'.join(request.host_url.split(':')[:2]) + '/boards/' + board.id
        template = render_template('invitation.html', board=board, url=url)
        send_email(email, subject, template)
        return jsonify(message="success")
    return jsonify(message="unable to append this user")

def load_templates():
    """
    load templates from .dim template file
    """
    with open('./api/node_templates/templates.dim', 'r') as templates:
        temps = json.loads(templates.read())
        return temps