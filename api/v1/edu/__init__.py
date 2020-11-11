#!/usr/bin/python3
"""
import the requires routes and creates the blueprint
"""

from flask import Blueprint

app_edu = Blueprint(
    'api_edu',
    __name__,
    url_prefix='/api/v1/edu',
    template_folder='templates')

from api.v1.edu.index import *
from api.v1.edu.courses import *
from api.v1.edu.modules import *
from api.v1.edu.schools import *
