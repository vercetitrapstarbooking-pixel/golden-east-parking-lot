// -----------------------------
// ELEMENTS & INITIALIZATION
// -----------------------------
const car = document.getElementById("car");
const character = document.getElementById("character");
const bgm = document.getElementById("bgm");
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");

// Radio Stream Configuration
const streamUrl = "http://37.157.242.105:3847/;";

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
let username = "Guest"; 
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
        username = nameValue; 
        loginOverlay.style.display = "none"; 
        console.log("Logged in as:", username);
    } else {
        alert("Please enter a name to join the chat.");
    }
});

// -----------------------------
// INPUT LISTENERS
// -----------------------------
document.addEventListener("keydown", e => {
    if (document.activeElement === usernameInput) return;
    if (isChatting) return; 

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

    // MODE TOGGLES (3 = Person, 4 = Car)
    if (e.key === "3") { 
        mode = "character"; 
        charVisible = true; 
        character.style.display = "block"; 
        charX = carX + 130; 
        charY = carY; 
    }
    if (e.key === "4") { 
        mode = "car"; 
        charVisible = false; 
        character.style.display = "none"; 
    }

    // RADIO CONTROLS (R = ON, T = OFF)
    if (e.key.toLowerCase() === "r" || e.key === "1") {
        bgm.src = streamUrl; 
        bgm.load();
        bgm.play();
    }
    if (e.key.toLowerCase() === "t" || e.key === "2") {
        bgm.pause();
        bgm.src = ""; 
    }
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
    
    // Check direction keys
    if (keys["ArrowUp"]) { charY -= charSpeed; charDir = "up"; moved = true; }
    if (keys["ArrowDown"]) { charY += charSpeed; charDir = "down"; moved = true; }