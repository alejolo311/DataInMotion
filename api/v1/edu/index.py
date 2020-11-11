#!/usr/bin/python3
"""
Edu index
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from api.v1.edu import app_edu
import json

@app_edu.route('/index')
def edu_index():
    """
    Return the list of courses
    """
    return Response(
        json.dumps({}),
        mimetype='application/json'
    )