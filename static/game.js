// -----------------------------
// ELEMENTS & INITIALIZATION
// -----------------------------
const car = document.getElementById("car");
const character = document.getElementById("character");
const bgm = document.getElementById("bgm");
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");
const loginOverlay = document.getElementById("login-overlay");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");

let socket;
if (typeof io !== 'undefined') { socket = io(); }

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
        // Music no longer starts here automatically
    } else {
        alert("Please enter a name to join.");
    }
});

// -----------------------------
// INPUT LISTENERS
// -----------------------------
document.addEventListener("keydown", e => {
    if (document.activeElement === usernameInput || isChatting) return;
    keys[e.key] = true;

    // --- MUSIC CONTROLS ---
    // Press "1" to play local music.mp3
    if (e.key === "1") { 
        bgm.loop = true;
        bgm.play().catch(err => console.log("Playback error:", err)); 
    }
    // Press "2" to pause the music
    if (e.key === "2") { 
        bgm.pause(); 
    }

    // --- INTERFACE CONTROLS ---
    if (e.key === "0") { chatContainer.style.display = "flex"; chatInput.focus(); }
    if (e.key === "9") { chatContainer.style.display = "none"; chatInput.blur(); }
    
    // --- MODE SWITCHING ---
    if (e.key === "3") { mode = "character"; character.style.display = "block"; charX = carX + 130; charY = carY; }
    if (e.key === "4") { mode = "car"; character.style.display = "none"; }
});
document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// CHAT LOGIC
// -----------------------------
chatInput.addEventListener("focus", () => { isChatting = true; });
chatInput.addEventListener("blur", () => { isChatting = false; });
chatInput.addEventListener("keydown", (e) => {
    e.stopPropagation(); 
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        if (socket) socket.emit('send_message', { user: username, text: chatInput.value });
        chatInput.value = "";
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
// GAME LOOP
// -----------------------------
function updateCar() {
    if (loginOverlay.style.display !== "none") return;
    if (keys["ArrowUp"]) { carY -= carSpeed; car.src = "/static/images/lamboup.png"; }
    if (keys["ArrowDown"]) { carY += carSpeed; car.src = "/static/images/lambodown.png"; }
    if (keys["ArrowLeft"]) { carX -= carSpeed; car.src = "/static/images/lamboleft.png"; }
    if (keys["ArrowRight"]) { carX += carSpeed; car.src = "/static/images/lamboright.png"; }
    car.style.left = carX + "px"; car.style.top = carY + "px";
}

function updateCharacter() {
    if (loginOverlay.style.display !== "none") return;
    let moved = false;
    if (keys["ArrowUp"]) { charY -= charSpeed; charDir = "up"; moved = true; }
    if (keys["ArrowDown"]) { charY += charSpeed; charDir = "down"; moved = true; }
    if (keys["ArrowLeft"]) { charX -= charSpeed; charDir = "left"; moved = true; }
    if (keys["ArrowRight"]) { charX += charSpeed; charDir = "right"; moved = true; }
    if (moved) {
        charFrame = (charFrame % 3) + 1;
        character.src = `/static/images/character_${charDir}_${charFrame}.png`;
    }
    character.style.left = charX + "px"; character.style.top = charY + "px";
}

function loop() {
    if (mode === "car") updateCar(); else updateCharacter();
    requestAnimationFrame(loop);
}
loop();