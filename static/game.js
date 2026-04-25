// -----------------------------
// LOGIN LOGIC
// -----------------------------

// 1. Define the login action in one place
function handleLogin() {
    const nameValue = usernameInput.value.trim();
    if (nameValue !== "") {
        username = nameValue; 
        loginOverlay.style.display = "none"; 
        
        // --- MUSIC TRIGGER START ---
        // This bypasses the browser's "no-autoplay" rule 
        // because the user clicked a button or pressed Enter.
        bgm.play().catch(error => {
            console.log("Music play failed - browser blocked it:", error);
        });
        bgm.loop = true; 
        // --- MUSIC TRIGGER END ---

        console.log("Logged in as:", username);
    } else {
        alert("Please enter a name to join.");
    }
}

// 2. Listener for the Mouse Click
joinBtn.addEventListener("click", handleLogin);

// 3. Listener for the 'Enter' Key specifically on the input field
usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleLogin();
    }
});