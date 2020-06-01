#!/usr/bin/python3
"""
API to request nodes data
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask import render_template
from api.v1.nodes import app_nodes
from models import storage


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(app_nodes)

@app.teardown_appcontext
def taerdown(exception):
    """Tears down close storage"""
    storage.close()

@app.errorhandler(500)
def server_error(error):
    """
    Prints the Server error
    """
    print(error)
    return jsonify(error='Server error', message=str(error)), 500 

@app.errorhandler(404)
def not_found(error):
    """
    NOt found error
    """
    print(error)
    return jsonify(error=str(error)), 404

@app.route('/', strict_slashes=False)
def index():
    """
    Main page
    """
    return 'hello'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8000')
