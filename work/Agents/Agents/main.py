from flask import Flask, request
from flask_socketio import SocketIO
import threading
import time
import logging
from Solwriter import WriteSol
from getinp import extract_constructor_parameters
from Writedeploy import generate_deploy_script
from WriteHardHatConfig import generate_hardhat_config
from TestWriter import generate_tests
import subprocess
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app,
                  cors_allowed_origins="*",
                  ping_timeout=300,
                  ping_interval=15,
                  max_http_buffer_size=100 * 1024 * 1024,
                  engineio_logger=True,
                  async_mode='threading')


active_connections = {}

def wsend(event:str,data:str):
    socketio.emit(event, {'data' : data})
    socketio.sleep(0)

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    active_connections[sid] = time.time()
    logger.info(f"Client connected: {sid}")
    

    def keepalive_task():
        while sid in active_connections:
            try:
                socketio.emit('heartbeat', {'ts': time.time()}, room=sid)
                time.sleep(20)
            except:
                break
    
    threading.Thread(target=keepalive_task, daemon=True).start()

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in active_connections:
        del active_connections[sid]
    logger.info(f"Client disconnected: {sid}")

@socketio.on('client_keepalive')
def handle_client_keepalive(data):
    sid = request.sid
    if sid in active_connections:
        active_connections[sid] = time.time()  # Update last active time
        socketio.emit('keepalive_ack', {'server_time': time.time()}, room=sid)


@socketio.on('prompt')
def handle_message(data):
    arg_data ={'prompt' : data['prompt'],'name' : data['name']}
    name = arg_data['name']
    prompt = arg_data['prompt']
    wsend("update","Writing Solidity code")
    WriteSol(name,prompt)
    wsend("update","saving contract file")
    working_code = ''
    with open(f"X:\DTCC_HACK\work\hard\contracts\{name}.sol","r") as file:
        working_code = file.read()
    wsend("update","extracting constructer inputs")
    inp = extract_constructor_parameters(working_code)
    inputvalues = {}
    for i in inp:
        inputvalues[i] = input(f"{i} value -> ")

    constructvalues = list(inputvalues.values())
    name_match = re.search(r'contract\s+(\w+)', working_code)
    contract_name = name_match.group(1) if name_match else "Generated"
    wsend("update","generating deploy script")
    generate_deploy_script(name=contract_name,args=constructvalues)
    wsend("update","generating hardhat config")
    generate_hardhat_config()
    wsend("update","creating Test cases")
    generate_tests(working_code,name)
    wsend("update","deploying code")
    # subprocess.run(["node", "scripts/deploy.js"], cwd="X:\DTCC_HACK\work\hard")
    wsend("update","end")


    # thread = threading.Thread(target=supervisor.run, kwargs={'data':arg_data})
    # thread.daemon = True
    # thread.start()
    return '', 202

if __name__ == '__main__':
    host = '127.0.0.1'
    port = 5000
    logger.info(f"Starting atlas agent server")
    socketio.run(app,
                host=host,
                port=port,
                debug=True,
                use_reloader=False)