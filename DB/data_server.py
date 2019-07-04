import data_client_thread

import socket

class DataServer():
    def __init__(self, ip, port):
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server.bind((ip, port))

        self.threads = []

        self.running = True

    def listen(self):
        while True and self.running:
            self.server.listen(4)
            (conn, (ip, port)) = self.server.accept()

            new_client_thread = data_client_thread.DataClientThread(conn, ip, port)
            new_client_thread.start()

            self.threads.append(new_client_thread)

        self.server.close()

        for thread in self.threads:
            thread.join()

        print('Data server closed.')

