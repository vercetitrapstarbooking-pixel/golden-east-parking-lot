# CRITICAL: Monkey patch must happen BEFORE importing Flask or SocketIO
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
# Switched to async_mode='eventlet' to match the Gunicorn worker
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    max_http_buffer_size=10000000, 
    ping_timeout=20,
    async_mode='eventlet' 
)

@app.route("/")
def index():
    return render_template("index.html")

# -----------------------------
# STANDARD CHAT LOGIC
# -----------------------------
@socketio.on('send_message')
def handle_message(data):
    emit('receive_message', data, broadcast=True)

# ---------------------------------------------------------
# NUEVO BYTE VIRTUAL CONSOLE LOGIC
# ---------------------------------------------------------
@socketio.on('stream_sync')
def handle_streaming(data):
    # High-speed lane for GTA VI / Virtual Console data
    emit('render_update', data, broadcast=True, include_self=False)

@socketio.on('initialize_nuevo_byte')
def init_performance(data):
    user = data.get('user', 'Guest')
    print(f"[RTLANTIS OS] Virtual Console Active for: {user}")
    # Use request.sid to target the specific joining citizen
    emit('system_status', {'status': 'RAM_SWITCH_ENGAGED'}, room=request.sid)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    # '0.0.0.0' enables access for Smart TVs and Cell Phones
    socketio.run(app, host='0.0.0.0', port=port)