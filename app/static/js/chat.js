var socket;
if (window.location.protocol === 'https:') {
    socket = io.connect('https://' + document.domain + ':' + location.port, { secure: true });
} else {
    socket = io.connect('http://' + document.domain + ':' + location.port);
}

// Audio files
var joinSound = new Audio("/static/join.mp3");
var popSound = new Audio("/static/pop.mp3");

// Flag to track if the audio context is unlocked
let audioContextUnlocked = false;
let audioMuted = false;

// Get radio buttons by their IDs
const muteRadio = document.getElementById('mute');
const unmuteRadio = document.getElementById('unmute');

// Function to handle audio mute/unmute
function handleAudioMute() {
    if (muteRadio.checked) {
        console.log('Muting audio');
        audioMuted = true;
        joinSound.muted = true;
        popSound.muted = true;
    } else {
        console.log('Unmuting audio');
        audioMuted = false;
        joinSound.muted = false;
        popSound.muted = false;
    }
}

// Add event listeners for radio buttons
muteRadio.addEventListener('change', handleAudioMute);
unmuteRadio.addEventListener('change', handleAudioMute);

// Initial mute/unmute state based on checked radio button
handleAudioMute();

// MUSIC PLAYER
// Array of tracks to play
let currentTrackIndex = 0;

const audioPlayer = document.getElementById('audioPlayer');

// Function to initialize and play the first track
function initializeAudioPlayer() {
    // Set the first track as the source
    audioPlayer.src = tracks[0];
    // You can add more setup here if needed
}

// Function to play or pause the music
function togglePlayPause() {
    if (audioPlayer.src) {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    } else {
        console.error("No audio source found.");
    }
}

// Call initialize function on page load or on a specific user action
window.onload = initializeAudioPlayer;

// Set volume to 30% on page load
setVolume(0.3);


function skipTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(currentTrackIndex);
}


// Set volume
function setVolume(value) {
    audioPlayer.volume = value;
}

function playTrack(index) {
    if (tracks && tracks.length > 0) {
        audioPlayer.src = tracks[index];
        audioPlayer.play();
    } else {
        console.error("Track list is empty or not defined.");
    }
}




function unlockAudioContext() {
    if (!audioContextUnlocked) {
        // Play and immediately pause the join sound
        joinSound.play().then(() => {
            joinSound.pause();
            popSound.play().then(() => {
                popSound.pause();
                audioContextUnlocked = true;
                console.log('Audio context unlocked');
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
        }

        // Play pop sound for every message received from other users
        popSound.play();

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
        joinSound.play().catch(function (error) {
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


document.getElementById('infoButton').addEventListener('click', function () {
    document.getElementById('legalModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('legalModal').style.display = 'none';
});

function sendPhoto() {
    // Trigger file input for selecting a photo
    document.getElementById('photoInput').click();
}

function compressImage(file, quality, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const imgElement = document.createElement("img");
        imgElement.src = event.target.result;
        imgElement.onload = () => {
            const canvas = document.createElement("canvas");
            const scaleFactor = quality / 100;
            canvas.width = imgElement.width * scaleFactor;
            canvas.height = imgElement.height * scaleFactor;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            ctx.canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                });
                callback(compressedFile);
            }, "image/jpeg", quality / 100);
        };
    };
    reader.readAsDataURL(file);
}

function uploadPhoto() {
    console.log('Trying to upload photo');
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];
    const name = localStorage.getItem('chatUserName') || 'Anonymous';

    if (file) {
        console.log('Uploading photo: ' + file.name);
        compressImage(file, 70, (compressedFile) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                socket.emit('send_photo', {
                    'photo': base64String,
                    'name': name
                });
            };
            reader.readAsDataURL(compressedFile);
        });

        fileInput.value = '';
        console.log('Photo uploaded');
    }
}




socket.on('receive_photo', function (data) {
    console.log('Received photo from ' + data.sender);

    var photoBubble = document.createElement('img');
    photoBubble.onload = function () {
        applyPixelatedEffect(this, 4); // '8' is the scale factor; adjust as needed for the desired effect
    };

    photoBubble.src = data.photo; // Set the source of the image to the received Base64 string
    photoBubble.classList.add('nes-balloon'); // Add a class for styling (optional)
    photoBubble.classList.add('message-photo'); // Add a class for styling (optional)

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
        }

        // Play pop sound for every photo received from other users
        popSound.play();

        // Store the sid in the message-wrapper for future reference
        messageWrapper.dataset.sid = data.sid;
    }

    messageWrapper.appendChild(photoBubble); // Append the photo to the message wrapper
    messagesContainer.appendChild(messageWrapper); // Append the message wrapper to the container
    // Wait 0.01s for the image to load before scrolling to the bottom
    setTimeout(function () {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1);
});

function applyPixelatedEffect(imageElement, scale) {
    // Create a canvas element
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // Calculate the scaled down size
    var w = imageElement.width / scale;
    var h = imageElement.height / scale;

    // Set the canvas size to the scaled down size
    canvas.width = w;
    canvas.height = h;

    // Disable image smoothing to keep the pixels sharp
    ctx.imageSmoothingEnabled = false;

    // Draw the image to the scaled down canvas
    ctx.drawImage(imageElement, 0, 0, w, h);

    // Scale the canvas back up to the image's original size
    var pixelatedImage = document.createElement('canvas');
    pixelatedImage.width = imageElement.width;
    pixelatedImage.height = imageElement.height;
    var pixelCtx = pixelatedImage.getContext('2d');

    // Draw the scaled down image onto the larger canvas to get the pixel effect
    pixelCtx.imageSmoothingEnabled = false; // Ensure the scaling up is also pixelated
    pixelCtx.scale(scale, scale);
    pixelCtx.drawImage(canvas, 0, 0);

    // Replace the source of the image element with the data URL of the pixelated canvas
    imageElement.src = pixelatedImage.toDataURL();
}

// Usage: When the image loads, apply the pixel effect
