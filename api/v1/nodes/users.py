#!/usr/bin/python3
"""
Index route users api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.user import User
from models.board import Board
from models.custom import CustomNode
from api.v1.auth import token_required
import json


@app_nodes.route('/users', methods=['GET'], strict_slashes=False)
def users():
    """
    Returns users
    """
    users = [u.to_dict() for u in storage.all(User).values()]
    users = json.dumps(users)
    return Response(users, mimetype='application/json')


@app_nodes.route('/users/boards', methods=['GET'],
                 strict_slashes=False)
@token_required
def users_boards():
    """
    Return the list of user associated to the user
    """
    print('UserId from token and email', request.user)
    sync_date = request.args.to_dict()
    if 'sync_date' in sync_date:
        sync_date = sync_date['sync_date']
    user = storage.get(User, request.user)
    # print(user.boards)
    boards = []
    for board in user.boards:
        # print('Board to send', board.to_dict())
        print('Nodes on board:', type(board.nodes), board.nodes)
        nodes = json.loads(board.nodes)
        ns = {}
        for node in nodes:
            instance = storage.get(CustomNode, node)
            if instance.type == 'service':
                ns[instance.id] = json.loads(instance.to_dict())
                print('Sync Data:', sync_date, type(sync_date))
                next_run = instance.get_next_job(sync_date.replace(',', ' '))
                print('Next job on', next_run)
                if type(ns[instance.id]['analisis_params']) == dict:
                    ns[instance.id]['analisis_params']['next_run'] = next_run
        brd = json.loads(board.to_dict())
        brd['nodes'] = ns
        boards.append(brd)
    all_boards = storage.all(Board).values()
    for bo in all_boards:
        users = bo.get_users
        if user.email in users:
            print('Board to send', bo.to_dict())
            boards.append(json.loads(bo.to_dict()))
    return Response(json.dumps(boards), mimetype='application/json')


@app_nodes.route('/users/check', methods=['POST'], strict_slashes=False)
def check_user():
    """
    Returns users
    """
    email = request.get_json()['email']
    users = None
    try:
        users = storage.all(User)
    except Exception as e:
        print(e)
    user = None
    if users is not None:
        for us in users.values():
            if us.email == email:
                user = us
    if user is None:
        user = User()
        user.email = email
        user.save()
    return Response(json.dumps({'id': user.id}), mimetype='application/json')

@app_nodes.route('/users/<board_id>/boards_nodes', methods=['GET'],
                 strict_slashes=False)
def get_boards_nodes(board_id):
    """
    return a list of boards an its node ids
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

@app_nodes.route('/users/create_board',
                 methods=['POST'], strict_slashes=False)
@token_required
def create_a_new_board():
    """
    Creates a new board appended to the user id
    and the returns the id of the new board
    """
    user = storage.get(User, request.user)
    user_id = user.id
    # Create a new Board
    board = Board()
    board.nodes = '{}'
    board.user_id = user_id
    board.save()
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

@app_nodes.route('/users',
            methods=['DELETE'],
            strict_slashes=False)
def delete_user():
    """
    delete user by email
    """
    email = request.get_json()['email']
    users = storage.filter_by(User, 'email', email)
    print(users)
    for user in users:
        boards = storage.all(Board).values()
        for board in boards:
            uss = board.get_users
            try:
                del uss[uss.index(user.email)]
            except:
                pass
            board.set_users(uss)
        storage.delete(user)
        storage.save()
    return 'success'