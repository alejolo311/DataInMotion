#!/usr/bin/python3
"""
Edu Schools
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from models.course import Course
from models.school import EduSchool
from models.user import User
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
                sch = json.loads(school.to_dict())
                sch['admin'] = storage.get(User, sch['admin']).email
                user_schools.append(sch)
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

@app_edu.route('/schools/<school_id>',
                methods=['PUT'],
                strict_slashes=False)
@token_required
def update_school(school_id):
    """
    update a school by it's id
    """
    data = request.get_json()
    school = storage.get(EduSchool, school_id)
    school.name = data['name']
    school.description = data['description']
    school.save()
    return jsonify(success="school updated")

@app_edu.route('/schools/<school_id>',
                methods=['DELETE'],
                strict_slashes=False)
@token_required
def delete_school(school_id):
    """
    Deletes a school by it's id
    """
    school = storage.get(EduSchool, school_id)
    school.delete()
    return jsonify(success="school deleted")