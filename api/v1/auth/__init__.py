#!/usr/bin/python3
"""
Auth Blueprint module
"""

from flask import Blueprint, jsonify, request, current_app
from functools import wraps
from itsdangerous import URLSafeTimedSerializer

app_auth = Blueprint(
    'auth',
    __name__,
    url_prefix='/api/v1/auth',
    template_folder='templates')

def confirm_token(token, expiration=3600):
    """
    Token confirmation utility
    """
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except:
        return False
    return email

def token_required(f):
    """
    Wrapper
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        """
        decorated middle function
        """
        token = request.headers.get('authorization')
        if not token:
            return jsonify(message='failed, unauthorized'), 403
        else:
            email = confirm_token(token)
            if not email:
                return jsonify(message='failed, unauthorized'), 401
            user = storage.filter_by(User, 'email', email)[0]
            request.user = user.id
            return f(*args, **kwargs)
    return decorated


from api.v1.auth.auth import *
