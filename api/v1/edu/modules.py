#!/usr/bin/python3
"""
Edu Courses
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from models.course import Course
from api.v1.edu import app_edu
import json

@app_edu.route('/modules',
                methods=['GET'],
                strict_slashes=False)
def modules():
    """
    Return modules
    """
    return Response(
        json.dumps({}),
        mimetype='application/json'
    )