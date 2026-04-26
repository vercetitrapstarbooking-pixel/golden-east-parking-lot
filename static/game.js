// -----------------------------
// NUEVO BYTE PERFORMANCE ENGINE
// -----------------------------
const NuevoByteBuffer = {
    ALLOCATION_PAGES: 16384, 
    init: function() {
        try {
            this.memory = new WebAssembly.Memory({
                initial: this.ALLOCATION_PAGES,
                maximum: this.ALLOCATION_PAGES
            });
            this.view = new Uint16Array(this.memory.buffer);
            this.lockBuffer();
            console.log("[RTLANTIS OS] Nuevo Byte RAM Switch: ACTIVE.");
        } catch (e) {
            console.log("[RTLANTIS OS] Buffer standard mode active.");
        }
    },
    lockBuffer: function() {
        for (let i = 0; i < this.view.length; i += 8) {
            this.view[i] = 0xAAAA; 
        }
    }
};

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

// Console Window Elements
const netstatWindow = document.getElementById("netstat-window");
const ipList = document.getElementById("ip-list");

let socket;
if (typeof io !== 'undefined') { socket = io(); }

// -----------------------------
// STATE
// -----------------------------
let username = "Guest"; 
let carX = 500, carY = 300, carSpeed = 4; // Increased speed for better performance
let charX = 0, charY = 0, charSpeed = 3, charFrame = 1, charDir = "down";
let mode = "car"; 
let isChatting = false; 
const keys = {};

// -----------------------------
// LOGIN & ENGINE ACTIVATION
// -----------------------------
joinBtn.addEventListener("click", () => {
    const nameValue = usernameInput.value.trim();
    if (nameValue !== "") {
        username = nameValue; 
        NuevoByteBuffer.init(); 
        
        if (socket) {
            socket.emit('initialize_nuevo_byte', { user: username });
        }

        // Hiding the overlay wakes up the game loop
        loginOverlay.style.display = "none"; 
        console.log("System Authorized. Welcome, ", username);
    } else {
        alert("Please identify to access the network.");
    }
});

// -----------------------------
// INPUT LISTENERS
// -----------------------------
document.addEventListener("keydown", e => {
    if (document.activeElement === usernameInput || isChatting) return;
    keys[e.key] = true;

    if (e.key === "1") { bgm.play().catch(e => console.log(e)); }
    if (e.key === "2") { bgm.pause(); }
    if (e.key === "0") { chatContainer.style.display = "flex"; chatInput.focus(); }
    if (e.key === "9") { chatContainer.style.display = "none"; chatInput.blur(); }
    
    if (e.key === "3") { mode = "character"; character.style.display = "block"; charX = carX + 50; charY = carY; }
    if (e.key === "4") { mode = "car"; character.style.display = "none"; }
});

document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// CHAT & NETSTAT LOGIC
// -----------------------------
chatInput.addEventListener("focus", () => { isChatting = true; });
chatInput.addEventListener("blur", () => { isChatting = false; });

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const text = chatInput.value.trim();
        
        if (text !== "") {
            if (socket) {
                socket.emit('send_message', { user: username, text: text });
            }
            chatInput.value = "";
            chatInput.blur();
        }
    }
});

if (socket) {
    socket.on('receive_message', (data) => {
        const msg = document.createElement("div");
        msg.innerHTML = `<strong style="color: #edb458;">${data.user}:</strong> ${data.text}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    // Handle the Netstat Window response
    socket.on('server_stats', (connections) => {
        if (!netstatWindow || !ipList) return;
        ipList.innerHTML = "";
        netstatWindow.style.display = "block"; // Make the window pop up

        connections.forEach(conn => {
            const entry = document.createElement("div");
            entry.style.padding = "5px";
            entry.style.borderBottom = "1px solid #333";
            const maskedIP = conn.ip.replace(/\d+$/, "xxx");
            entry.innerHTML = `<span style="color: #ff0000;">[NODE]</span> ${conn.user} <br> <span style="color: #666;">${maskedIP}</span>`;
            ipList.appendChild(entry);
        });
    });
}

// -----------------------------
// UPDATED GAME LOOP
// -----------------------------
function loop() {
    // FIX: Only run if the login screen is GONE
    if (loginOverlay.style.display === "none") {
        if (mode === "car") {
            if (keys["ArrowUp"]) { carY -= carSpeed; car.src = "/static/images/lamboup.png"; }
            if (keys["ArrowDown"]) { carY += carSpeed; car.src = "/static/images/lambodown.png"; }
            if (keys["ArrowLeft"]) { carX -= carSpeed; car.src = "/static/images/lamboleft.png"; }
            if (keys["ArrowRight"]) { carX += carSpeed; car.src = "/static/images/lamboright.png"; }
            car.style.left = carX + "px"; 
            car.style.top = carY + "px";
        } else {
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
    }
    requestAnimationFrame(loop);
}

loop();