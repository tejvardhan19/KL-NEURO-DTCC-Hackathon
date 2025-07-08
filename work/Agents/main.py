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
from SocketApp import socketio, app
import subprocess
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

active_connections = {}

# Store session-specific context (e.g., for each client/session ID)
session_context = {}

def wsend(event: str, data: str):
    socketio.emit(event, {'data': data})
    socketio.sleep(0)

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    active_connections[sid] = time.time()
    session_context[sid] = {}  # Initialize context for this client
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
    active_connections.pop(sid, None)
    session_context.pop(sid, None)
    logger.info(f"Client disconnected: {sid}")

@socketio.on('client_keepalive')
def handle_client_keepalive(data):
    sid = request.sid
    if sid in active_connections:
        active_connections[sid] = time.time()
        socketio.emit('keepalive_ack', {'server_time': time.time()}, room=sid)

@socketio.on('prompt')
def handle_prompt(data):
    sid = request.sid
    name = data['name']
    prompt = data['prompt']

    wsend("update", "Writing Solidity code")
    WriteSol(name, prompt)

    wsend("update", "saving contract file")
    filepath = f"X:\\DTCC_HACK\\work\\hard\\contracts\\{name}.sol"
    with open(filepath, "r") as file:
        code = file.read()

    wsend("update", "extracting constructor inputs")
    constructor_fields = extract_constructor_parameters(code)
    wsend("workflowt", "> Extracting inputs")
    wsend("request_inputs", {"fields": constructor_fields})

    contract_match = re.search(r'contract\s+(\w+)', code)
    contract_name = contract_match.group(1) if contract_match else "Generated"

    # Store values for later
    session_context[sid] = {
        "name": name,
        "working_code": code,
        "inp": constructor_fields,
        "contract_name": contract_name
    }

@socketio.on('inputs_response')
def handle_input_response(data):
    sid = request.sid
    context = session_context.get(sid, {})
    if not context:
        wsend("workflowt", "Error: No context found for session.")
        return

    inp = context.get("inp", [])
    contract_name = context.get("contract_name", "Unknown")
    working_code = context.get("working_code", "")
    name = context.get("name", "Unknown")

    print("CONTRACT NAME\n", contract_name)

    try:
        construct_values = [data[field] for field in inp]
    except KeyError as e:
        wsend("workflowt", f"Missing input value for field: {e}")
        return

    wsend("update", "generating deploy script")
    print("Constructor values:", construct_values)

    generate_deploy_script(name=contract_name, args=construct_values)
    wsend("update", "generating hardhat config")
    generate_hardhat_config()
    wsend("update", "creating Test cases")
    generate_tests(working_code, name)
    wsend("update", "deploying code")
    subprocess.run(["node", "scripts/deploy.js"], cwd="X:\\DTCC_HACK\\work\\hard")
    wsend("update", "end")

if __name__ == '__main__':
    logger.info("Starting backend server")
    socketio.run(app, host='127.0.0.1', port=5000, debug=True, use_reloader=False)
