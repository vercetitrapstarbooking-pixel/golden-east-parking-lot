from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_game_key_123'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('send_message')
def handle_message(data):
    # Broadcasts name and text to everyone
    emit('receive_message', data, broadcast=True)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    socketio.run(app, host='0.0.0.0', port=port)