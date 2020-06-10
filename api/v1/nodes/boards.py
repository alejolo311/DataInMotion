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
    return Response(json.dumps({'board_id': board.id}), mimetype='application/json')





@app_nodes.route('/boards/<board_id>/', methods=['POST'], strict_slashes=False)
def boards(board_id):
    """
    Returns list of nodes by user_id
    """
    # print(request.data)
    try:
        print(request.get_json())
        board = storage.get(Board, board_id)
        board.nodes = json.dumps(request.get_json()['nodes'])
        board.save()
        # with open('boards/Board.' + board_id, 'w') as board:
        #     board.write(json.dumps(request.get_json()));
        # print(dir(request))
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