var socket = io.connect('http://' + document.domain + ':' + location.port);

function sendMessage() {
    var message = document.getElementById('message-input').value;
    socket.emit('send_message', { 'message': message });
}

socket.on('receive_message', function(data) {
    document.getElementById('messages').innerHTML += '<p>' + data.message + '</p>';
});


