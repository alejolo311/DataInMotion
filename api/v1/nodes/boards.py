#!/usr/bin/python3
"""
Index route for boards api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.custom import CustomNode
import json


@app_nodes.route('/boards/<board_id>', methods=['GET'], strict_slashes=False)
def return_board(board_id):
    board = {}
    try:
        with open('boards/Board.' + board_id, 'r') as bo:
            board = json.loads(bo.read())
    except Exception as e:
        print(e)
    return Response(json.dumps(board), mimetype='application/json')


@app_nodes.route('/boards/<board_id>/', methods=['POST'], strict_slashes=False)
def boards(board_id):
    """
    Returns list of nodes by user_id
    """
    # print(request.data)
    try:
        print(request.get_json())
        with open('boards/Board.' + board_id, 'w') as board:
            board.write(json.dumps(request.get_json()));
        # print(dir(request))
    except Exception as e:
        print(e)
    return Response({'ok': 'yes'}, mimetype='application/json')
