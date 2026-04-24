from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_game_key_123'

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("index.html")

# --- CHAT EVENTS ---

@socketio.on('send_message')
def handle_message(data):
    """
    Handles the incoming dictionary: {'user': 'Name', 'text': 'Message'}
    """
    # This pulls the specific fields out of the object for your server logs
    username = data.get('user', 'Unknown')
    message_text = data.get('text', '')
    
    print(f"CHAT LOG: [{username}] says: {message_text}")
    
    # This sends the WHOLE object back to everyone so their 
    # game.js can see both the name and the text.
    emit('receive_message', data, broadcast=True)

if __name__ == "__main__":
    # Standard Render port logic
    port = int(os.environ.get('PORT', 10000))
    socketio.run(app, host='0.0.0.0', port=port)