#!/usr/bin/python3
"""
Index route for nodes api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.custom import CustomNode
import json


@app_nodes.route('/nodes/<user_id>/', methods=['GET'], strict_slashes=False)
def nodes(user_id):
    """
    Returns list of nodes by user_id
    """
    nodes = storage.all(CustomNode).values()
    resp = []
    for node in nodes:
        if node.user_id == user_id:
            resp.append(node.to_dict())
    # resp = json.dumps(resp)
    return Response(resp, mimetype='application/json')


@app_nodes.route('/nodes/<node_id>/savecolor', methods=['POST'], strict_slashes=False)
def nodes_savecolor(node_id):
    """
    Returns list of nodes by user_id
    """
    node = storage.get(CustomNode, node_id)
    node.color = request.get_json()['color']
    node.save()
    return Response(json.dumps({'status': 'saved'}), mimetype='application/json', status=200)