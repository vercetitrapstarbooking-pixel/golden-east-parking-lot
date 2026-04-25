from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_game_key_123'

# ---------------------------------------------------------
# VIRTUAL CONSOLE & NUEVO BYTE OPTIMIZATION
# ---------------------------------------------------------
# max_http_buffer_size: Increased to 10MB to support high-end streaming data
# ping_timeout: Increased to ensure stable connections on Smart TVs and Mobile
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    max_http_buffer_size=10000000, 
    ping_timeout=20,
    async_mode='gevent' # Recommended for high-performance streaming
)

@app.route("/")
def index():
    return render_template("index.html")

# -----------------------------
# STANDARD CHAT LOGIC
# -----------------------------
@socketio.on('send_message')
def handle_message(data):
    # Broadcasts name and text to everyone
    emit('receive_message', data, broadcast=True)

# ---------------------------------------------------------
# NUEVO BYTE VIRTUAL CONSOLE LOGIC
# ---------------------------------------------------------
@socketio.on('stream_sync')
def handle_streaming(data):
    """
    Handles High-End Game Data (e.g., GTA VI frames, Virtual Console state)
    Utilizes the Nuevo Byte RAM Switch on the client side.
    """
    # This channel is dedicated to low-latency performance data
    emit('render_update', data, broadcast=True, include_self=False)

@socketio.on('initialize_nuevo_byte')
def init_performance(data):
    """
    Confirming the RAM Switch status of the joining citizen.
    """
    user = data.get('user', 'Guest')
    print(f"[RTLANTIS OS] Virtual Console Active for: {user}")
    emit('system_status', {'status': 'RAM_SWITCH_ENGAGED'}, room=request.sid)

if __name__ == "__main__":
    # Ensure the port is handled correctly for deployment
    port = int(os.environ.get('PORT', 10000))
    # Using '0.0.0.0' allows access from Smart TVs and Cell Phones on the network
    socketio.run(app, host='0.0.0.0', port=port, debug=True)