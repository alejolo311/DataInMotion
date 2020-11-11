#!/usr/bin/python3
"""
import the requires routes and creates the blueprint
"""

from flask import Blueprint

app_edu = Blueprint(
    'api_edu',
    __name__,
    url_prefix='/edu',
    template_folder='templates')

from datainmotion.routes.edu.creator import *
from datainmotion.routes.edu.schools import *