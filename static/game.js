// -----------------------------
// ELEMENTS & INITIALIZATION
// -----------------------------
const car = document.getElementById("car");
const character = document.getElementById("character");
const bgm = document.getElementById("bgm");
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");

// Login Elements
const loginOverlay = document.getElementById("login-overlay");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");

let socket;
if (typeof io !== 'undefined') {
    socket = io();
} else {
    console.error("Socket.io library failed to load!");
}

// -----------------------------
// STATE
// -----------------------------
let username = "Guest"; // Default name
let carX = 500, carY = 300, carSpeed = 2;
let charX = 0, charY = 0, charSpeed = 2, charFrame = 1, charDir = "down", charVisible = false;
let mode = "car"; 
let isChatting = false; 
const keys = {};

// -----------------------------
// LOGIN LOGIC
// -----------------------------
joinBtn.addEventListener("click", () => {
    const nameValue = usernameInput.value.trim();
    if (nameValue !== "") {
        username = nameValue; // Set the global username
        loginOverlay.style.display = "none"; // Hide login screen
        console.log("Logged in as:", username);
    } else {
        alert("Please enter a name to join the chat.");
    }
});

// -----------------------------
// INPUT LISTENERS
// -----------------------------
document.addEventListener("keydown", e => {
    // Prevent movement if typing in login or chat
    if (document.activeElement === usernameInput) return;

    keys[e.key] = true;

    // CHAT TOGGLES
    if (e.key === "0") {
        chatContainer.style.display = "flex";
        chatInput.focus();
    }
    if (e.key === "9") {
        chatContainer.style.display = "none";
        chatInput.blur();
    }

    // MODE TOGGLES
    if (e.key === "3") { mode = "character"; charVisible = true; character.style.display = "block"; charX = carX + 130; charY = carY; }
    if (e.key === "4") { mode = "car"; charVisible = false; character.style.display = "none"; }
    if (e.key === "1") bgm.play();
    if (e.key === "2") bgm.pause();
});

document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// CHAT LOGIC
// -----------------------------
chatInput.addEventListener("focus", () => { isChatting = true; });
chatInput.addEventListener("blur", () => { isChatting = false; });

chatInput.addEventListener("keydown", (e) => {
    e.stopPropagation(); 

    if (e.key === "Enter") {
        if (chatInput.value.trim() !== "") {
            // ATTACH NAME HERE: We send an object with 'user' and 'text'
            if (socket) {
                socket.emit('send_message', { 
                    user: username, 
                    text: chatInput.value 
                });
            }
            chatInput.value = "";
        }
        chatInput.blur(); 
    }
});

if (socket) {
    socket.on('receive_message', (data) => {
        const msg = document.createElement("div");
        // DISPLAY NAME HERE: Uses the name sent from the server
        msg.innerHTML = `<strong style="color: #edb458;">${data.user}:</strong> ${data.text}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// -----------------------------
// GAME LOOP & MOVEMENT
// -----------------------------
function updateCar() {
    if (isChatting || loginOverlay.style.display !== "none") return;
    if (keys["ArrowUp"]) { carY -= carSpeed; car.src = "/static/images/lamboup.png"; }
    if (keys["ArrowDown"]) { carY += carSpeed; car.src = "/static/images/lambodown.png"; }
    if (keys["ArrowLeft"]) { carX -= carSpeed; car.src = "/static/images/lamboleft.png"; }
    if (keys["ArrowRight"]) { carX += carSpeed; car.src = "/static/images/lamboright.png"; }
    car.style.left = carX + "px";
    car.style.top = carY + "px";
}

function updateCharacter() {
    if (isChatting || loginOverlay.style.display !== "none") return;
    let moved = false;
    if (keys["ArrowUp"]) { charY -= charSpeed; charDir = "up"; moved = true; }
    if (keys["ArrowDown"]) { charY += charSpeed; charDir = "down"; moved = true; }
    if (keys["ArrowLeft"]) { charX -= charSpeed; charDir = "left"; moved = true; }
    if (keys["ArrowRight"]) { charX += charSpeed; charDir = "right"; moved = true; }

    if (moved) {
        charFrame = (charFrame % 3) + 1;
        character.src = `/static/images/character_${charDir}_${charFrame}.png`;
    }
    character.style.left = charX + "px";
    character.style.top = charY + "px";
}

function loop() {
    if (mode === "car") updateCar();
    else if (mode === "character") updateCharacter();
    requestAnimationFrame(loop);
}

loop();