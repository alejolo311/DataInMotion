#!/usr/bin/python3
"""
Index route for nodes api
"""

from api.v1.nodes import app_nodes
from models import storage
from flask import jsonify, Response, request
from models.custom import CustomNode
import json


@app_nodes.route('/nodes/<node_id>', methods=['GET'], strict_slashes=False)
def nodes(node_id):
    """
    Returns list of nodes by user_id
    """
    node = storage.get(CustomNode, node_id)
    resp = node.to_dict()
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

@app_nodes.route('/nodes/<node_id>/save_analisis_data',
                    methods=['POST'], strict_slashes=False)
def save_analisis_data(node_id):
    """
    Saves the incoming object analisis data attribute of node_id to db
    """
    an_data = []
    try:
        an_data = request.get_json()['params']
    except Exception as e:
        print(e)
    node = storage.get(CustomNode, node_id)
    if node:
        node.analisis_params = json.dumps(an_data)


@app_nodes.route('/nodes/<node_id>/run',
                    methods=['GET'], strict_slashes=False)
def run_node(node_id):
    """
    run the node proccesses and conections
    """
    node = storage.get(CustomNode, node_id)
    resp = node.run_node_task({})
    return Response(json.dumps(resp), status=200)