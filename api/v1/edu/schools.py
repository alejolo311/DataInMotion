#!/usr/bin/python3
"""
Edu Schools
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from models.course import Course
from models.school import EduSchool
from api.v1.edu import app_edu
from api.v1.auth import token_required
import json

@app_edu.route('/schools',
                methods=['GET'],
                strict_slashes=False)
@token_required
def schools():
    """
    Return the list of courses
    """
    schools = storage.all(EduSchool)
    user_schools = []
    if len(schools.keys()) > 0:
        for school in schools.values():
            if request.user in school.get_users or request.user == school.admin:
                user_schools.append(json.loads(school.to_dict()))
    return Response(
        json.dumps(user_schools),
        mimetype='application/json'
    )

@app_edu.route('/schools',
                methods=['POST'],
                strict_slashes=False)
@token_required
def create_schools():
    """
    Creates a new School linked to the user
    """
    data = request.get_json()
    if not 'name' in data or not 'description' in data:
        return jsonify(error="No name or description"), 400
    school = EduSchool()
    school.name = data['name']
    school.description = data['description']
    school.admin = request.user
    school.save()
    return Response(
        json.dumps(json.loads(school.to_dict())),
        mimetype='application/json'
    )