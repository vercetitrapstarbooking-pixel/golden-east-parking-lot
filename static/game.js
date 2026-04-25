// ELEMENTS
const car = document.getElementById("car");
const character = document.getElementById("character");
const bgm = document.getElementById("bgm");
const loginOverlay = document.getElementById("login-overlay");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");

let socket = io();

// STATE
let username = "Guest";
let mode = "car"; 
let isChatting = false;
let carX = 500, carY = 300, carSpeed = 4;
let charX = 0, charY = 0, charSpeed = 3, charDir = "down", charFrame = 1;
const keys = {};

// LOGIN LOGIC
function handleLogin() {
    const val = usernameInput.value.trim();
    if (val !== "") {
        username = val;
        loginOverlay.style.display = "none";
        bgm.play().catch(() => console.log("Music blocked. Check Site Settings for 'Insecure Content'"));
    }
}

joinBtn.addEventListener("click", handleLogin);
usernameInput.addEventListener("keydown", (e) => { if(e.key === "Enter") handleLogin(); });

// CHAT LOGIC
document.addEventListener("keydown", e => {
    if (loginOverlay.style.display !== "none" && !isChatting) {
        if (e.key === "0") { chatContainer.style.display = "flex"; chatInput.focus(); }
        if (e.key === "9") { chatContainer.style.display = "none"; chatInput.blur(); }
        if (e.key === "3") { mode = "character"; character.style.display = "block"; charX = carX + 50; charY = carY; }
        if (e.key === "4") { mode = "car"; character.style.display = "none"; }
    }
    keys[e.key] = true;
});

document.addEventListener("keyup", e => keys[e.key] = false);

chatInput.addEventListener("focus", () => isChatting = true);
chatInput.addEventListener("blur", () => isChatting = false);
chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        socket.emit('send_message', { user: username, text: chatInput.value });
        chatInput.value = "";
    }
    e.stopPropagation();
});

socket.on('receive_message', data => {
    const msg = document.createElement("div");
    msg.innerHTML = `<b style="color:#edb458">${data.user}:</b> ${data.text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// GAME LOOP
function update() {
    if (loginOverlay.style.display === "none") {
        if (mode === "car" && !isChatting) {
            if (keys["ArrowUp"]) carY -= carSpeed;
            if (keys["ArrowDown"]) carY += carSpeed;
            if (keys["ArrowLeft"]) carX -= carSpeed;
            if (keys["ArrowRight"]) carX += carSpeed;
            car.style.left = carX + "px"; car.style.top = carY + "px";
        } else if (mode === "character" && !isChatting) {
            if (keys["ArrowUp"]) charY -= charSpeed;
            if (keys["ArrowDown"]) charY += charSpeed;
            if (keys["ArrowLeft"]) charX -= charSpeed;
            if (keys["ArrowRight"]) charX += charSpeed;
            character.style.left = charX + "px"; character.style.top = charY + "px";
        }
    }
    requestAnimationFrame(update);
}
update();