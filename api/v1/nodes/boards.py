#!/usr/bin/python3
"""
Index route for boards api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.custom import CustomNode
from models.user import User
from models.board import Board
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


@app_nodes.route('/users/<user_id>/create_board',
                 methods=['GET'], strict_slashes=False)
def create_a_new_board(user_id):
    """
    Creates a new board appended to the user id
    and the returns the id of the new board
    """
    user = storage.get(User, user_id)
    # Create a new Board
    board = Board()
    board.nodes = '{}'
    board.user_id = user_id
    # Create a service inside the board
    d_service = CustomNode()
    # Set the service settings
    d_service.user_id = user_id
    d_service.board_id = board.id
    d_service.type = 'service'
    d_service.work_type = 'process'
    d_service.name = 'Result'
    # store the service in the board
    objects = json.loads(board.nodes)
    objects[d_service.id] = {'x': 100, 'y': 100}
    board.nodes = json.dumps(objects)
    # Save the created instances
    d_service.save()
    board.save()
    return Response(json.dumps({'board_id': board.id}),
                    mimetype='application/json')


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


@app_nodes.route('/boards/<board_id>/nodes',
                 methods=['GET'],
                 strict_slashes=False)
def remove_board(board_id):
    """
    Return the nodes for the board id
    """
    board = storage.get(Board, board_id)
    nodes = {}
    for node_id in json.loads(board.nodes):
        nodes[node_id] = json.loads(storage.get(CustomNode, node_id).to_dict())
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


@app_nodes.route('boards/<boardId>/contacts_list',
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