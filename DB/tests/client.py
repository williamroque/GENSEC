import socket
import sys
import rsa
from errno import ENETUNREACH

ip = '127.0.0.1'
port = 5000

try:
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.settimeout(30)
    client.connect((ip, port))
except socket.timeout:
    print('Could not connect to server.')
    sys.exit(0)
except IOError as e:
    if e.errno == ENETUNREACH:
        print('Client not connected.')
        sys.exit(0)

def send_encrypted(msg, pub):
    client.send(rsa.encrypt(msg, pub).encode('utf-8'))

def rec_encrypted(prv):
    data = ''
    mes = client.recv(1024).decode('utf-8')
    while True:
        if mes[-4:] == 'exit':
            data += mes[:-4]
            break
        data += mes
        mes = client.recv(1024).decode('utf-8')
    return rsa.decrypt(data, prv)

pub_key, prv_key = rsa.generate_keys()

client.send('|'.join(map(str, pub_key)).encode('utf-8'))

server_key, s_test = client.recv(1024).decode('utf-8').split(';')

server_key = server_key.split('|')
s_test = rsa.decrypt(s_test, prv_key)

if s_test == 'patently-debatable-1208':
    send_encrypted('jetblack;viennablues', server_key)

send_encrypted('request_data\nintegrantes-operacao', server_key)
print(rec_encrypted(prv_key))
