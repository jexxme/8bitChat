var socket = io.connect('http://' + document.domain + ':' + location.port);

function sendMessage() {
    var message = document.getElementById('message-input').value;
    var name = localStorage.getItem('chatUserName') || 'Anonymous';
    socket.emit('send_message', { 'message': message, 'name': name });
}


socket.on('receive_message', function(data) {
    document.getElementById('messages').innerHTML += '<div class="message"><span class="name">' + data.name + ':</span> <span class="text">' + data.message + '</span> <span class="timestamp">' + data.timestamp.split(' ')[1] + '</span></div>';
});



document.addEventListener('DOMContentLoaded', function() {
    var storedName = localStorage.getItem('chatUserName');
    if (!storedName) {
        document.getElementById('nameModal').style.display = 'block';
    }

    document.getElementById('nameForm').addEventListener('submit', function(event) {
        event.preventDefault();
        var name = document.getElementById('nameInput').value;
        localStorage.setItem('chatUserName', name);
        document.getElementById('nameModal').style.display = 'none';
    });
});
