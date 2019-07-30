import threading
import fcntl
import os

import socket

import json

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

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
        self.connection.send(b'exit')
        return write_successful

    def add(self, row, i = -1):
        row = row.split(';')
        fill_empty = lambda x: '@' if x == '' else x

        row = list(map(fill_empty, row))

        i = len(self.data) if i == -1 else i
        self.data.insert(int(i), row)

    def delete(self, i):
        self.data.pop(int(i))

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            mes = mes.decode('utf-8')

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
                    self.connection.send(b'exit')
                    break

                print(command, body)

            if command == 'request_data':
                data = self.as_string()
                data = data.replace('@', '')

                self.connection.send(data.encode('utf-8'))
                self.connection.send(b'exit')

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

