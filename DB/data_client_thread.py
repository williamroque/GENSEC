import threading

import numpy as np

import fcntl

import os

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

    def load_data(self, path):
        if os.path.exists(path):
            with open(path, 'r') as f:
                rows = f.read().split('\n')
                list_data = [row.split(';') for row in rows]
                self.data = np.array(list_data)

                self.sort()

            return False
        else:
            return True
    def as_string(self):
        return '\n'.join([';'.join(row) for row in self.data])

    def write(self, file):
        with open(file, 'w+') as f:
            fcntl.flock(f, fcntl.LOCK_EX)
            f.write(self.as_string())
            fcntl.flock(f, fcntl.LOCK_UN)

    def sort(self):
        search_column = self.data[:, 0]
        search_column = search_column.astype(np.float)
        search_column = search_column.argsort()

        self.data = self.data[search_column]

    def search(self, n):
        search_column = self.data[:, 0]
        search_column = search_column.astype(np.float)
        return np.searchsorted(search_column, n) - 1

    def delete(self, row, file):
        i = self.search(row[0])
        self.data = np.delete(self.data, i, 0)
        self.write(file)

    def add(self, row, file):
        i = self.search(row[0])
        self.data = np.insert(self.data, i, row, 0)
        self.write(file)

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            mes = mes.decode('utf-8')

            message_rows = mes.split('\n') + ['']
            command, body, *_ = message_rows

            if command:
                print(command, body)

            if command == 'request_data':
                path = 'data/' + body

                break_requested = self.load_data(path)
                if break_requested:
                    print(path, 'not found.')
                    self.connection.send(b'exit')
                    self.connection.close()
                    break

                data = self.as_string()
                self.connection.send(data.encode('utf-8'))

                self.connection.send(b'exit')

            elif command == 'add':
                row, file = body.split('|')

                break_requested = self.load_data(path)
                if break_requested:
                    self.connection.send(b'exit')
                    break

                row = np.array([int(x) for x in row.split(';')])

                self.add(row, file)

            elif command == 'delete':
                row, file = body.split('|')

                break_requested = self.load_data(path)
                if break_requested:
                    self.connection.send(b'exit')
                    break

                row = np.array([int(x) for x in row.split(';')])

                self.delete(row, file)

            elif command == 'exit':
                self.connection.close()
                print('Done.')
                break

