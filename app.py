from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_game_key_123'

# Initialize SocketIO
# cors_allowed_origins="*" allows you to test locally without permission issues
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("index.html")

# --- CHAT EVENTS ---

@socketio.on('send_message')
def handle_message(data):
    """
    Listens for 'send_message' from a client.
    'data' usually contains the message text.
    """
    print(f"Message received: {data}")
    
    # broadcast=True sends the message to EVERYONE connected
    emit('receive_message', data, broadcast=True)

if __name__ == "__main__":
    # Use socketio.run instead of app.run
    socketio.run(app, debug=True)