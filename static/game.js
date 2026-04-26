// -----------------------------
// NUEVO BYTE PERFORMANCE ENGINE (Initialization)
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
            console.log("[RTLANTIS OS] Nuevo Byte RAM Switch: ACTIVE. Buffer Ready.");
        } catch (e) {
            console.log("[RTLANTIS OS] Buffer standard mode active (HW Constraints).");
        }
    },

    lockBuffer: function() {
        for (let i = 0; i < this.view.length; i += 8) {
            this.view[i] = 0xAAAA; 
        }
        if (window.performance && window.performance.mark) {
            performance.mark("nuevo-byte-lock");
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

// Console Window Elements for NETSTAT
const netstatWindow = document.getElementById("netstat-window");
const ipList = document.getElementById("ip-list");

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
// LOGIN LOGIC (Nuevo Byte Integration)
// -----------------------------
joinBtn.addEventListener("click", () => {
    const nameValue = usernameInput.value.trim();
    if (nameValue !== "") {
        username = nameValue; 
        NuevoByteBuffer.init(); 
        
        // Notify server that Nuevo Byte is initialized for this user
        if (socket) {
            socket.emit('initialize_nuevo_byte', { user: username });
        }

        loginOverlay.style.display = "none"; 
        console.log("Logged in as:", username);
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

    if (e.key === "1") { 
        bgm.loop = true;
        bgm.play().catch(err => console.log("Playback error:", err)); 
    }
    if (e.key === "2") { bgm.pause(); }

    if (e.key === "0") { chatContainer.style.display = "flex"; chatInput.focus(); }
    if (e.key === "9") { chatContainer.style.display = "none"; chatInput.blur(); }
    
    if (e.key === "3") { mode = "character"; character.style.display = "block"; charX = carX + 130; charY = carY; }
    if (e.key === "4") { mode = "car"; character.style.display = "none"; }
});

document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// CHAT & NETWORK LOGIC
// -----------------------------
chatInput.addEventListener("focus", () => { isChatting = true; });
chatInput.addEventListener("blur", () => { isChatting = false; });
chatInput.addEventListener("keydown", (e) => {
    e.stopPropagation(); 
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        const text = chatInput.value;
        if (socket) socket.emit('send_message', { user: username, text: text });
        chatInput.value = "";
        chatInput.blur();
    }
});

if (socket) {
    // Listener for standard chat
    socket.on('receive_message', (data) => {
        const msg = document.createElement("div");
        msg.innerHTML = `<strong style="color: #edb458;">${data.user}:</strong> ${data.text}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    // --- NUEVO BYTE NETSTAT LISTENER ---
    socket.on('server_stats', (connections) => {
        if (!netstatWindow || !ipList) return;
        
        ipList.innerHTML = ""; // Clear existing nodes
        netstatWindow.style.display = "block"; // Pop up the red box

        connections.forEach(conn => {
            const entry = document.createElement("div");
            entry.style.marginBottom = "8px";
            entry.style.borderLeft = "2px solid #00ff00";