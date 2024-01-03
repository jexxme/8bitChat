var socket;
if (window.location.protocol === 'https:') {
    socket = io.connect('https://' + document.domain + ':' + location.port, { secure: true });
} else {
    socket = io.connect('http://' + document.domain + ':' + location.port);
}


// Flag to track if the audio context is unlocked
let audioContextUnlocked = false;

function unlockAudioContext() {
    if (!audioContextUnlocked) {
        // Play and immediately pause the join sound
        joinSound.play().then(() => {
            joinSound.pause();
            popSound.play().then(() => {
                popSound.pause();
                audioContextUnlocked = true;
                // Remove the event listener once the audio context is unlocked
                document.removeEventListener('click', unlockAudioContext);
            });
        }).catch((error) => {
            console.error('Audio context unlock failed', error);
        });
    }
}

// Add event listener for the first user interaction
document.addEventListener('click', unlockAudioContext);

var joinSound = new Audio("/static/join.mp3"); // Make sure the path is correct

var popSound = new Audio("/static/pop.mp3"); // Make sure the path is correct


function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var message = messageInput.value;
    var name = localStorage.getItem('chatUserName') || 'Anonymous';

    if (message.trim() !== '') {
        socket.emit('send_message', { 'message': message, 'name': name });
        messageInput.value = ''; // Clear the input field after sending
    }
}

socket.on('receive_message', function (data) {
    // Create the message bubble
    var messageBubble = document.createElement('div');
    messageBubble.classList.add('nes-balloon');
    messageBubble.textContent = data.message;

    // Create the message wrapper
    var messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');
    messageWrapper.classList.add('message-pop-in');

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

        // Play the pop sound
        popSound.play();
    }

    // Append the message bubble to the message wrapper
    messageWrapper.appendChild(messageBubble);

    // Append the message wrapper to the messages container
    var messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(messageWrapper);

    // Scroll to the latest message
    var messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});


// Enter key event listener
document.getElementById('message-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); // Prevent default to avoid line break in input field
    }
});


socket.on('user_count', function (data) {
    document.getElementById('user-count').innerHTML = 'Users online: ' + data.count;
});

socket.on('user_joined', function (data) {
    var currentUsername = localStorage.getItem('chatUserName');
    if (data.name !== currentUsername) {
        joinSound.play().catch(function(error) {
            console.log("Error playing sound: " + error);
        });
    }

    var joinedMessage = '<p class="user-joined-message message-pop-in"><i>' + data.name + ' has joined the chat</i></p>';
    document.getElementById('messages').innerHTML += joinedMessage;
});





function updateUsernameDisplay(name) {
    document.getElementById('username').textContent = name || '';
}

document.addEventListener('DOMContentLoaded', function () {
    var storedName = localStorage.getItem('chatUserName');
    if (!storedName) {
        document.getElementById('nameModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block'; // Show overlay
        document.getElementById('nameInput').focus(); // Automatically focus the input field
    }

    document.getElementById('nameForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var name = document.getElementById('nameInput').value;
        localStorage.setItem('chatUserName', name);
        document.getElementById('nameModal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none'; // Hide overlay

        updateUsernameDisplay(name);  // Update when new name is submitted

        // Emit the new_user event with the user's name
        socket.emit('new_user', { 'name': name });
    });

});



