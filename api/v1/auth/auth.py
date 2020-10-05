#!/usr/bin/python3
"""
Auth Flow
"""

from models import storage
from itsdangerous import URLSafeTimedSerializer
from api.v1.auth import app_auth
from flask import request, current_app, jsonify, render_template, redirect
from models.user import User
from datetime import datetime
from flask_mail import Message, Mail

def generate_token(email):
    """
    Generate token using itsdangerous
    """
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

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

@app_auth.route('/register',
            methods=['POST'],
            strict_slashes=False)
def register():
    """
    Register a new user
    """
    data = request.get_json()
    email = data['email']
    ex_user = storage.filter_by(User, 'email', email)
    if len(ex_user) > 0:
        return jsonify(message="Can't create this user"), 309
    password = data['password']
    user = User()
    user.email = email
    user.password = password
    user.confirmed = False
    user.save()
    token = generate_token(email)
    confirm_url = 'http://' + request.host + '/api/v1/auth/confirm/' + token
    html = render_template('confirm.html', confirm_url=confirm_url)
    subject = 'Please Confirm your email'
    send_email(email, subject, html)
    return jsonify(token=token, id=user.id)

@app_auth.route('/login',
                methods=['POST'],
                strict_slashes=False)
def login():
    data = request.get_json()
    email = data['email']
    passwd = data['password']
    user = storage.filter_by(User, 'email', email)
    if len(user) > 0 :
        if passwd == user[0].password:
            user = user[0]
            token = generate_token(email)
            return jsonify(id=user.id, token=token)
        else:
            print(user[0].password)
    return jsonify(message='Can not login this user'), 401

@app_auth.route('/confirm/<token>')
def confirm_email(token):
    """
    Make the email verification
    """
    try:
        email = confirm_token(token)
        if not email:
            return jsonify(message='token expired'), 401
    except:
        pass
    user = storage.filter_by(User, 'email', email)
    if len(user) > 0 and user[0].confirmed:
        print('Account already confirmed')
        return jsonify(id=user[0].id)
    else:
        user[0].confirmed = True
        user[0].confirmed_on =str(datetime.now())
        user[0].save()
        return redirect('http://' + request.host.split(':')[0] + '/user/boards')
    return redirect('')

def send_email(to, subject, template):
    """
    Send the conformation message to the new registered user
    """
    mail = Mail()
    mail.init_app(current_app)
    msg = Message(
        subject,
        recipients=[to],
        html=template,
        sender=current_app.config['MAIL_USERNAME']
    )
    mail.send(msg)


