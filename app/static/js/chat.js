var socket = io.connect('http://' + document.domain + ':' + location.port);

function sendMessage() {
    var message = document.getElementById('message-input').value;
    var name = localStorage.getItem('chatUserName') || 'Anonymous';
    socket.emit('send_message', { 'message': message, 'name': name });
}

socket.on('receive_message', function(data) {
    // Create the message bubble
    var messageBubble = document.createElement('div');
    messageBubble.classList.add('nes-balloon');
    messageBubble.textContent = data.message;

    // Create the message wrapper
    var messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');

    // Get the current user's name from localStorage
    var currentUsername = localStorage.getItem('chatUserName');

    // Check if the message is from the current user
    if (data.sender === currentUsername) {
        messageWrapper.classList.add('message-user');
    } else {
        messageWrapper.classList.add('message-other');

        // If the message is not from the current user, add the sender's username
        var senderUsername = document.createElement('div');
        senderUsername.textContent = data.sender;
        senderUsername.classList.add('sender-username');
        messageWrapper.appendChild(senderUsername);
    }

    // Append the message bubble to the message wrapper
    messageWrapper.appendChild(messageBubble);

    // Append the message wrapper to the messages container
    var messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(messageWrapper);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});


  
  

socket.on('user_count', function(data) {
    document.getElementById('user-count').innerHTML = 'Users online: ' + data.count;
});

socket.on('user_joined', function(data) {
    document.getElementById('messages').innerHTML += '<p><i>' + data.name + ' has joined the chat</i></p>';
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
        
        // Emit the new_user event with the user's name
        socket.emit('new_user', { 'name': name });
    });
    
});

