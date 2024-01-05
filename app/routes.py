from app import socketio
from flask import render_template, request
from app import app
from flask_socketio import SocketIO, emit
from datetime import datetime
import json
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
from dotenv import load_dotenv

load_dotenv()  # This loads the .env file at the application start

# Now you can access the key with os.getenv
google_analytics_key = os.getenv('GOOGLE_ANALYTICS_KEY')


connected_users = 0

@app.route('/')
def index():
    return render_template('index.html', google_analytics_key=google_analytics_key)

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy_policy.html')

@app.route('/terms-of-service')
def terms_of_service():
    return render_template('terms_of_service.html')

@socketio.on('connect')
def handle_connect():
    global connected_users
    connected_users += 1
    emit('user_count', {'count': connected_users}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    global connected_users
    connected_users -= 1
    emit('user_count', {'count': connected_users}, broadcast=True)

@socketio.on('send_message')
def handle_send_message_event(data):
    emit('receive_message', {
        'message': data['message'],
        'sender': data['name'],
        'sid': request.sid  # Include the session ID
    }, broadcast=True)

@socketio.on('new_user')
def handle_new_user(data):
    name = data['name']
    emit('user_joined', {'name': name, 'sid': request.sid}, broadcast=True)  # Include the session ID

# When a known user joins, we also want to emit the user_joined event 

@socketio.on('known_user')
def handle_known_user(data):
    name = data['name']
    emit('user_joined', {'name': name, 'sid': request.sid}, broadcast=True)