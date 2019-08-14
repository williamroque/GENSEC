import threading
import fcntl
import os

import socket

import json

import datetime

import rsa
import hashlib

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

        self.last_request = datetime.datetime.now()
        self.pub_key, self.prv_key = rsa.generate_keys()

    def expand_path(self, file):
        try:
            self.filesystem
        except AttributeError:
            with open('data/filesystem.json', 'r') as f:
                self.filesystem = json.load(f)['filesystem']

        try:
            file_path = 'data/' + self.filesystem[file]
            if os.path.exists(file_path):
                return file_path
            else:
                return 'file_not_found'
        except:
            return 'file_does_not_exist'

    def load_data(self):
        if self.file != 'file_not_found' and self.file != 'file_does_not_exist':
            with open(self.file, 'r') as f:
                self.data = [row.split(';') for row in f.read().split('\n')]
            return True
        else:
            return False

    def as_string(self):
        return '\n'.join([';'.join(row) for row in self.data])

    def write(self):
        try:
            with open(self.file, 'w+') as f:
                fcntl.flock(f, fcntl.LOCK_EX)
                data_string = self.as_string()
                if data_string:
                    f.write(data_string)
                    self.connection.send(b'write_successful')
                    return True
                else:
                    raise Exception('String empty.')
                fcntl.flock(f, fcntl.LOCK_UN)
        except Exception as e:
            self.connection.send(b'write_failed')
            return False

    def handle_mutate(self, callback, *args):
        callback(*args)

        write_successful = self.write()
        return write_successful

    def add(self, row, i = -1):
        row = row.split(';')
        fill_empty = lambda x: '@' if x == '' else x

        row = list(map(fill_empty, row))

        i = len(self.data) if i == -1 else i
        self.data.insert(int(i), row)

    def delete(self, i):
        self.data.pop(int(i))

    def hash(self, m):
        return hashlib.sha256(m.encode('utf-8')).hexdigest()

    def load_credentials(self):
        self.credentials = {}
        with open('credentials.json') as f:
            self.credentials = json.loads(f.read())

    def valid_credentials(self, u, p):
        self.load_credentials()

        if u in self.credentials:
            if self.credentials[u] == self.hash(p):
                return True
        return False

    def send_encrypted(self, msg):
        self.connection.send(rsa.encrypt(msg, self.pub_key).encode('utf-8'))

    def rec_encrypted(self):
        return rsa.decrypt(self.connection.recv(1024).decode('utf-8'), self.prv_key)

    def run(self):
        l_successful = False

        try:
            self.client_key = self.connection.recv(1024).decode('utf-8').split('|')
            s_test = rsa.encrypt('patently-debatable-1208', self.client_key)
            self.connection.send('{};{}'.format('|'.join(map(str, self.pub_key)), s_test).encode('utf-8'))

            username, password = self.rec_encrypted().split(';')

            if self.valid_credentials(username, password):
                l_successful = True
            else:
                print('Invalid credentials.')
        except Exception as e:
            print(e)
            print('Failed to establish connection.')

        if l_successful:
            while True:
                print('Waiting!')
                mes = self.rec_encrypted()

                message_rows = mes.split('\n') + ['']
                command, body, *_ = message_rows

                if command and body:
                    parsed_body = body.split('|')

                    if len(parsed_body) > 1:
                        self.row, self.file = body.split('|')
                        self.file = self.expand_path(self.file)
                    else:
                        self.file = self.expand_path(body)

                    load_successful = self.load_data()
                    if not load_successful:
                        break

                    print(command, body)

                if command == 'request_data':
                    data = self.as_string()
                    data = data.replace('@', '')

                    self.send_encrypted(data)
                    self.send_encrypted('exit')

                elif command == 'add':
                    if not self.handle_mutate(self.add, self.row):
                        break
                elif command == 'delete':
                    if not self.handle_mutate(self.delete, self.row):
                        break
                elif command == 'update':
                    print(body)

                    i, newRow = self.row.split('%')

                    self.delete(i)
                    if not self.handle_mutate(self.add, newRow, i):
                        break
                elif command == 'exit':
                    self.connection.close()
                    print('Done.')
                    break

