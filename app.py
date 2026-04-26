import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import os 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_game_key_123'

# ---------------------------------------------------------
# VIRTUAL CONSOLE & NUEVO BYTE OPTIMIZATION
# ---------------------------------------------------------
# async_mode='eventlet' is the industry standard for production Socket.io
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    max_http_buffer_size=10000000, 
    ping_timeout=20,
    async_mode='eventlet' 
)

# Global tracker for NETSTAT commands
active_connections = {}

@app.route("/")
def index():
    return render_template("index.html")

# -----------------------------
# NETWORK EVENT TRACKING
# -----------------------------
@socketio.on('connect')
def handle_connect():
    # Initial handshake: capture the IP and Session ID
    active_connections[request.sid] = {
        "ip": request.remote_addr, 
        "user": "Connecting...",
        "node": request.sid[:5] # Short ID for the console
    }
    print(f"[ATLANTIS] New connection established at {request.remote_addr}")

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in active_connections:
        user = active_connections[request.sid].get('user')
        del active_connections[request.sid]
        print(f"[ATLANTIS] Node {user} disconnected.")

# -----------------------------
# STANDARD CHAT & NETSTAT
# -----------------------------
@socketio.on('send_message')
def handle_message(data):
    username = data.get('user', 'Unknown')
    message_text = data.get('text', '')
    
    # Update the tracker with the active username
    if request.sid in active_connections:
        active_connections[request.sid]["user"] = username

    # COMMAND CHECK: NETSTAT
    if message_text.lower() == "netstat":
        # Package only the necessary data for the side window
        emit('server_stats', list(active_connections.values()), room=request.sid)
    else:
        # Standard broadcast
        emit('receive_message', data, broadcast=True)

# ---------------------------------------------------------
# NUEVO BYTE VIRTUAL CONSOLE LOGIC
# ---------------------------------------------------------
@socketio.on('stream_sync')
def handle_streaming(data):
    # High-speed lane for heavy data packets
    emit('render_update', data, broadcast=True, include_self=False)

@socketio.on('initialize_nuevo_byte')
def init_performance(data):
    user = data.get('user', 'Guest')
    print(f"[RTLANTIS OS] Virtual Console Active for: {user}")
    emit('system_status', {'status': 'RAM_SWITCH_ENGAGED'}, room=request.sid)

if __name__ == "__main__":
    # Render port logic
    port = int(os.environ.get('PORT', 10000))
    socketio.run(app, host='0.0.0.0', port=port)