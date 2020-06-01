#!/usr/bin/python3
"""
Index route users api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response
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
