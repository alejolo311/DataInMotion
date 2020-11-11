#!/usr/bin/python3
"""
Edu Courses
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from models.course import Course
from api.v1.edu import app_edu
import json

@app_edu.route('/courses/<course_id>',
                methods=['GET'],
                strict_slashes=False)
def course(course_id):
    """
    Return the list of courses
    """
    course = json.loads(storage.get(Course, course_id).to_dict())

    return Response(
        json.dumps(course),
        mimetype='application/json'
    )