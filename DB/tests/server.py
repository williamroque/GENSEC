import socket
import rsa
import hashlib
import json
import sys

ip = '127.0.0.1'
port = 5000

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind((ip, port))

server.listen(4)
conn, addr = server.accept()

credentials = {}

def c_hash(m):
    return hashlib.sha256(m.encode('utf-8')).hexdigest()

def load_credentials():
    with open('credentials.json') as f:
        global credentials
        credentials = json.loads(f.read())

def valid_credentials(u, p):
    load_credentials()

    if u in credentials:
        if credentials[u] == c_hash(p):
            return True
    return False

def send_encrypted(msg, pub, conn):
    conn.send(rsa.encrypt(msg, pub).encode('utf-8'))

def rec_encrypted(prv):
    return rsa.decrypt(conn.recv(1024).decode('utf-8'), prv)

pub_key, prv_key = rsa.generate_keys()

try:
    client_key = conn.recv(1024).decode('utf-8').split('|')
    s_test = rsa.encrypt('patently-debatable-1208', client_key)
    conn.send('{};{}'.format('|'.join(map(str, pub_key)), s_test).encode('utf-8'))

    username, password = rec_encrypted(prv_key).split(';')
except Exception:
    print('Failed to establish connection.')
    sys.exit(0)

if not valid_credentials(username, password):
    print('Invalid credentials.')
    sys.exit(0)

print('All good!')
