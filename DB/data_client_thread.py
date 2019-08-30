import threading

import fcntl
import os

import socket
import errno

import json

import datetime

import rsa
import hashlib

import thread_clock

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

        self.last_request = datetime.datetime.now()

        self.pub_key, self.prv_key = rsa.generate_keys()

        t_clock = thread_clock.ThreadClock(self.ping)
        t_clock.start()

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
                    self.send_encrypted('write_successful')
                    self.connection.send(b'exit')
                    return True
                else:
                    raise Exception('String empty.')
                fcntl.flock(f, fcntl.LOCK_UN)
        except Exception as e:
            self.send_encrypted(b'write_failed')
            self.connection.send(b'exit')
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
        self.connection.send(
            '{}:{}'.format(
                rsa.encrypt(self.hash(msg), self.prv_key),
                rsa.encrypt(msg, self.client_key)
            ).encode('utf-8')
        )

    def rec_encrypted(self):
        try:
            data = self.connection.recv(1024).decode('utf-8')
        except socket.error as e:
            if e.errno != errno.ECONNRESET:
                raise
            return

        if not data:
            return

        data = data.split(':')
        if len(data) == 2:
            if data[0] and data[1]:
                h = rsa.decrypt(data[0], self.client_key, True)
                b = rsa.decrypt(data[1], self.prv_key)
                if h == self.hash(b):
                    return b
        print('Invalid data.')
        return ''

    def ping(self):
        self.connection.send(b'ping')

    def run(self):
        l_successful = False

        try:
            self.client_key = self.connection.recv(1024).decode('utf-8').split('|')

            if not self.client_key or self.client_key[0] == 'exit':
                return

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
                mes = self.rec_encrypted()

                if not mes:
                    break

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

                if command == 'request_data':
                    data = self.as_string()
                    data = data.replace('@', '')

                    self.send_encrypted(data)
                    self.connection.send(b'exit')

                elif command == 'add':
                    if not self.handle_mutate(self.add, self.row):
                        break
                elif command == 'delete':
                    if not self.handle_mutate(self.delete, self.row):
                        break
                elif command == 'update':
                    i, newRow = self.row.split('%')

                    self.delete(i)
                    if not self.handle_mutate(self.add, newRow, i):
                        break
                elif command == 'exit':
                    self.connection.close()
                    break

        self.connection.close()
        print('Done.')

