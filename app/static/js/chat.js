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

var joinSound = new Audio("/static/join.mp3"); 
var popSound = new Audio("/static/pop.mp3"); 

document.addEventListener('DOMContentLoaded', function () {
    var storedName = localStorage.getItem('chatUserName');
    if (!storedName) {
        console.log('No username found in localStorage');
        // Show the name modal if the user has not set a username
        document.getElementById('nameModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block'; // Show overlay
        document.getElementById('nameInput').focus(); // Automatically focus the input field
    } else {
        console.log('Username found in localStorage: ' + storedName);
        // Update the username display
        updateUsernameDisplay(storedName);
        // Emit the known_user event with the user's name
        console.log('Emitting known_user event');
        socket.emit('known_user', { 'name': storedName });
    }

    document.getElementById('nameForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var name = document.getElementById('nameInput').value;
        localStorage.setItem('chatUserName', name);
        document.getElementById('nameModal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none'; // Hide overlay
        updateUsernameDisplay(name);  // Update when new name is submitted
        socket.emit('new_user', { 'name': name }); // Emit the new_user event with the user's name
        document.getElementById('nameInput').value = ''; // Clear the input field
        document.getElementById('message-input').focus(); // Automatically focus the input field
    });
});


function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var message = messageInput.value;
    var name = localStorage.getItem('chatUserName') || 'Anonymous';

    if (message.trim() !== '') {
        socket.emit('send_message', { 'message': message, 'name': name, 'sid': socket.id });
        messageInput.value = '';
        messageInput.focus();
    }
}


socket.on('receive_message', function (data) {
    var messageBubble = document.createElement('div');
    messageBubble.classList.add('nes-balloon');
    messageBubble.textContent = data.message;
    var messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');
    messageWrapper.classList.add('message-pop-in');

    var messagesContainer = document.getElementById('messages');
    var lastMessage = messagesContainer.querySelector('.message-other:last-child');

    // Compare the session ID instead of the username
    if (data.sid === socket.id) {
        messageWrapper.classList.add('message-user');
    } else {
        messageWrapper.classList.add('message-other');
        
        // Check if the last message is from the same user (based on sid)
        var isSameUser = lastMessage && lastMessage.dataset.sid === data.sid;
        if (!isSameUser) {
            var senderUsername = document.createElement('div');
            senderUsername.textContent = data.sender;
            senderUsername.classList.add('sender-username');
            messageWrapper.appendChild(senderUsername);
            popSound.play();
        }

        // Store the sid in the message-wrapper for future reference
        messageWrapper.dataset.sid = data.sid;
    }

    messageWrapper.appendChild(messageBubble);
    messagesContainer.appendChild(messageWrapper);
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
    // Compare the session ID instead of the username
    if (data.sid !== socket.id) {
        joinSound.play().catch(function(error) {
            console.log("Error playing sound: " + error);
        });
    }

    var joinMessage = document.createElement('p');
    joinMessage.innerHTML = '<i>' + data.name + ' has joined the chat</i>';
    joinMessage.classList.add('user-joined-message');
    joinMessage.classList.add('message-pop-in');
    document.getElementById('messages').appendChild(joinMessage);
});

function updateUsernameDisplay(name) {
    document.getElementById('username').textContent = name || '';
}


document.getElementById('infoButton').addEventListener('click', function() {
    document.getElementById('legalModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('legalModal').style.display = 'none';
});
