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
        if not new_connection in outnodes:
            outnodes.append(new_connection)
        node.outnodes = json.dumps(outnodes)
    else:
        innodes = json.loads(node.innodes)
        if not new_connection in innodes:
            innodes.append(new_connection)
        node.outnodes = json.dumps(innodes)
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
    print(typ, conn, node.id)
    if typ == 'out':
        print('')
        outnodes = json.loads(node.outnodes)
        if conn in outnodes:
            print('remove', conn)
            del outnodes[outnodes.index(conn)]
        node.outnodes = json.dumps(outnodes)
    node.save()
    return Response({'state': 'Connection removed'}, status=200)