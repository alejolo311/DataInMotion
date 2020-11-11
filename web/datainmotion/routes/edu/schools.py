#!/usr/bin/python3
"""
Return the school view
"""

from flask import jsonify, Response, request, render_template
from datainmotion.routes.edu import app_edu
import uuid


@app_edu.route('/schools',
                methods=['GET'],
                strict_slashes=False)
def get_schools():
    """
    Return the Schools
    """
    return render_template('schools.html', id=str(uuid.uuid4()))