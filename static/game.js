// -----------------------------
// LOGIN LOGIC
// -----------------------------
joinBtn.addEventListener("click", () => {
    const nameValue = usernameInput.value.trim();
    if (nameValue !== "") {
        username = nameValue; 
        loginOverlay.style.display = "none"; 
        
        // --- MUSIC TRIGGER START ---
        // This bypasses the browser's "no-autoplay" rule 
        // because the user clicked a button.
        bgm.play().catch(error => {
            console.log("Music play failed - browser blocked it:", error);
        });
        bgm.loop = true; // Keeps the vibe going forever
        // --- MUSIC TRIGGER END ---

        console.log("Logged in as:", username);
    } else {
        alert("Please enter a name to join.");
    }
});