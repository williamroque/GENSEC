import threading
import fcntl
import os

import socket

import json
import numpy as np

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

    def expand_path(self, path):
        try:
            self.filesystem
        except AttributeError:
            with open('data/filesystem.json', 'r') as f:
                self.filesystem = json.load(f)['filesystem']

        try:
            file_path = 'data/' + self.filesystem[path]
            if os.path.exists(file_path):
                return file_path
            else:
                return 'file_not_found'
        except:
            return 'file_does_not_exist'

    def load_data(self, path):
        path = self.expand_path(path)

        if path != 'file_not_found' and path != 'file_does_not_exist':
            with open(path, 'r') as f:
                rows = f.read().split('\n')
                self.data = np.array([[row.split(';')[0]] + [col.split('|') for col in row.split(';')[1:]] for row in rows])

                self.sort()
            return True
        return False

    def as_string(self, callback):
        return '\n'.join([';'.join(callback(row)) for row in self.data])

    def write(self, file):
        try:
            with open(file, 'w+') as f:
                fcntl.flock(f, fcntl.LOCK_EX)
                format_ints = lambda row: [str(row[0])] + ['|'.join([str(char) for char in text]) for text in row[1:]]
                row_string = self.as_string(format_ints)
                if row_string:
                    f.write(row_string)
                    self.connection.send(b'write_successful')
                else:
                    self.connection.send(b'write_failed')
                    raise Exception('String empty.')
                fcntl.flock(f, fcntl.LOCK_UN)
        except:
            self.connection.send(b'exit')

    def sort(self):
        search_column = self.data[:, 0]
        search_column = search_column.astype(np.float)
        search_column = search_column.argsort()

        self.data = self.data[search_column]

    def search(self, n):
        search_column = self.data[:, 0]
        search_column = search_column.astype(np.float)
        return np.searchsorted(search_column, n)

    def delete(self, row, file):
        i = self.search(row[0])
        self.data = np.delete(self.data, i, 0)
        self.write(file)

    def add(self, row, file):
        i = self.search(row[0])
        int_row = [row[0]] + [[ord(char) for char in text] for text in row[1:]]
        self.data = np.insert(self.data, i, int_row, 0)
        self.write(file)

    def handle_add(self, body):
        row, file = body.split('|')

        load_successful = self.load_data(file)
        if not load_successful:
            self.connection.send(b'exit')
            return False

        row = row.split(';')
        row_id = int('0'.join([str(ord(char)) for x in row for char in x]))

        self.add(np.array([row_id] + row), self.expand_path(file))
        self.connection.send(b'exit')

        return True

    def handle_delete(self, body):
        row, file = body.split('|')

        load_successful = self.load_data(path)
        if not load_successful:
            self.connection.send(b'exit')
            return False

        row = np.array([int(x) for x in row.split(';')])

        self.delete(row, file)

        return True

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            mes = mes.decode('utf-8')

            message_rows = mes.split('\n') + ['']
            command, body, *_ = message_rows

            if command:
                print(command, body)

            if command == 'request_data':
                load_successful = self.load_data(body)
                if not load_successful:
                    print(body, 'not found.')
                    self.connection.send(b'exit')
                    self.connection.close()
                    break

                convert_to_chars = lambda row: [''.join([chr(int(char)) for char in text]) for text in row[1:]]
                data = self.as_string(convert_to_chars)

                self.connection.send(data.encode('utf-8'))

                self.connection.send(b'exit')

            elif command == 'add':
                if not self.handle_add(body):
                    break
            elif command == 'delete':
                if not self.handle_delete(body):
                    break
            elif command == 'update':
                original, updated = body.split('%')

                if not (self.handle_delete(original) and self.handle_add(update)):
                    break

            elif command == 'exit':
                self.connection.close()
                print('Done.')
                break

