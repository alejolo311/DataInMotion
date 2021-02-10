#!/usr/bin/python3
"""
Edu Courses
"""
from flask import jsonify, Response, request, render_template, send_file
from models import storage
from models.school import EduSchool
from models.edu_modules import EduModule
from models.course import Course
from api.v1.edu import app_edu
from api.v1.auth import token_required
import json

@app_edu.route('/modules/<school_id>',
                methods=['GET'],
                strict_slashes=False)
@token_required
def modules(school_id):
    """
    Return modules
    """
    modules = storage.filter_by(EduModule, 'school', school_id)
    modules = [json.loads(mod.to_dict()) for mod in modules]
    return Response(
        json.dumps(modules),
        mimetype='application/json'
    )

@app_edu.route('/modules/<school_id>',
                methods=['POST'],
                strict_slashes=False)
@token_required
def create_modules(school_id):
    """
    creates a new module
    """
    school = storage.get(EduSchool, school_id)
    if not school:
        return jsonify(error='invalid school_id'), 402
    data = request.get_json()
    if not 'name' in data or not 'description' in data:
        return jsonify(error='Missing name or description'), 402
    module = EduModule()
    module.name = data['name']
    module.description = data['description']
    module.school = school_id
    module.save()
    return Response(
        json.dumps(json.loads(module.to_dict())),
        mimetype='application/json'
    )

@app_edu.route('/modules/<module_id>/courses',
                methods=['GET'],
                strict_slashes=False)
@token_required
def get_courses(module_id):
    """
    Return the list of courses for this module
    """
    courses = storage.filter_by(Course, 'module', module_id)
    courses = [json.loads(cour.to_dict()) for cour in courses]
    return Response(
        json.dumps(courses),
        mimetype='application/json'
    )


@app_edu.route('/modules/<module_id>/courses',
                methods=['POST'],
                strict_slashes=False)
@token_required
def create_courses(module_id):
    """
    Return the list of courses for this module
    """
    module = storage.get(EduModule, module_id)
    if not module:
        return jsonify(error='invalid school_id'), 402
    data = request.get_json()
    if not 'name' in data or not 'description' in data:
        return jsonify(error='Missing name or description'), 402
    course = Course()
    course.name = data['name']
    course.description = data['description']
    course.module = module_id
    course.save()
    return Response(
        json.dumps(json.loads(course.to_dict())),
        mimetype='application/json'
    )

@app_edu.route('/modules/<module_id>',
                methods=['DELETE'],
                strict_slashes=False)
@token_required
def delete_module(module_id):
    """
    Deletes a module by it's id
    """
    module = storage.get(EduModule, module_id)
    module.delete()
    return jsonify(success="module deleted")

@app_edu.route('/modules/<module_id>',
                methods=['PUT'],
                strict_slashes=False)
@token_required
def update_module(module_id):
    """
    Updates a module by it's id
    """
    data = request.get_json()
    module = storage.get(EduModule, module_id)
    module.name = data['name']
    module.description = data['description']
    module.save()
    return jsonify(success="module deleted")