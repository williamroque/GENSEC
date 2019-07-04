import socket
import sys

from errno import ENETUNREACH

host = '127.0.0.1'
port = 8888

BUFFER_SIZE = 2000

try:
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.settimeout(5)
    client.connect((host, port))
    client.settimeout(None)
except socket.timeout:
    print('Could not connect to server.')
    sys.exit(0)
except IOError as e:
    if e.errno == ENETUNREACH:
        print('Client not connected.')
        sys.exit(0)

mes = b'request_data'

data = ''

client.send(mes)

while True:
    rec_data = client.recv(BUFFER_SIZE).decode('utf-8')

    if rec_data[-4:] == 'exit':
        data += rec_data[:-4]
        break
    data += rec_data

sample_message = 'add\n{}'

sample_row = '1234;1234;1234;1234;1234;1234;1234;1234;1234'
sample_message_body = sample_row + '|data/integrantes.csv'

client.send(sample_message.format(sample_message_body).encode('utf-8'))

client.send(b'exit')

data = data.strip()
print(data)

client.close()
