from app import socketio
from flask import render_template
from app import app

@app.route('/')
def index():
    return render_template('index.html')



@socketio.on('send_message')
def handle_send_message_event(data):
    socketio.emit('receive_message', data)
