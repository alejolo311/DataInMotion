#!/usr/bin/python3
"""
Index route users api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.user import User
import json


@app_nodes.route('/users', methods=['GET'], strict_slashes=False)
def users():
    """
    Returns users
    """
    users = [u.to_dict() for u in storage.all(User).values()]
    # users = json.dumps(users)
    return Response(users, mimetype='application/json')


@app_nodes.route('/users/<user_id>/boards', methods=['GET'],
                 strict_slashes=False)
def users_boards(user_id):
    """
    Returns users
    """
    user = storage.get(User, user_id)
    print(user.boards)
    boards = []
    for board in user.boards:
        boards.append(json.loads(board.to_dict()))
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
