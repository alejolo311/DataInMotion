#!/usr/bin/python3
"""
API to request nodes data
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask import render_template
from api.v1.nodes import app_nodes
from api.v1.auth import app_auth
from models import storage
from models.custom import CustomNode
from api.v1.nodes.crontab_manager import updateCronTab
from datetime import datetime
from models.credentials import mail_pass
from flask_mail import Mail


app = Flask(__name__)
app.config['SECRET_KEY'] = 'this_security_pass'
app.config['SECURITY_PASSWORD_SALT'] = 'this_security_pass_salt'
app.config.update(
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 465,
    MAIL_USE_SSL = True,
    MAIL_USERNAME = 'datainmotion.cali@gmail.com',
    MAIL_PASSWORD = mail_pass,
)
CORS(app)
app.register_blueprint(app_nodes)
app.register_blueprint(app_auth)


@app.teardown_appcontext
def taerdown(exception):
    """Tears down close storage"""
    print(exception)
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

def setupCronJobs():
    """
    Initilizator for saved nodes type service with date information
    """
    all_nodes = storage.cronjobs(CustomNode)
    today = datetime.now()
    for node in all_nodes:
        print(node.analisis_params)
        updateCronTab(node)
    return 0


if __name__ == '__main__':
    status = setupCronJobs()
    app.run(host='0.0.0.0', port='8080')
