from app import socketio
from flask import render_template
from app import app
from flask_socketio import SocketIO, emit
from datetime import datetime
import json

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('send_message')
def handle_send_message_event(data):
    data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    emit('receive_message', data, broadcast=True)
