#!/usr/bin/python3
"""
import the requires routes and creates the blueprint
"""

from flask import Blueprint

app_nodes = Blueprint('api_nodes', __name__, url_prefix='/api/v1')

from api.v1.nodes.index import *
from api.v1.nodes.users import *
from api.v1.nodes.nodes import *
from api.v1.nodes.boards import *
