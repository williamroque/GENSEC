import data_server

import socket

import signal
import sys

import threading

# IP for servers
ip = '0.0.0.0'

# Port for data server
data_port = 5000

# Server class implemented in data_server module
data_server = data_server.DataServer(ip, data_port)

# Start thread for data_server.listen method
data_server_thread = threading.Thread(target=data_server.listen)
data_server_thread.start()

def self_connect(port):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((ip, port))
    client.send(b'exit')
    client.close()

# Shutdown server gracefully
def shutdown_server(sig, frame):
    print('\nShutting down server.\n')

    data_server.running = False

    self_connect(data_port)

# Handle SIGINT (Ctrl-c)
signal.signal(signal.SIGINT, shutdown_server)
