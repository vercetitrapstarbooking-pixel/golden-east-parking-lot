from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os  # Added this to talk to Render's system

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
    Listens for 'send_message' from a client.
    """
    print(f"Message received: {data}")
    # broadcast=True sends the message to EVERYONE connected
    emit('receive_message', data, broadcast=True)

if __name__ == "__main__":
    # This part is updated for Render:
    # It checks if Render gave us a PORT, otherwise it uses 10000
    port = int(os.environ.get('PORT', 10000))
    socketio.run(app, host='0.0.0.0', port=port)