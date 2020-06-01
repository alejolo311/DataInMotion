#!/usr/bin/python3
"""
Index route por nodes api
"""

from api.v1.nodes import app_nodes
from flask import jsonify


@app_nodes.route('/status', methods=['GET'], strict_slashes=False)
def status():
    """
    Returns OK status
    """
    return jsonify(status='OK'), 200
