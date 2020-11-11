#!/usr/bin/python3
"""
Return the creator view
"""

from flask import jsonify, Response, request, render_template
from datainmotion.routes.edu import app_edu
import uuid


@app_edu.route('/',
                methods=['GET'],
                strict_slashes=False)
def get_creator():
    """
    Return the creator view
    """
    return render_template('edu_index.html', id=str(uuid.uuid4()))